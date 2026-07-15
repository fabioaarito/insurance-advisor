import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Home,
  Heart,
  Briefcase,
  Shield,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
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

const policyTypeColors: Record<string, { bg: string; text: string; badge: string }> = {
  car: { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  home: { bg: "bg-amber-100", text: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  heart: { bg: "bg-rose-100", text: "text-rose-600", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  briefcase: { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  shield: { bg: "bg-primary/10", text: "text-primary", badge: "" },
};

function PolicyTypeIcon({ type }: { type: string }) {
  const key = type
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const iconName = policyTypeIcons[key] ?? "shield";
  const colors = policyTypeColors[iconName] ?? policyTypeColors.shield;

  const IconComponent = (() => {
    switch (iconName) {
      case "car":
        return Car;
      case "home":
        return Home;
      case "heart":
        return Heart;
      case "briefcase":
        return Briefcase;
      default:
        return Shield;
    }
  })();

  return (
    <div className={`rounded-xl p-3 ${colors.bg}`}>
      <IconComponent className={`h-6 w-6 ${colors.text}`} />
    </div>
  );
}

interface InsuranceCardProps {
  policy: InsurancePolicy;
}

export function InsuranceCard({ policy }: InsuranceCardProps) {
  const coverageCount = policy.coverages.length;
  const hasPremium = policy.monthlyPremium != null;

  return (
    <Link href={`/dashboard/insurance/${policy.id}`} className="block min-w-0">
      <Card className="group cursor-pointer transition-all duration-200 shadow-card hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3.5 min-w-0">
                <PolicyTypeIcon type={policy.policyType} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-base leading-tight truncate">
                    {policy.insurerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {policy.policyType}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 shrink-0" />
            </div>

            <div className="flex items-end justify-between gap-2">
              {hasPremium ? (
                <div className="min-w-0">
                  <div className="flex items-baseline min-w-0">
                    <span className="text-2xl font-bold tracking-tight sm:text-3xl truncate">
                      {policy.monthlyPremium!.toFixed(2)}
                    </span>
                    <span className="text-lg font-semibold text-muted-foreground ml-1 shrink-0">€</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">por mês</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                  <CircleDollarSign className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">Prémio não definido</p>
                    <p className="text-xs truncate">Clica para adicionar</p>
                  </div>
                </div>
              )}
            </div>

            {coverageCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {coverageCount} cobertura{coverageCount !== 1 ? "s" : ""}
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(coverageCount * 15, 100)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {policy.coverages.slice(0, 3).map((coverage) => (
                    <Badge
                      key={coverage}
                      variant="secondary"
                      className="!h-auto !whitespace-normal !max-w-full text-xs font-normal"
                    >
                      {coverage}
                    </Badge>
                  ))}
                  {policy.coverages.length > 3 && (
                    <Badge variant="outline" className="!h-auto text-xs font-normal">
                      +{policy.coverages.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
