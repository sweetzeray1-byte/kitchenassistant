"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { ChatHistoryItem, IntentMeta, Recipe } from "@/lib/types";
import { RecipeIntentCard } from "@/components/recipe-intent-card";
import { GenerationProgress } from "@/components/generation-progress";
import { RecipeView } from "@/components/recipe-view";
import { Spinner, LinkButton } from "@/components/ui";
import { useRecipeGeneration } from "@/lib/use-recipe-generation";
import { useRequireAuth } from "@/lib/use-require-auth";
import { cn } from "@/lib/utils";

interface UiMessage {
  id: string;
  role: "user" | "assistant";
  /** "text" = chat bubble, "recipe" = a generated recipe committed into the thread. */
  kind?: "text" | "recipe";
  content?: string;
  suggestions?: string[] | null;
  intentMeta?: IntentMeta | null;
  isLimit?: boolean;
  recipe?: Recipe | null;
}

const GREETING: UiMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hey! 👋 I'm your personal cooking concierge. Tell me a craving, an ingredient, or a dish — and I'll find you something delicious and generate the full recipe right here.",
  suggestions: ["Quick weeknight dinners", "Cozy comfort food", "Healthy & light meals", "Something else?"],
};

function ChatInner() {
  const { isAuthenticated, loading } = useRequireAuth();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q");

  const [conversationId] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : `conv-${Date.now()}`,
  );
  const [messages, setMessages] = useState<UiMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Inline recipe generation (the chat IS the generator now).
  const gen = useRecipeGeneration();
  const [activeGenTitle, setActiveGenTitle] = useState("");

  // Keep a ref of messages so `send` can build history without being re-created each render.
  const messagesRef = useRef<UiMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const generating = gen.status === "starting" || gen.status === "processing";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, gen.status, gen.progress]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message) return;

      const history: ChatHistoryItem[] = messagesRef.current
        .filter((m) => m.id !== "greeting" && m.kind !== "recipe" && m.content)
        .map((m) => ({ role: m.role, content: m.content as string }));

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: message },
      ]);
      setInput("");
      setSending(true);

      try {
        const res = await api.chat({
          conversation_id: conversationId,
          message,
          message_history: history,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: res.reply,
            suggestions: res.suggestions,
            intentMeta: res.intent_meta,
          },
        ]);
      } catch (err) {
        const isLimit =
          err instanceof ApiError &&
          (err.status === 403 || err.errorType === "SUBSCRIPTION_LIMIT_REACHED");
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.",
            isLimit,
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [conversationId],
  );

  // Auto-send a query passed in via ?q= (e.g. from the homepage hero), once signed in.
  const autoSent = useRef(false);
  useEffect(() => {
    if (initialQ && !autoSent.current && isAuthenticated && !loading) {
      autoSent.current = true;
      void send(initialQ);
    }
  }, [initialQ, isAuthenticated, loading, send]);

  // When inline generation finishes, commit the result (or error) into the thread and reset
  // the generator so the user can keep chatting / generate again.
  useEffect(() => {
    if (gen.status === "completed" && gen.recipe) {
      const finished = gen.recipe;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", kind: "recipe", recipe: finished },
      ]);
      gen.reset();
    } else if (gen.status === "failed") {
      const msg = gen.error;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: msg || "Sorry, I couldn't generate that recipe. Want to try a different one?",
        },
      ]);
      gen.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen.status]);

  const handleGenerate = (title: string) => {
    if (generating) return;
    setActiveGenTitle(title);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: `Generate: ${title}` },
    ]);
    void gen.start(title, isAuthenticated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col px-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length <= 1 && !generating && !sending ? (
          // Empty state — centered welcome, no awkward gap.
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
                <path d="M7 21h10a1 1 0 0 0 1-1v-3H6v3a1 1 0 0 0 1 1Zm9.5-16A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-8.96.86A3.5 3.5 0 0 0 6 15h12a3.5 3.5 0 0 0 .96-6.86A4.49 4.49 0 0 0 16.5 5Z" />
              </svg>
            </div>
            <h1 className="mt-5 text-2xl font-bold sm:text-3xl">What can I cook for you?</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tell me a craving, an ingredient, or a dish — I&apos;ll find something and
              generate the full recipe.
            </p>
            {messages[0]?.suggestions && messages[0].suggestions.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {messages[0].suggestions.map((s, i) => (
                  <button
                    key={`${s}-${i}`}
                    onClick={() => void send(s)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-5">
            {messages
              .filter((m) => m.id !== "greeting")
              .map((m) => {
          // A generated recipe committed into the conversation.
          if (m.kind === "recipe" && m.recipe) {
            return (
              <div key={m.id} className="space-y-3">
                <RecipeView recipe={m.recipe} locked={!!m.recipe.isLocked} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {m.recipe.id && !m.recipe.isLocked && (
                    <LinkButton href={`/recipe/${m.recipe.id}`} variant="ghost" size="sm">
                      Open full page →
                    </LinkButton>
                  )}
                  {m.recipe.isLocked && (
                    <Link
                      href="/pricing"
                      className="text-sm font-semibold text-brand hover:underline"
                    >
                      Upgrade to unlock the full recipe →
                    </Link>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={m.id}>
              <div className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-md bg-brand text-white"
                      : m.isLimit
                        ? "rounded-bl-md border border-amber-200 bg-amber-50 text-amber-900"
                        : "rounded-bl-md border border-border bg-white text-foreground",
                  )}
                >
                  {m.content}
                  {m.isLimit && (
                    <Link href="/pricing" className="mt-2 block font-semibold text-brand underline">
                      Upgrade for more →
                    </Link>
                  )}
                </div>
              </div>

              {/* Recipe intent card → generate inline */}
              {m.role === "assistant" && m.intentMeta?.is_recipe_intent && (
                <div className="mt-1 max-w-[85%]">
                  <RecipeIntentCard meta={m.intentMeta} onGenerate={handleGenerate} />
                </div>
              )}

              {/* Suggestion chips → keep the conversation going */}
              {m.role === "assistant" && m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-2 flex max-w-[85%] flex-wrap gap-2">
                  {m.suggestions.map((s, i) => (
                    <button
                      key={`${s}-${i}`}
                      onClick={() => void send(s)}
                      disabled={sending || generating}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Active inline generation */}
        {generating && (
          <div className="rounded-2xl border border-border bg-white p-4">
            <GenerationProgress
              query={activeGenTitle}
              progress={gen.progress}
              partial={gen.partial}
              onCancel={() => void gen.cancel()}
            />
          </div>
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4 text-brand" />
              Thinking…
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border py-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for a recipe, an idea, or a cooking tip…"
            className="h-12 flex-1 rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="submit"
            disabled={sending || input.trim().length === 0}
            className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ChatInner />
    </Suspense>
  );
}
