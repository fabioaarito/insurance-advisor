"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getPolicyById } from "@/app/actions/data";
import { updatePolicyPremium, deletePolicy } from "@/app/actions/insurance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  Pencil,
  Check,
  X,
  CircleDollarSign,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { trackPremiumEdit } from "@/lib/analytics";
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
  const [editingPremium, setEditingPremium] = useState(false);
  const [premiumInput, setPremiumInput] = useState("");
  const [savingPremium, setSavingPremium] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleSavePremium() {
    if (!user || !policy) return;
    const value = parseFloat(premiumInput.replace(",", "."));
    if (isNaN(value) || value < 0) {
      toast.error("Por favor, insere um valor válido.");
      return;
    }

    setSavingPremium(true);
    try {
      const result = await updatePolicyPremium(user.uid, policy.id, value);
      if (result.success) {
        setPolicy((prev) =>
          prev
            ? {
                ...prev,
                monthlyPremium: value,
                annualPremium: Math.round(value * 12 * 100) / 100,
              }
            : prev
        );
        setEditingPremium(false);
        trackPremiumEdit(policy.insurerName, value);
        toast.success("Prémio atualizado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao atualizar o prémio.");
      }
    } finally {
      setSavingPremium(false);
    }
  }

  function startEditingPremium() {
    setPremiumInput(policy?.monthlyPremium?.toString() ?? "");
    setEditingPremium(true);
  }

  function cancelEditingPremium() {
    setEditingPremium(false);
    setPremiumInput("");
  }

  async function handleDelete() {
    if (!user || !policy) return;
    setDeleting(true);
    try {
      const result = await deletePolicy(user.uid, policy.id);
      if (result.success) {
        toast.success("Seguro apagado com sucesso!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Erro ao apagar o seguro.");
        setDeleting(false);
        setDeleteOpen(false);
      }
    } finally {
      setDeleting(false);
    }
  }

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

  const hasPremium = policy.monthlyPremium != null;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6 animate-fade-in overflow-hidden">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="rounded-xl gradient-brand p-3 shrink-0 hidden sm:block">
            <PolicyTypeIconComponent type={policy.policyType} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl truncate">
              {policy.insurerName}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base truncate">{policy.policyType}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5 overflow-hidden">
        <div className="md:col-span-2 space-y-6 min-w-0">
          <Card className="shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Informações do seguro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Seguradora</span>
                <span className="text-sm font-medium text-right min-w-0 truncate">{policy.insurerName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Tipo</span>
                <Badge variant="secondary" className="shrink-0 max-w-full truncate">{policy.policyType}</Badge>
              </div>
              <Separator />
              <div className="rounded-xl gradient-brand-subtle p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Prémio mensal</p>
                  {!editingPremium && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={startEditingPremium}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {editingPremium ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={premiumInput}
                        onChange={(e) => setPremiumInput(e.target.value)}
                        placeholder="Ex: 45.50"
                        className="text-xl font-bold h-auto py-2 sm:text-2xl"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePremium();
                          if (e.key === "Escape") cancelEditingPremium();
                        }}
                      />
                      <span className="text-lg font-semibold text-muted-foreground shrink-0">€</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSavePremium}
                        disabled={savingPremium}
                        className="gap-1.5"
                      >
                        {savingPremium ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditingPremium}
                        disabled={savingPremium}
                        className="gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : hasPremium ? (
                  <div className="text-center min-w-0">
                    <p className="text-2xl font-bold tracking-tight sm:text-3xl truncate">
                      {policy.monthlyPremium!.toFixed(2)} <span className="text-base text-muted-foreground sm:text-lg">€</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {policy.annualPremium!.toFixed(2)} € por ano
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <CircleDollarSign className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      O valor do prémio não foi extraído do documento.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={startEditingPremium}
                      className="gap-1.5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Adicionar prémio mensal
                    </Button>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Ficheiro</span>
                <a
                  href={policy.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline min-w-0"
                >
                  <span className="truncate">{policy.fileName}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Data de upload</span>
                <span className="flex items-center gap-1.5 text-sm shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(policy.uploadedAt).toLocaleDateString("pt-PT")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6 min-w-0">
          <Card className="shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-emerald-100 p-1.5 shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="truncate">Coberturas</span>
                {policy.coverages.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs shrink-0">
                    {policy.coverages.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {policy.coverages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {policy.coverages.map((coverage) => (
                    <Badge
                      key={coverage}
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 text-emerald-700 font-normal text-sm py-1.5 px-3 max-w-full !whitespace-normal !h-auto"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1.5 shrink-0" />
                      <span className="break-words">{coverage}</span>
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

          <Card className="shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-red-100 p-1.5 shrink-0">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <span className="truncate">Exclusões</span>
                {policy.exclusions.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs shrink-0">
                    {policy.exclusions.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {policy.exclusions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {policy.exclusions.map((exclusion) => (
                    <Badge
                      key={exclusion}
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700 font-normal text-sm py-1.5 px-3 max-w-full !whitespace-normal !h-auto"
                    >
                      <XCircle className="h-3 w-3 mr-1.5 shrink-0" />
                      <span className="break-words">{exclusion}</span>
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
            <div className="gradient-brand p-4 sm:p-6 text-center text-white space-y-3">
              <MessageSquare className="h-8 w-8 mx-auto" />
              <h3 className="text-lg font-semibold">Queres saber mais?</h3>
              <p className="text-white/80 text-sm max-w-sm mx-auto">
                Conversa com a nossa IA para esclarecer dúvidas sobre este seguro em específico.
              </p>
              <Button
                className="gap-2 bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
                onClick={() =>
                  router.push(`/dashboard/chat?policyId=${policy.id}`)
                }
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">Conversar sobre este seguro</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Apagar seguro
            </DialogTitle>
            <DialogDescription>
              Tem a certeza que queres apagar o seguro <strong>{policy.insurerName}</strong> ({policy.policyType})?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Apagar seguro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
