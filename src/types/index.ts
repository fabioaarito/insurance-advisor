export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface InsurancePolicy {
  id: string;
  userId: string;
  fileName: string;
  fileURL: string;
  storagePath: string;
  insurerName: string;
  policyType: string;
  monthlyPremium: number | null;
  annualPremium: number | null;
  currency: string;
  coverages: string[];
  exclusions: string[];
  rawText?: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  policyId?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  policyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedInsuranceData {
  insurerName: string;
  policyType: string;
  monthlyPremium: number | null;
  annualPremium: number | null;
  currency: string;
  coverages: string[];
  exclusions: string[];
  rawText: string;
}
