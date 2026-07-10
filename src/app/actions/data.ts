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
  before?: string
): Promise<{ messages: Array<{ id: string; role: string; content: string; timestamp: string }>; hasMore: boolean }> {
  const adminDb = getAdminDb();
  let query = adminDb
    .collection("users")
    .doc(userId)
    .collection("chats")
    .orderBy("timestamp", "desc");

  if (policyId) {
    query = query.where("policyId", "==", policyId);
  } else {
    query = query.where("policyId", "==", null);
  }

  if (before) {
    const beforeDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("chats")
      .doc(before)
      .get();
    if (beforeDoc.exists) {
      query = query.startAfter(beforeDoc);
    }
  }

  const snapshot = await query.limit(limit + 1).get();
  const docs = snapshot.docs;
  const hasMore = docs.length > limit;
  const messages = docs.slice(0, limit).reverse().map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<{ id: string; role: string; content: string; timestamp: string }>;

  return { messages, hasMore };
}
