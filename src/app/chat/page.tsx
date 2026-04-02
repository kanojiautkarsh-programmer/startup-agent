"use client";

export const dynamic = 'force-dynamic';

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Send, Brain, BarChart3, Settings, RefreshCw, Check, Copy } from "lucide-react";

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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-background">
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
              <p className="text-sm text-muted-foreground">
                Chat with your startup's memory
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/settings/api-keys">
                <Settings className="h-4 w-4 mr-2" />
                Configure Keys
              </a>
            </Button>
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col shadow-none rounded-xl">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-4">
              <Badge variant="secondary" className="gap-1.5 shadow-none rounded px-2 text-xs">
                <Brain className="h-3 w-3" />
                Memory: Active
              </Badge>
              <Badge variant="secondary" className="gap-1.5 shadow-none rounded px-2 text-xs">
                <BarChart3 className="h-3 w-3" />
                Context: Loaded
              </Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fade-in-up ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      message.role === "assistant"
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Brain className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">U</span>
                    )}
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div
                      className={`rounded-xl px-4 py-3 ${
                        message.role === "assistant"
                          ? "bg-muted/80"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-3 mt-2 ${message.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          {copiedId === message.id ? (
                            <><Check className="h-3 w-3 text-emerald-500" /> Copied</>
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
                  <div className="w-8 h-8 rounded-md bg-foreground text-background flex items-center justify-center">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="rounded-xl px-4 py-3 bg-muted/80">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Generating...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && !isLoading && (
              <div className="px-6 pb-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Suggested actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="text-xs h-8 border-border hover:bg-muted"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-4 bg-background">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] max-h-[200px] resize-none rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button
                  size="icon"
                  className="h-[60px] w-[60px] rounded-lg shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-wide font-medium">
                Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
