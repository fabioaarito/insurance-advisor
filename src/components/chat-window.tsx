"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getUserPolicies } from "@/app/actions/data";
import { ChatMessageBubble } from "@/components/chat-message-bubble";
import { PolicySelector } from "@/components/policy-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  Sparkles,
  Shield,
  MessageSquare,
} from "lucide-react";
import type { InsurancePolicy } from "@/types";

interface ChatWindowProps {
  initialPolicyId?: string;
}

const suggestions = [
  "Quais são as minhas coberturas?",
  "Quanto pago por ano no total?",
  "Tenho seguro de vida?",
  "Quais são as exclusões dos meus seguros?",
];

export function ChatWindow({ initialPolicyId }: ChatWindowProps) {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(
    initialPolicyId || "all"
  );
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        userId: user?.uid,
        policyId: selectedPolicyId === "all" ? undefined : selectedPolicyId,
      },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  }

  function handleSuggestion(suggestion: string) {
    if (isLoading) return;
    sendMessage({ text: suggestion });
  }

  const hasNoPolicies =
    policies.length === 0 && status !== "submitted" && status !== "streaming";

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId);

  return (
    <div className="flex h-full flex-col">
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

      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
              <div className="rounded-2xl gradient-brand p-5 mb-4">
                {hasNoPolicies ? (
                  <Shield className="h-8 w-8 text-white" />
                ) : (
                  <MessageSquare className="h-8 w-8 text-white" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {hasNoPolicies
                  ? "Ainda não tens seguros"
                  : "Pergunta-me o que quiseres"}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
                {hasNoPolicies
                  ? "Carrega os teus seguros no Dashboard primeiro para poderes fazer perguntas sobre eles."
                  : "Sou o teu assistente de seguros. Pergunta sobre coberturas, exclusões, custos ou qualquer dúvida."}
              </p>

              {!hasNoPolicies && (
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      disabled={isLoading}
                      className="rounded-full border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:border-primary/20 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((message) => {
            const textContent = message.parts
              .filter(
                (p): p is { type: "text"; text: string } => p.type === "text"
              )
              .map((p) => p.text)
              .join("");
            return (
              <ChatMessageBubble
                key={message.id}
                role={message.role as "user" | "assistant"}
                content={textContent}
              />
            );
          })}
          {isLoading &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-brand">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
                <div className="flex items-center rounded-2xl rounded-bl-md bg-muted border-l-2 border-primary/30 px-4 py-3 text-sm text-muted-foreground">
                  <span className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>A pensar</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "450ms" }}>.</span>
                  </span>
                </div>
              </div>
            )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              hasNoPolicies
                ? "Carrega seguros primeiro..."
                : "Escreve a tua pergunta..."
            }
            disabled={isLoading || hasNoPolicies}
            className="flex-1 rounded-full border-muted shadow-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim() || hasNoPolicies}
            className="rounded-full shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
