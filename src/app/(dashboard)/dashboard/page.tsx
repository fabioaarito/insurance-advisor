"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserPolicies } from "@/app/actions/data";
import { FinancialSummary } from "@/components/financial-summary";
import { InsuranceCard } from "@/components/insurance-card";
import { UploadZone } from "@/components/upload-zone";
import { EmptyState } from "@/components/empty-state";
import { WelcomeBanner } from "@/components/welcome-banner";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Upload,
  Loader2,
  FileText,
  Brain,
  MessageSquare,
} from "lucide-react";
import type { InsurancePolicy } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchPolicies = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserPolicies(user.uid);
      setPolicies(data);
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  if (loading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 md:px-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">A carregar os teus seguros...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:px-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            O teu seguro, resumido
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualiza e gere todos os teus seguros num só lugar
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="gap-2 shadow-sm"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Carregar Seguro</span>
        </Button>
      </div>

      {policies.length > 0 ? (
        <div className="space-y-8 animate-fade-in-up">
          <WelcomeBanner policies={policies} onUploadClick={() => setUploadOpen(true)} />
          <FinancialSummary policies={policies} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Os teus seguros</h2>
              <p className="text-sm text-muted-foreground">
                {policies.length} seguro{policies.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {policies.map((policy, i) => (
                <div key={policy.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in-up">
                  <InsuranceCard policy={policy} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Shield}
          title="Ainda não tens seguros adicionados"
          description="Carrega a tua primeira Ficha de Informação Normalizada (FIN) para a IA extrair todos os dados automaticamente."
          steps={[
            {
              icon: FileText,
              label: "Carrega a FIN",
              description: "Arrasta ou seleciona o teu PDF",
            },
            {
              icon: Brain,
              label: "IA extrai os dados",
              description: "Coberturas, exclusões e custos",
            },
            {
              icon: MessageSquare,
              label: "Conversa sobre eles",
              description: "Tira dúvidas com o assistente IA",
            },
          ]}
          action={
            <Button onClick={() => setUploadOpen(true)} className="gap-2 shadow-sm">
              <Upload className="h-4 w-4" />
              Carregar Primeiro Seguro
            </Button>
          }
        />
      )}

      <UploadZone
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploadComplete={fetchPolicies}
      />
    </div>
  );
}
