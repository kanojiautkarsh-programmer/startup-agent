"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { Send, Brain, Settings, RefreshCw, Check, Copy, Sparkles, Wand2, ShieldCheck, BarChart2, BookOpen, AlertTriangle, FileText, DollarSign, Presentation } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/lib/analytics/useAnalytics";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: "Strategic overview",  icon: BarChart2 },
  { label: "Summarize memory",     icon: BookOpen },
  { label: "Commitment check",     icon: Check },
  { label: "Risk assessment",      icon: AlertTriangle },
  { label: "Decision logging",     icon: FileText },
  { label: "Investor brief",       icon: Presentation },
];

const getWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content: `Hello! I'm your TaskLyne — your AI Chief of Staff.\n\nI can help you with strategic planning, decision logging, memory summaries, goal tracking, and more. What would you like to work on today?`,
  timestamp: new Date(),
});

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([getWelcomeMessage()]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { trackPageView, trackAIChat } = useAnalytics();

  React.useEffect(() => {
    trackPageView('/chat');
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: input }])
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      trackAIChat('github', userMessage.content.length);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key in settings.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-dvh bg-background font-sans selection:bg-primary/10">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <Header
        onOpenCommand={() => setCommandOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main
        className={`pt-14 h-dvh flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? "pl-16" : "pl-60"
        }`}
      >
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-2 md:p-8 overflow-hidden">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-8 px-2 pt-4 animate-slide-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight font-medium text-balance">
                Chat <span className="italic font-normal text-muted-foreground/60">&amp; Intelligence</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true" />
                <p className="text-xs font-medium text-muted-foreground">AI assistant active</p>
              </div>
            </div>
            <Link
              href="/settings/api-keys"
              className="group h-10 px-5 rounded-full border border-border/60 hover:bg-emphasis hover:text-emphasis-fg transition-colors duration-150 flex items-center gap-2 text-xs font-medium shadow-sm"
            >
              <Settings className="size-3.5 transition-transform duration-150 group-hover:rotate-45" aria-hidden="true" />
              Configure
            </Link>
          </div>

          {/* Chat container */}
          <div className="flex-1 flex flex-col bg-background border border-border/40 rounded-3xl overflow-hidden mb-6 shadow-sm">
            {/* Chat header strip */}
            <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3 bg-muted/30">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border/40 text-[10px] font-bold text-foreground shadow-sm">
                <Sparkles className="size-3 text-primary" aria-hidden="true" />
                context_01
              </span>
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border/40 text-[10px] font-bold text-muted-foreground shadow-sm">
                <ShieldCheck className="size-3 text-green-500" aria-hidden="true" />
                secure
              </span>
            </div>

            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fade-in-up ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`size-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                      message.role === "assistant"
                        ? "bg-emphasis text-emphasis-fg border-transparent"
                        : "bg-card border-border/60 text-foreground"
                    }`}
                    aria-hidden="true"
                  >
                    {message.role === "assistant" ? (
                      <Brain className="size-4" />
                    ) : (
                      <span className="text-[10px] font-bold">You</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col flex-1 max-w-[85%] md:max-w-[70%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-3xl px-5 py-4 border ${
                        message.role === "assistant"
                          ? "bg-card border-border/40"
                          : "bg-muted border-border/40"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-pretty">
                        {message.content}
                      </p>
                    </div>
                    <div className={`flex items-center gap-4 mt-2 px-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <span className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          aria-label={copiedId === message.id ? "Copied" : "Copy message"}
                          className="text-[10px] font-medium text-muted-foreground/40 hover:text-foreground flex items-center gap-1.5 transition-colors duration-150"
                        >
                          {copiedId === message.id ? (
                            <><Check className="size-3 text-green-500" aria-hidden="true" /> Copied</>
                          ) : (
                            <><Copy className="size-3" aria-hidden="true" /> Copy</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator — wave animation, compositor-only */}
              {isLoading && (
                <div className="flex gap-4 animate-fade-in" aria-busy="true" aria-label="Assistant is thinking">
                  <div className="size-10 rounded-2xl bg-emphasis text-emphasis-fg flex items-center justify-center shrink-0 shadow-sm" aria-hidden="true">
                    <Brain className="size-4" />
                  </div>
                  <div className="flex-1 max-w-[70%]">
                    <div className="rounded-3xl px-6 py-5 bg-card border border-border/40 flex items-center gap-3 w-fit shadow-sm">
                      <div className="flex gap-1" aria-hidden="true">
                        <span className="size-2 rounded-full bg-primary/60 animate-wave" style={{ animationDelay: "0ms" }} />
                        <span className="size-2 rounded-full bg-primary/60 animate-wave" style={{ animationDelay: "180ms" }} />
                        <span className="size-2 rounded-full bg-primary/60 animate-wave" style={{ animationDelay: "360ms" }} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground/60">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-6 pb-6 md:px-10 md:pb-8 pt-3 bg-muted/10 border-t border-border/30">
              {messages.length === 1 && !isLoading && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 px-1" aria-hidden="true">
                    <Wand2 className="size-3 text-muted-foreground/40" />
                    <p className="text-xs font-medium text-muted-foreground/60">Suggestions</p>
                  </div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Quick action suggestions">
                    {quickActions.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => handleQuickAction(label)}
                        className="flex items-center gap-1.5 text-xs rounded-full border border-border/60 bg-card px-4 py-2 hover:bg-emphasis hover:text-emphasis-fg transition-colors duration-150 font-medium text-foreground/70 shadow-sm"
                      >
                        <Icon className="size-3 shrink-0" aria-hidden="true" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Textarea — removed blur-2xl glow (large surface paint) */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id="chat-input"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Message input"
                  aria-multiline="true"
                  className="w-full min-h-[64px] max-h-[200px] resize-none rounded-2xl border border-border/60 bg-card px-6 py-4 pr-16 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors duration-150 placeholder:text-muted-foreground/40 font-medium shadow-sm"
                  rows={1}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-xl bg-emphasis text-emphasis-fg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary transition-colors duration-150 shadow-sm active:scale-95"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4 ml-0.5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-2 px-2">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}




