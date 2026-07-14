import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Shield, PiggyBank } from "lucide-react";
import type { InsurancePolicy } from "@/types";

interface FinancialSummaryProps {
  policies: InsurancePolicy[];
}

export function FinancialSummary({ policies }: FinancialSummaryProps) {
  const policiesWithPremium = policies.filter((p) => p.monthlyPremium != null);
  const policiesWithoutPremium = policies.filter((p) => p.monthlyPremium == null);

  const totalMonthly = policiesWithPremium.reduce(
    (sum, p) => sum + (p.monthlyPremium ?? 0),
    0
  );
  const totalAnnual = policiesWithPremium.reduce(
    (sum, p) => sum + (p.annualPremium ?? 0),
    0
  );
  const averageMonthly =
    policiesWithPremium.length > 0 ? totalMonthly / policiesWithPremium.length : 0;

  const stats = [
    {
      title: "Investes por mês",
      value: policiesWithPremium.length > 0 ? `${totalMonthly.toFixed(2)} €` : "N/A",
      description: policiesWithoutPremium.length > 0
        ? `${policiesWithPremium.length} de ${policies.length} seguros com valor definido`
        : `Soma dos ${policies.length} prémios mensais`,
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-l-emerald-500",
    },
    {
      title: "Investimento anual",
      value: policiesWithPremium.length > 0 ? `${totalAnnual.toFixed(2)} €` : "N/A",
      description: "Custo total estimado por ano",
      icon: TrendingUp,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      borderColor: "border-l-indigo-500",
    },
    {
      title: "Prémio médio",
      value: policiesWithPremium.length > 0 ? `${averageMonthly.toFixed(2)} €` : "N/A",
      description: "Custo médio por apólice",
      icon: Shield,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      borderColor: "border-l-slate-400",
    },
    {
      title: "Poupança potencial",
      value: policiesWithPremium.length > 0 ? `${(totalAnnual * 0.1).toFixed(2)} €` : "N/A",
      description: "Estimativa com otimização",
      icon: PiggyBank,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-l-amber-500",
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">
        Resumo financeiro
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`shadow-card hover:shadow-card-hover transition-shadow duration-200 border-l-4 ${stat.borderColor}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold tracking-tight sm:text-2xl truncate">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${stat.iconBg} shrink-0`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
