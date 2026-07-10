import { google } from "@ai-sdk/google";
import { streamText, createUIMessageStreamResponse, toUIMessageStream } from "ai";
import { getAdminDb } from "@/lib/firebase-admin";
import type { InsurancePolicy } from "@/types";

export const maxDuration = 30;

const SYSTEM_PROMPT = `Tu és o Insurance Advisor AI, um assistente especializado em seguros em Portugal. 
A tua função é ajudar os utilizadores a compreender melhor as suas apólices de seguro, coberturas, exclusões e custos.

Regras:
- Responde sempre em português de Portugal.
- Baseia-te exclusivamente nos dados dos seguros que o utilizador tem registados.
- Se não tiveres informação sobre um seguro específico, indica que não tens essa informação.
- Fornece respostas claras, concisas e úteis.
- Quando relevante, compara seguros ou sugere áreas para revisão.
- Nunca inventes dados que não estejam nos seguros fornecidos.
- Usa um tom profissional mas acessível.
- Formata a informação de forma clara, usando listas quando apropriado.`;

function buildInsuranceContext(policies: InsurancePolicy[]): string {
  if (policies.length === 0) {
    return "O utilizador ainda não tem seguros registados na plataforma.";
  }

  const sections = policies.map((p, i) => {
    return `
### Seguro ${i + 1}: ${p.insurerName} - ${p.policyType}
- Prémio Mensal: ${p.monthlyPremium.toFixed(2)} EUR
- Prémio Anual: ${p.annualPremium.toFixed(2)} EUR
- Coberturas: ${p.coverages.length > 0 ? p.coverages.join(", ") : "Não especificadas"}
- Exclusões: ${p.exclusions.length > 0 ? p.exclusions.join(", ") : "Não especificadas"}
    `.trim();
  });

  return `## Seguros do utilizador (${policies.length} total)\n\n${sections.join("\n\n")}`;
}

interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  parts?: UIMessagePart[];
  content?: string;
}

function convertMessages(messages: UIMessage[]) {
  return messages.map((msg) => {
    let content: string;
    if (msg.parts && msg.parts.length > 0) {
      content = msg.parts
        .filter((p: UIMessagePart) => p.type === "text" && p.text)
        .map((p: UIMessagePart) => p.text)
        .join("");
    } else {
      content = msg.content ?? "";
    }
    return { role: msg.role as "user" | "assistant" | "system", content };
  });
}

export async function POST(req: Request) {
  const { messages, userId, policyId } = await req.json();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let policies: InsurancePolicy[] = [];
  const adminDb = getAdminDb();

  if (policyId) {
    const doc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("policies")
      .doc(policyId)
      .get();
    if (doc.exists) {
      policies = [{ id: doc.id, ...doc.data() } as InsurancePolicy];
    }
  } else {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("policies")
      .orderBy("uploadedAt", "desc")
      .get();
    policies = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as InsurancePolicy)
    );
  }

  const insuranceContext = buildInsuranceContext(policies);
  const modelMessages = convertMessages(messages);

  const result = streamText({
    model: google("gemini-3.5-flash"),
    system: `${SYSTEM_PROMPT}\n\n${insuranceContext}`,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      try {
        const lastUserMsg = [...messages]
          .reverse()
          .find((m: UIMessage) => m.role === "user");
        if (!lastUserMsg) return;

        const userContent = lastUserMsg.parts
          ?.filter((p: UIMessagePart) => p.type === "text" && p.text)
          .map((p: UIMessagePart) => p.text)
          .join("") ?? lastUserMsg.content ?? "";

        const now = new Date().toISOString();
        await adminDb
          .collection("users")
          .doc(userId)
          .collection("chats")
          .add({
            userId,
            policyId: policyId || null,
            role: "user",
            content: userContent,
            timestamp: now,
          });
        await adminDb
          .collection("users")
          .doc(userId)
          .collection("chats")
          .add({
            userId,
            policyId: policyId || null,
            role: "assistant",
            content: text,
            timestamp: now,
          });
      } catch (error) {
        console.error("Error saving chat messages:", error);
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
