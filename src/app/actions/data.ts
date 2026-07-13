"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import type { InsurancePolicy } from "@/types";

export async function getUserPolicies(
  userId: string
): Promise<InsurancePolicy[]> {
  const adminDb = getAdminDb();
  const snapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("policies")
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InsurancePolicy[];
}

export async function getPolicyById(
  userId: string,
  policyId: string
): Promise<InsurancePolicy | null> {
  const adminDb = getAdminDb();
  const doc = await adminDb
    .collection("users")
    .doc(userId)
    .collection("policies")
    .doc(policyId)
    .get();

  if (!doc.exists) return null;

  return { id: doc.id, ...doc.data() } as InsurancePolicy;
}

export async function getChatMessages(
  userId: string,
  policyId?: string,
  limit = 30,
): Promise<{ messages: Array<{ id: string; role: string; content: string; timestamp: string }>; hasMore: boolean }> {
  const adminDb = getAdminDb();
  let query: FirebaseFirestore.Query = adminDb
    .collection("users")
    .doc(userId)
    .collection("chats");

  if (policyId) {
    query = query.where("policyId", "==", policyId);
  } else {
    query = query.where("policyId", "==", null);
  }

  const snapshot = await query.get();
  const sorted = snapshot.docs
    .sort((a, b) => {
      const tsA = a.data().timestamp as string;
      const tsB = b.data().timestamp as string;
      return tsB.localeCompare(tsA);
    });

  const hasMore = sorted.length > limit;
  const messages = sorted.slice(0, limit).reverse().map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{ id: string; role: string; content: string; timestamp: string }>;

  return { messages, hasMore };
}
