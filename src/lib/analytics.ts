const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-JRLQP6JFYP";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackLogin() {
  gtag("event", "login", { method: "Google" });
}

export function trackPolicyUpload(insurerName: string) {
  gtag("event", "policy_upload", {
    insurer_name: insurerName,
  });
}

export function trackPremiumEdit(insurerName: string, newPremium: number) {
  gtag("event", "premium_edit", {
    insurer_name: insurerName,
    new_premium: newPremium,
  });
}

export function trackChatMessage(policyId?: string) {
  gtag("event", "chat_message", {
    policy_id: policyId ?? "all",
  });
}

export { GA_MEASUREMENT_ID };
