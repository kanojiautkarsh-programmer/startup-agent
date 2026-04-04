"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { Send, Brain, Settings, RefreshCw, Check, Copy, Sparkles, Wand2, ShieldCheck, BarChart2, BookOpen, AlertTriangle, FileText, DollarSign, Presentation, Plus } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/lib/analytics/useAnalytics";
import { cn } from "@/lib/utils";

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
  content: `Hello! I'm TaskLyne — your AI Chief of Staff.\n\nI can help you with strategic planning, decision logging, memory summaries, goal tracking, and more. What would you like to work on today?`,
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
        user={null}
      />
      <Header
        onOpenCommand={() => setCommandOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        user={null}
      />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <main
        className={cn(
          "pt-16 h-dvh flex flex-col transition-all duration-500",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 md:p-8 overflow-hidden">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2 animate-slide-up">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.25em] mb-2">
                <Brain className="size-3" />
                Intelligence Stream
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                Neural <span className="text-muted-foreground/40 font-medium">Workspace</span>
              </h1>
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="size-3.5 text-primary" />
                  TaskLyne context is synchronized and active.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMessages([getWelcomeMessage()])}
                className="group h-12 px-6 rounded-2xl border border-border/40 hover:bg-muted/20 transition-all flex items-center gap-2 text-xs font-bold tracking-tight shadow-sm"
              >
                <Plus className="size-4 group-hover:rotate-90 transition-transform" />
                New Session
              </button>
              <Link
                href="/settings/api-keys"
                className="group h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 text-xs font-bold tracking-tight shadow-xl shadow-primary/20"
              >
                <Settings className="size-4 group-hover:rotate-45 transition-transform" />
                Configure
              </Link>
            </div>
          </div>

          {/* Chat container */}
          <div className="flex-1 flex flex-col premium-glass border border-border/40 rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl relative">
            
            {/* Header Strip */}
            <div className="px-8 py-5 border-b border-border/20 flex items-center justify-between bg-muted/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary tracking-widest uppercase">
                  <Sparkles className="size-3" />
                  context_active
                </span>
                <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500 tracking-widest uppercase">
                  <ShieldCheck className="size-3" />
                  encrypted
                </span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Protocol 4.0</span>
              </div>
            </div>

            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-6 animate-slide-up",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "size-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-xl transition-all duration-300",
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground border-transparent shadow-primary/20"
                        : "bg-muted/20 border-border/40 text-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Brain className="size-5" />
                    ) : (
                      <span className="text-[10px] font-bold">YOU</span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={cn(
                    "flex flex-col flex-1 max-w-[85%] md:max-w-[75%]",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div
                      className={cn(
                        "rounded-[2rem] px-8 py-6 border transition-all duration-300 shadow-sm",
                        message.role === "assistant"
                          ? "bg-card/40 border-border/40 hover:border-primary/20"
                          : "bg-primary/5 border-primary/20"
                      )}
                    >
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
                        {message.content}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-6 mt-3 px-4",
                      message.role === "user" ? "flex-row-reverse" : ""
                    )}>
                      <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums tracking-widest uppercase">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="group flex items-center gap-2 text-[10px] font-bold text-muted-foreground/30 hover:text-primary transition-colors tracking-widest uppercase"
                        >
                          {copiedId === message.id ? (
                            <><Check className="size-3 text-green-500" /> Copied</>
                          ) : (
                            <><Copy className="size-3" /> Copy Context</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-6 animate-slide-up">
                  <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xl shadow-primary/10">
                    <Brain className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="rounded-[2rem] px-8 py-6 bg-card/40 border border-border/40 flex items-center gap-4 w-fit shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="size-2 rounded-full bg-primary animate-bounce-slow" />
                        <span className="size-2 rounded-full bg-primary animate-bounce-slow [animation-delay:200ms]" />
                        <span className="size-2 rounded-full bg-primary animate-bounce-slow [animation-delay:400ms]" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Synthesizing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-8 pb-8 md:px-12 md:pb-10 pt-4 bg-muted/5 border-t border-border/20 backdrop-blur-xl">
              {messages.length === 1 && !isLoading && (
                <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Wand2 className="size-3 text-primary/60" />
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Operational Protocols</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {quickActions.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => handleQuickAction(label)}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest rounded-full border border-border/40 bg-card/40 px-5 py-3 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all shadow-sm active:scale-95"
                      >
                        <Icon className="size-3.5 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    id="chat-input"
                    placeholder="Brief TaskLyne about your next move..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full min-h-[72px] max-h-[240px] resize-none rounded-[1.5rem] border border-border/40 bg-card/60 px-8 py-5 pr-20 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 font-medium shadow-inner custom-scrollbar"
                    rows={1}
                  />
                  <button
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 size-12 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-20 disabled:grayscale hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20 overflow-hidden"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="size-5 animate-spin" />
                    ) : (
                      <Send className="size-5 ml-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 px-4">
                 <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                  Secure Intelligence Session
                </p>
                <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest tabular-nums">
                  {input.length} characters
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
