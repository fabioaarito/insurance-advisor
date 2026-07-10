"use server";

import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import type { InsurancePolicy } from "@/types";

const insuranceSchema = z.object({
  insurerName: z.string().describe("Nome da seguradora (ex: Fidelidade, Allianz)"),
  policyType: z.string().describe("Tipo de seguro (ex: Auto, Vida, Habitação, Saúde)"),
  monthlyPremium: z.number().describe("Prémio mensal em EUR"),
  annualPremium: z.number().describe("Prémio anual em EUR"),
  currency: z.string().default("EUR"),
  coverages: z.array(z.string()).describe("Lista das coberturas principais"),
  exclusions: z.array(z.string()).describe("Lista das exclusões principais"),
  rawText: z.string().describe("Texto completo extraído do documento"),
});

const EXTRACTION_PROMPT = `Tu és um especialista em seguros portugues. Analisa o seguinte documento de seguro (Ficha de Informação Normalizada - FIN) e extrai as informações estruturadas.

Para cada campo:
- insurerName: O nome completo da seguradora
- policyType: O tipo de seguro (Auto, Vida, Habitação, Saúde, Acidentes Pessoais, etc.)
- monthlyPremium: O prémio mensal em euros (número). Se o documento indicar prémio anual, divide por 12.
- annualPremium: O prémio anual em euros (número). Se o documento indicar prémio mensal, multiplica por 12.
- currency: "EUR"
- coverages: Lista de todas as coberturas incluídas no seguro
- exclusions: Lista de todas as exclusões mencionadas no documento
- rawText: O texto completo do documento para referência futura

Se o documento não for uma FIN de seguro, ou se não conseguir extrair informação suficiente, retorna os campos com os melhores dados possíveis e indica no rawText que a extração pode estar incompleta.`;

export async function uploadAndExtractInsurance(
  userId: string,
  fileBase64: string,
  fileName: string,
  mimeType: string
): Promise<{ success: boolean; policy?: InsurancePolicy; error?: string }> {
  try {
    const storagePath = `insurances/${userId}/${Date.now()}_${fileName}`;
    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const file = bucket.file(storagePath);

    const buffer = Buffer.from(fileBase64, "base64");
    await file.save(buffer, {
      contentType: mimeType,
      metadata: {
        firebaseStorageDownloadTokens: crypto.randomUUID(),
      },
    });

    const [fileURL] = await file.getSignedUrl({
      action: "read",
      expires: "2030-01-01",
    });

    const { object: extracted } = await generateObject({
      model: google("gemini-3.1-pro-preview"),
      schema: insuranceSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: buffer,
              mediaType: mimeType as "application/pdf",
            },
            {
              type: "text",
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
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
