"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserPolicies } from "@/app/actions/data";
import { ChatContent } from "@/components/chat-content";
import { PolicySelector } from "@/components/policy-selector";
import { Sparkles } from "lucide-react";
import type { InsurancePolicy } from "@/types";

interface ChatWindowProps {
  initialPolicyId?: string;
}

export function ChatWindow({ initialPolicyId }: ChatWindowProps) {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(
    initialPolicyId || "all"
  );

  const fetchPolicies = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserPolicies(user.uid);
      setPolicies(data);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  }, [user]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">
              {selectedPolicy
                ? `A conversar sobre: ${selectedPolicy.insurerName}`
                : "A conversar sobre todos os seguros"}
            </span>
          </div>
          <PolicySelector
            policies={policies}
            selectedPolicyId={selectedPolicyId}
            onSelect={setSelectedPolicyId}
          />
        </div>
      </div>

      <ChatContent
        key={selectedPolicyId}
        policyId={selectedPolicyId}
        policies={policies}
      />
    </div>
  );
}
