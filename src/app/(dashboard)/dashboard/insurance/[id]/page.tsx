"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getPolicyById } from "@/app/actions/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  FileText,
  MessageSquare,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  Car,
  Home,
  Heart,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import type { InsurancePolicy } from "@/types";

const policyTypeIcons: Record<string, string> = {
  auto: "car",
  automovel: "car",
  "habitação": "home",
  habitacao: "home",
  vida: "heart",
  trabalho: "briefcase",
};

function PolicyTypeIconComponent({ type }: { type: string }) {
  const key = type
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const iconName = policyTypeIcons[key] ?? "shield";
  switch (iconName) {
    case "car":
      return <Car className="h-6 w-6 text-white" />;
    case "home":
      return <Home className="h-6 w-6 text-white" />;
    case "heart":
      return <Heart className="h-6 w-6 text-white" />;
    case "briefcase":
      return <Briefcase className="h-6 w-6 text-white" />;
    default:
      return <Shield className="h-6 w-6 text-white" />;
  }
}

export default function InsuranceDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const policyId = params.id as string;

  const [policy, setPolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPolicy = useCallback(async () => {
    if (!user || !policyId) return;
    setLoading(true);
    try {
      const data = await getPolicyById(user.uid, policyId);
      setPolicy(data);
    } catch (error) {
      console.error("Error fetching policy:", error);
    } finally {
      setLoading(false);
    }
  }, [user, policyId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  if (loading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 md:px-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">A carregar detalhes do seguro...</p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="flex flex-col items-center text-center py-16">
          <div className="rounded-2xl bg-muted p-5">
            <Shield className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="mt-5 text-xl font-semibold">Seguro não encontrado</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            O seguro que procuras não existe ou foi removido da tua conta.
          </p>
          <Button
            variant="outline"
            className="mt-6 gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl gradient-brand p-3">
            <PolicyTypeIconComponent type={policy.policyType} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {policy.insurerName}
            </h1>
            <p className="text-muted-foreground">{policy.policyType}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Informações do seguro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Seguradora</span>
                <span className="text-sm font-medium">{policy.insurerName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <Badge variant="secondary">{policy.policyType}</Badge>
              </div>
              <Separator />
              <div className="rounded-xl gradient-brand-subtle p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Prémio mensal</p>
                <p className="text-3xl font-bold tracking-tight">
                  {policy.monthlyPremium.toFixed(2)} <span className="text-lg text-muted-foreground">€</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {policy.annualPremium.toFixed(2)} € por ano
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ficheiro</span>
                <a
                  href={policy.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                >
                  {policy.fileName}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data de upload</span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(policy.uploadedAt).toLocaleDateString("pt-PT")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-emerald-100 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                Coberturas
                {policy.coverages.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {policy.coverages.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policy.coverages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {policy.coverages.map((coverage) => (
                    <Badge
                      key={coverage}
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 font-normal text-sm py-1.5 px-3"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                      {coverage}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma cobertura identificada neste seguro.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-red-100 p-1.5">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                Exclusões
                {policy.exclusions.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {policy.exclusions.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policy.exclusions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {policy.exclusions.map((exclusion) => (
                    <Badge
                      key={exclusion}
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700 font-normal text-sm py-1.5 px-3"
                    >
                      <XCircle className="h-3 w-3 mr-1.5" />
                      {exclusion}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhuma exclusão identificada neste seguro.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card overflow-hidden">
            <div className="gradient-brand p-6 text-center text-white space-y-3">
              <MessageSquare className="h-8 w-8 mx-auto" />
              <h3 className="text-lg font-semibold">Queres saber mais?</h3>
              <p className="text-white/80 text-sm max-w-sm mx-auto">
                Conversa com a nossa IA para esclarecer dúvidas sobre este seguro em específico.
              </p>
              <Button
                className="gap-2 bg-white text-primary hover:bg-white/90"
                onClick={() =>
                  router.push(`/dashboard/chat?policyId=${policy.id}`)
                }
              >
                <MessageSquare className="h-4 w-4" />
                Conversar sobre este seguro
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
