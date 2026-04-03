"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { Send, Brain, BarChart3, Settings, RefreshCw, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/lib/analytics/useAnalytics";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  "Draft investor update",
  "Create decision log",
  "Set a new goal",
  "Check progress",
  "Generate report",
  "Add commitment"
];

const getWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content: `Hi! I'll help you remember decisions, track goals, and stay accountable.\n\nWhat would you like to work on today?`,
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
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}. Please check your API key configuration.`,
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
    <div className="min-h-screen bg-background font-sans">
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
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h1 className="text-3xl font-serif tracking-tight font-medium">Assistant <span className="italic font-normal">& Chat</span></h1>
            </div>
            <Link 
              href="/settings/api-keys"
              className="text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center"
            >
              <Settings className="h-3 w-3 mr-1.5" />
              Keys
            </Link>
          </div>

          <div className="flex-1 flex flex-col bg-background border rounded-[2rem] overflow-hidden mb-2">
            <div className="px-6 py-4 border-b flex items-center gap-3 bg-muted/20">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border text-[10px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
                <Brain className="h-3 w-3" /> Active
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border text-[10px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
                <BarChart3 className="h-3 w-3" /> Context Loaded
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fade-in-up ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                      message.role === "assistant"
                        ? "bg-[#2D211B] border-[#2D211B] text-white"
                        : "bg-background border-border text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Brain className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-semibold tracking-wider">U</span>
                    )}
                  </div>
                  <div className="flex-1 max-w-[85%] md:max-w-[75%]">
                    <div
                      className={`rounded-[1.5rem] px-5 py-4 ${
                        message.role === "assistant"
                          ? "bg-muted/30 border"
                          : "bg-muted border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-4 mt-2 px-2 ${message.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <><Check className="h-3 w-3 text-green-500" /> Copied</>
                          ) : (
                            <><Copy className="h-3 w-3" /> Copy</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-[#2D211B] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="flex-1 max-w-[75%]">
                    <div className="rounded-[1.5rem] px-5 py-5 bg-muted/30 border flex items-center gap-3 w-fit">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-6 bg-background pt-2 w-full mt-auto">
              {messages.length === 1 && !isLoading && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground mb-3 px-2">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        className="text-xs rounded-full border border-border/80 bg-background px-4 py-2 hover:bg-muted/50 transition-colors font-medium text-foreground/80"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <textarea
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full min-h-[60px] max-h-[200px] resize-none rounded-[1.5rem] border bg-muted/20 px-6 py-4 pr-16 text-sm focus:outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/60"
                  rows={1}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-[#2D211B] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2D211B]/90 transition-colors shadow-sm"
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
              <p className="text-[10px] text-muted-foreground/60 mt-3 text-center uppercase tracking-widest font-bold">
                Enter to send <span className="mx-2 opacity-50">•</span> Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
