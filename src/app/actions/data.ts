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
  const docs = snapshot.docs.sort((a, b) => {
    const tA = new Date(a.data().timestamp as string).getTime();
    const tB = new Date(b.data().timestamp as string).getTime();
    return tA - tB;
  });

  const hasMore = docs.length > limit;
  const messages = docs.slice(-limit).map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{ id: string; role: string; content: string; timestamp: string }>;

  return { messages, hasMore };
}
