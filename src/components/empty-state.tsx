import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  steps?: { icon: LucideIcon; label: string; description: string }[];
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  steps,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-12 text-center animate-fade-in">
      <div className="rounded-2xl gradient-brand-subtle p-5">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {steps && (
        <div className="mt-8 grid gap-6 sm:grid-cols-3 max-w-lg w-full">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {i + 1}
              </div>
              <p className="text-sm font-medium">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
