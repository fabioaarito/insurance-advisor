"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Brain,
  FileText,
  MessageSquare,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Lock,
  Zap,
  Clock,
  Star,
} from "lucide-react";

function trackLoginClick() {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "login_button_click", { location: "landing_page" });
  }
}

const features = [
  {
    icon: FileText,
    title: "Carrega apólices em PDF",
    description:
      "Arrasta ou seleciona os teus documentos de seguro. A IA extrai seguradora, coberturas, exclusões e custos automaticamente.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Brain,
    title: "Análise inteligente",
    description:
      "Compreende o que está coberto e o que não está, sem precisar de ler páginas de condições gerais.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Conversa com IA",
    description:
      "Pergunta «Tenho cobertura para inundação?» e obtém uma resposta clara, personalizada para os teus seguros.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Shield,
    title: "Tudo num só lugar",
    description:
      "Visualiza todos os teus seguros, compara custos e mantém a tua proteção sempre organizada.",
    color: "bg-amber-100 text-amber-600",
  },
];

const steps = [
  {
    number: 1,
    title: "Carrega a tua apólice",
    description: "Faz upload do teu documento de seguro em formato PDF",
    icon: FileText,
  },
  {
    number: 2,
    title: "A IA extrai os dados",
    description: "Coberturas, exclusões, prémios — tudo automaticamente",
    icon: Brain,
  },
  {
    number: 3,
    title: "Conversa e decide",
    description: "Tira dúvidas, compara seguros e toma decisões informadas",
    icon: MessageSquare,
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Extração automática",
    description: "Não precisas de preencher nada manualmente",
  },
  {
    icon: Lock,
    title: "Dados seguros",
    description: "Os teus seguros ficam guardados na tua conta privada",
  },
  {
    icon: Clock,
    title: "Resultados instantâneos",
    description: "Em menos de 30 segundos tens os dados extraídos",
  },
];

const faqs = [
  {
    question: "Que tipo de documentos posso carregar?",
    answer:
      "Podes carregar documentos de seguro em formato PDF, como apólices, condições gerais, cartões de seguro ou qualquer documento que tenhas recebido da tua seguradora. Basta o ficheiro ser um PDF com pelo menos uma página.",
  },
  {
    question: "Como são protegidos os meus dados?",
    answer:
      "Os teus documentos e dados pessoais são guardados de forma segura na tua conta. Apenas tu tens acesso aos teus seguros — nem a nossa equipa nem qualquer outra pessoa consegue ver as tuas informações. Os dados são armazenados em servidores seguros com encriptação, e nunca são partilhados com terceiros.",
  },
  {
    question: "Os meus dados são partilhados com seguradoras ou outros serviços?",
    answer:
      "Não. Os teus dados são usados exclusivamente para te ajudar a gerir os teus seguros. Nunca partilhamos, vendemos ou enviamos as tuas informações para seguradoras, anunciantes ou qualquer outro serviço. Tudo fica guardado apenas na tua conta pessoal.",
  },
  {
    question: "A IA substitui um corretor de seguros?",
    answer:
      "Não. O Insurance Advisor é uma ferramenta de apoio à decisão. Fornece informações claras sobre os teus seguros existentes, mas não substitui o aconselhamento profissional de um corretor.",
  },
  {
    question: "Preciso de saber algo sobre seguros para usar?",
    answer:
      "Não precisas de ter conhecimentos técnicos. A ferramenta foi pensada para qualquer pessoa. Basta carregares o teu documento de seguro e a IA explica tudo de forma simples e clara.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O Insurance Advisor é totalmente gratuito. Não há custos ocultos nem assinaturas.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gradient-brand">
              Insurance Advisor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { trackLoginClick(); router.push("/login"); }}
            >
              Entrar
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => { trackLoginClick(); router.push("/login"); }}
            >
              Começar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="gradient-hero overflow-hidden">
          <div className="container mx-auto px-4 py-20 md:px-6 md:py-32">
            <div className="mx-auto max-w-3xl space-y-8 text-center animate-fade-in-up">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">
                O teu assistente
                <br />
                <span className="text-gradient-brand">pessoal de seguros</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                Tens problemas em casa ou de saúde e não usas os teus seguros?
                Descobre como tirar partido dos teus seguros — é grátis e em menos de 1 minuto.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-2">
                <Button
                  size="lg"
                  className="gap-2.5 shadow-lg shadow-primary/20 h-12 px-8 text-base"
                  onClick={() => { trackLoginClick(); router.push("/login"); }}
                >
                  Começar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 h-12 px-8 text-base"
                  onClick={() => {
                    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Como funciona
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Gratuito
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  30 segundos
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-t bg-muted/30 scroll-mt-20">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  Como funciona
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Três passos simples para teres os teus seguros sempre claros e acessíveis
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-3 relative">
                <div className="absolute left-0 right-0 top-7 h-0.5 bg-border hidden sm:block" />
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex flex-col items-center text-center relative"
                  >
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full gradient-brand text-white text-xl font-bold mb-5 shadow-lg shadow-primary/20">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-[240px]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  Tudo o que precisas
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Ferramentas pensadas para te ajudar a entender e gerir os teus seguros sem complicações
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border bg-card p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
                  >
                    <div className={`inline-flex rounded-xl p-3 ${feature.color} mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-8 md:grid-cols-3">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                  Perguntas frequentes
                </h2>
                <p className="text-muted-foreground">
                  Respostas às dúvidas mais comuns
                </p>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between p-5 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          openFaq === i ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Star className="h-4 w-4" />
                Gratuito para sempre
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Começa a gerir os teus seguros hoje
              </h2>
              <p className="text-muted-foreground">
                Carrega o teu primeiro documento de seguro em menos de 1 minuto e descobre o que a IA pode fazer por ti.
              </p>
              <Button
                size="lg"
                className="gap-2.5 shadow-lg shadow-primary/20 h-12 px-8 text-base"
                onClick={() => { trackLoginClick(); router.push("/login"); }}
              >
                Começar gratuitamente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-brand">
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gradient-brand">
                Insurance Advisor
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="/privacidade" className="hover:text-foreground transition-colors">
                Privacidade
              </a>
              <span>&copy; {new Date().getFullYear()} Insurance Advisor AI.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
