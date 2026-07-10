"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Layers } from "lucide-react";
import type { InsurancePolicy } from "@/types";

interface PolicySelectorProps {
  policies: InsurancePolicy[];
  selectedPolicyId: string;
  onSelect: (policyId: string) => void;
}

export function PolicySelector({
  policies,
  selectedPolicyId,
  onSelect,
}: PolicySelectorProps) {
  return (
    <Select value={selectedPolicyId} onValueChange={(value) => { if (value) onSelect(value); }}>
      <SelectTrigger className="w-full sm:w-[280px]">
        <SelectValue placeholder="Selecionar seguro" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Todos os Seguros
          </div>
        </SelectItem>
        {policies.map((policy) => (
          <SelectItem key={policy.id} value={policy.id}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              {policy.insurerName} - {policy.policyType}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
