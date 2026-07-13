"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Upload, MessageSquare, Sparkles } from "lucide-react";
import type { InsurancePolicy } from "@/types";

interface WelcomeBannerProps {
  policies: InsurancePolicy[];
  onUploadClick: () => void;
}

export function WelcomeBanner({ policies, onUploadClick }: WelcomeBannerProps) {
  const { user } = useAuth();
  const firstName =
    user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  const policiesWithPremium = policies.filter((p) => p.monthlyPremium != null);
  const totalMonthly = policiesWithPremium.reduce(
    (s, p) => s + (p.monthlyPremium ?? 0),
    0
  );

  if (policies.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-brand p-6 text-white shadow-lg md:p-8 animate-fade-in">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />

      <div className="relative z-10 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            O teu resumo de seguros
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Olá, {firstName}!
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Tens <span className="font-semibold text-white">{policies.length} seguro{policies.length !== 1 ? "s" : ""}</span> ativo{policies.length !== 1 ? "s" : ""}
            {policiesWithPremium.length > 0 ? (
              <> com um investimento total de{" "}
                <span className="font-semibold text-white">{totalMonthly.toFixed(2)} €/mês</span></>
              ) : (
                <>. {policiesWithoutPremiumCount(policies) > 0 && "Alguns ainda não têm valor definido."}</>
              )}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onUploadClick}
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-white/20 gap-2"
          >
            <Upload className="h-4 w-4" />
            Carregar novo seguro
          </Button>
          <Button
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-white/20 gap-2"
            onClick={() => window.location.href = "/dashboard/chat"}
          >
            <MessageSquare className="h-4 w-4" />
            Conversar com IA
          </Button>
        </div>
      </div>
    </div>
  );
}

function policiesWithoutPremiumCount(policies: InsurancePolicy[]): number {
  return policies.filter((p) => p.monthlyPremium == null).length;
}
