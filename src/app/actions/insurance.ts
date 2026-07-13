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
  coverages: z.array(z.string()).describe("Lista das coberturas principais mencionadas no documento"),
  exclusions: z.array(z.string()).describe("Lista das exclusões principais mencionadas no documento"),
  rawText: z.string().describe("Texto completo extraído do documento"),
});

const EXTRACTION_PROMPT = `Tu és um especialista em seguros. Analisa as seguintes imagens de um documento de seguro e extrai as informações estruturadas.

O documento pode ser qualquer tipo de apólice ou documento de seguro: FIN, apólice, condições gerais, cartão de seguro, proposta, renovação, etc. Estás a ver imagens de cada página do documento.

Para cada campo:
- insurerName: O nome completo da seguradora
- policyType: O tipo de seguro (Auto, Vida, Habitação, Saúde, Acidentes Pessoais, Viagem, Multirriscos, etc.)
- monthlyPremium: O prémio/mensalidade em euros. Se o documento indicar prémio anual, divide por 12. Se não conseguir encontrar o valor do prémio, retorna null.
- annualPremium: O prémio anual em euros. Se o documento indicar prémio mensal, multiplica por 12. Se não conseguir encontrar o valor do prémio, retorna null.
- currency: "EUR"
- coverages: Lista de todas as coberturas incluídas no seguro
- exclusions: Lista de todas as exclusões mencionadas no documento
- rawText: Transcreve o texto mais relevante do documento para referência futura

Regras importantes:
- Lê cuidadosamente todo o texto visível nas imagens.
- Se o documento não contiver informação de prémio/custo, retorna null para monthlyPremium e annualPremium. Não inventes valores.
- Extrai a informação que conseguir, mesmo que o documento esteja incompleto.
- Se não conseguir identificar a seguradora, usa "Desconhecida".
- Se não conseguir identificar o tipo de seguro, usa "Geral".`;

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
