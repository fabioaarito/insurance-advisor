"use server";

import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { convertPdfToImages } from "@/lib/pdf";
import type { InsurancePolicy } from "@/types";

const insuranceSchema = z.object({
  insurerName: z.string().describe("Nome da seguradora (ex: Fidelidade, Allianz, Médis)"),
  policyType: z.string().describe("Tipo de seguro (ex: Auto, Vida, Habitação, Saúde, Acidentes Pessoais, Viagem, etc.)"),
  monthlyPremium: z.number().nullable().describe("Prémio mensal em euros (número). null se não for possível extrair o valor."),
  annualPremium: z.number().nullable().describe("Prémio anual em euros (número). null se não for possível extrair o valor."),
  currency: z.string().default("EUR"),
  coverages: z.array(z.string()).describe("Lista das coberturas principais mencionadas no documento. Cada item deve ser uma cobertura distinta (ex: Internamento Hospitalar, Consultas, Doenças Graves, etc.)"),
  exclusions: z.array(z.string()).describe("Lista das exclusões e restrições mencionadas no documento. Inclui períodos de carência, procedimentos com espera alargada, limitações de idade, preexistências, e tudo o que NÃO está coberto"),
  rawText: z.string().describe("Texto completo extraído do documento"),
});

const EXTRACTION_PROMPT = `Tu és um especialista em seguros portugueses. Analisa as imagens de um documento de seguro e extrai a informação estruturada.

O documento pode ser: FIN, apólice, certificado, condições gerais, cartão de seguro, proposta, renovação, etc.

## INSTRUÇÕES POR CAMPO

### insurerName
O nome completo da seguradora. Exemplos: "Fidelidade - Companhia de Seguros, S.A.", "Allianz Portugal, S.A."

### policyType
O tipo/ramo de seguro. Exemplos: Auto, Vida, Habitação, Saúde, Acidentes Pessoais, Viagem, Multirriscos, Proteção Jurídica, etc.

### monthlyPremium e annualPremium
Procura valores de prémio, mensalidade, anuidade ou custo. Se encontrar prémio anual, divide por 12 para monthlyPremium. Se encontrar prémio mensal, multiplica por 12 para annualPremium. Se não encontrar nenhum valor, retorna null para ambos. Não inventes valores.

### coverages — MUITO IMPORTANTE
Este é o campo mais importante. Deves extrair TODAS as coberturas do documento.

O documento pode ter coberturas em vários formatos:

1. **TABELAS DE COBERTURAS**: Muitos documentos de seguro apresentam as coberturas em tabelas com colunas como "Coberturas", "Capitais Seguros", "Reembolso", etc. Cada linha da tabela é uma cobertura. Lê TODAS as linhas da tabela.

2. **LISTAGENS SIMPLES**: Podem aparecer como lista com bullet points ou numerada.

3. **SEÇÕES DE TEXTO**: Podem estar descritas em parágrafos.

Para documentos de SAÚDE (como Multicare, Médis, etc.), procura especificamente por:
- Internamento Hospitalar
- Cirurgia
- Consultas, Exames e Tratamentos (Ambulatório)
- Psiquiatria, Psicologia
- Medicina Física e de Reabilitação / Fisioterapia
- Estomatologia e Medicina Dentária
- Doenças Graves
- Medicina Preventiva
- Assistência Domiciliária
- Assistência Clínica em Viagem
- Medicina Online
- Ortopedia / Próteses e Órtoses
- Qualquer outra cobertura mencionada

Cada cobertura deve ser um item distinto na lista. Inclui o nome da cobertura e, se disponível, o capital seguro ou limite (ex: "Internamento Hospitalar — Capital: 100.000€").

### exclusões — MUITO IMPORTANTE
Deves extrair TODAS as exclusões, restrições e limitações do documento.

Procura nas seguintes seções:
- "Exclusões" / "Exclusão" / "O que não está seguro" / "Exclusões e Limitações"
- "Períodos de Carência" — cada período de carência é uma exclusão temporária
- "Condições Especiais" — podem conter limitações específicas
- "Condições Gerais" — podem conter exclusões gerais
- "Preexistências" — condições pré-existentes não cobertas
- Limitações de idade
- Franquias (valor mínimo que o cliente paga)
- Procedimentos com período de carência alargado (ex: 360 dias)

Para documentos de SAÚDE, procura especificamente por:
- Períodos de carência (180 dias, 360 dias, etc.)
- Procedimentos com carência especial (facoemulsificação, cirurgia de varizes, etc.)
- Preexistências
- O que NÃO está coberto em cada condição especial
- Limitações de idade para coberturas
- Franquias e comparticipações

Cada exclusão deve ser um item distinto. Exemplos:
- "Internamento Hospitalar: Período de carência de 180 dias"
- "Facoemulsificação: Período de carência de 360 dias"
- "Cobertura de Doenças Graves cessa aos 70 anos"
- "Preexistências não cobertas nos primeiros 360 dias"

### rawText
Transcreve o texto mais relevante do documento (coberturas, exclusões, prémio) para referência futura.

## REGRAS IMPORTANTES
- Lê TODO o texto visível nas imagens, página por página.
- Se o documento tiver tabelas, extrai TODAS as linhas, não apenas as primeiras.
- Não inventes valores. Se não encontrares, usa null.
- Se não souberes identificar a seguradora, usa "Desconhecida".
- Se não souberes identificar o tipo, usa "Geral".
- Prioriza a completude: é melhor extrair muitas coberturas/exclusões do que poucas.`;

