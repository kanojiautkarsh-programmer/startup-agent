"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { Send, Brain, BarChart3, Settings, RefreshCw, Check, Copy, Sparkles, Wand2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/lib/analytics/useAnalytics";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  "Strategic overview",
  "Summarize memory",
  "Commitment check",
  "Risk assessment",
  "Decision logging",
  "Investor brief"
];

const getWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content: `Systems initialized. I am ready to scale your startup's context.\n\nHow should we refine your strategy today?`,
  timestamp: new Date(),
});

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([getWelcomeMessage()]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<string>("github");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { trackPageView, trackAIChat, trackFeature } = useAnalytics();

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
      trackAIChat(provider, userMessage.content.length);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Operational Error: ${error instanceof Error ? error.message : 'Unknown exception'}. Verify system keys in settings.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
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
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
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
        className={`pt-14 h-screen flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "pl-16" : "pl-60"
        }`}
      >
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-2 md:p-8 overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-12 px-6 pt-4 animate-slide-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight font-medium">Assistant <span className="italic font-normal text-muted-foreground/60">& Intelligence</span></h1>
              <div className="flex items-center gap-3 mt-3">
                 <span className="w-1.5 h-4 bg-primary rounded-full" />
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Distributed Network Active</p>
              </div>
            </div>
            <Link 
              href="/settings/api-keys"
              className="group h-10 px-5 rounded-full border border-border/60 hover:bg-[#2D211B] hover:text-white transition-all flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              <Settings className="h-3.5 w-3.5 group-hover:rotate-45 transition-transform" />
              Configure Protocols
            </Link>
          </div>

          <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm border border-border/40 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden mb-6 shadow-2xl relative">
            <div className="px-8 py-5 border-b border-border/30 flex items-center gap-4 bg-muted/10">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border/40 text-[9px] font-bold uppercase tracking-[0.15em] text-foreground shadow-sm">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" /> context_01
              </span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border/40 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground shadow-sm">
                <ShieldCheck className="h-3 w-3 text-green-500" /> secure_link
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-6 animate-slide-up ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-md group ${
                      message.role === "assistant"
                        ? "bg-[#2D211B] border-[#2D211B] text-white"
                        : "bg-white border-border/60 text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Brain className="h-5 w-5" />
                    ) : (
                      <span className="text-xs font-bold tracking-widest uppercase">User</span>
                    )}
                  </div>
                  <div className={`flex flex-col flex-1 max-w-[85%] md:max-w-[70%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-[1.75rem] px-6 py-5 shadow-sm border transition-shadow hover:shadow-md ${
                        message.role === "assistant"
                          ? "bg-white border-border/40"
                          : "bg-[#FAF9F6] border-border/60"
                      }`}
                    >
                      <p className="text-sm md:text-base leading-[1.8] tracking-tight whitespace-pre-wrap font-medium">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-5 mt-4 px-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40 tabular-nums">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground flex items-center gap-2 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <><Check className="h-3 w-3 text-green-500" /> Copied</>
                          ) : (
                            <><Copy className="h-3 w-3" /> Copy Asset</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-6 animate-slide-up">
                  <div className="w-12 h-12 rounded-2xl bg-[#2D211B] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Brain className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="flex-1 max-w-[70%]">
                    <div className="rounded-[1.75rem] px-8 py-6 bg-white border border-border/40 flex items-center gap-4 w-fit shadow-sm">
                        <div className="flex gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Processing Context</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="px-8 pb-8 md:px-12 md:pb-12 pt-4 bg-white/50 backdrop-blur-md w-full mt-auto border-t border-border/30">
              {messages.length === 1 && !isLoading && (
                <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-4 px-2">
                     <Wand2 className="h-3 w-3 text-muted-foreground/40" />
                     <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">Tactical Suggestions</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        className="text-[10px] uppercase tracking-widest rounded-full border border-border/60 bg-white px-5 py-2.5 hover:bg-[#2D211B] hover:text-white transition-all font-bold text-foreground/60 shadow-sm"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="relative group animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="absolute inset-0 bg-[#2D211B]/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2rem]" />
                <textarea
                  placeholder="Ask intelligence system..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[70px] max-h-[250px] resize-none rounded-[2rem] border border-border/60 bg-white px-8 py-5 pr-16 text-sm md:text-base focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 font-medium relative z-10 shadow-sm"
                  rows={1}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-[#2D211B] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-all shadow-2xl z-20 active:scale-95"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 px-6">
                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-[0.25em] font-bold">
                  Enter to transmit <span className="mx-2 opacity-50">•</span> Shift+Enter for multiline
                </p>
                <div className="flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                   <span className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-widest">System Latency: 42ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
