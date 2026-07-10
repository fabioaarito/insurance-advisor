"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChatWindow } from "@/components/chat-window";
import { Loader2 } from "lucide-react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const policyId = searchParams.get("policyId") || undefined;

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] max-w-4xl px-4 py-4 md:px-6">
      <ChatWindow initialPolicyId={policyId} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