export async function uploadAndExtractInsurance(
  userId: string,
  storagePath: string,
  fileName: string,
): Promise<{ success: boolean; policy?: InsurancePolicy; error?: string }> {
  try {
    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const file = bucket.file(storagePath);

    const [fileBuffer] = await file.download();

    const pdfImages = await convertPdfToImages(fileBuffer.buffer as ArrayBuffer);

    const imageParts = pdfImages.map(({ dataUrl }) => {
      const base64 = dataUrl.split(",")[1];
      return {
        type: "image" as const,
        image: base64,
        mimeType: "image/png" as const,
      };
    });

    const { object: extracted } = await generateObject({
      model: google("gemini-3.1-pro-preview"),
      schema: insuranceSchema,
      instructions: "Tu és um sistema de extração de dados de seguros. A tua tarefa é extrair TODAS as coberturas e exclusões de documentos de seguros portugueses, mesmo que estejam em tabelas complexas ou em texto denso de condições gerais. Nunca retornes listas vazias se o documento contiver coberturas ou exclusões.",
      messages: [
        {
          role: "user",
          content: [
            ...imageParts,
            {
              type: "text",
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    });

    const [fileURL] = await file.getSignedUrl({
      action: "read",
      expires: "2030-01-01",
    });

    const now = new Date().toISOString();
    const policyData: InsurancePolicy = {
      id: "",
      userId,
      fileName,
      fileURL,
      storagePath,
      insurerName: extracted.insurerName,
      policyType: extracted.policyType,
      monthlyPremium: extracted.monthlyPremium,
      annualPremium: extracted.annualPremium,
      currency: extracted.currency,
      coverages: extracted.coverages,
      exclusions: extracted.exclusions,
      rawText: extracted.rawText,
      uploadedAt: now,
      updatedAt: now,
    };

    const adminDb = getAdminDb();
    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("policies")
      .add(policyData);

    const policy: InsurancePolicy = { ...policyData, id: docRef.id };
    await docRef.update({ id: docRef.id });

    return { success: true, policy };
  } catch (error) {
    console.error("Error uploading and extracting insurance:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao processar o documento.",
    };
  }
}

export async function updatePolicyPremium(
  userId: string,
  policyId: string,
  monthlyPremium: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const annualPremium = Math.round(monthlyPremium * 12 * 100) / 100;
    const now = new Date().toISOString();

    const adminDb = getAdminDb();
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("policies")
      .doc(policyId)
      .update({
        monthlyPremium,
        annualPremium,
        updatedAt: now,
      });

    return { success: true };
  } catch (error) {
    console.error("Error updating policy premium:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao atualizar o prémio.",
    };
  }
}

export async function deletePolicy(
  userId: string,
  policyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminDb = getAdminDb();
    const docRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("policies")
      .doc(policyId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return { success: false, error: "Seguro não encontrado." };
    }

    const data = doc.data();
    if (data?.storagePath) {
      try {
        const adminStorage = getAdminStorage();
        const bucket = adminStorage.bucket();
        await bucket.file(data.storagePath).delete();
      } catch {
        // Storage file may not exist or already be deleted — continue
      }
    }

    await docRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting policy:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao apagar o seguro.",
    };
  }
}
