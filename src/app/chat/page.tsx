"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/command/command-palette";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Send, Brain, BarChart3, Settings, Loader2, Copy, RefreshCw, Check } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const memoryContext = {
  startupName: "TechStart",
  pivotDate: "November 2024",
  pivotFrom: "B2C to B2B",
  targetMarkets: ["US", "EU"],
  currentMRR: "$2,400",
  teamSize: 5,
  goals: ["Launch MVP", "Get 10 paying customers"],
  recentDecisions: [
    "Pivot to B2B from B2C",
    "Launch with $49/$149/$399 pricing tiers",
    "Target US + EU markets first"
  ]
};

const aiResponses = [
  `Based on your startup's memory, I recall several key points:

• You pivoted to B2B in ${memoryContext.pivotDate}
• Target markets: ${memoryContext.targetMarkets.join(" and ")}
• Current MRR: ${memoryContext.currentMRR}
• Team size: ${memoryContext.teamSize} members

Let me help you work through this. Would you like me to draft something based on this context?`,

  `I remember we discussed this recently. Here are the relevant decisions from your memory:

• ${memoryContext.recentDecisions[0]} (${memoryContext.pivotDate})
• ${memoryContext.recentDecisions[1]}
• ${memoryContext.recentDecisions[2]}

Shall I elaborate on any of these points?`,

  `Great question! Based on ${memoryContext.startupName}'s history:

📊 Key Metrics:
• MRR: ${memoryContext.currentMRR}
• Team: ${memoryContext.teamSize} members
• Focus: ${memoryContext.targetMarkets.join(", ")} markets

🎯 Active Goals:
• ${memoryContext.goals[0]}
• ${memoryContext.goals[1]}

Want me to dive deeper into any specific area?`
];

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
  content: `Hi! I'm your Startup Agent. I'll help you remember decisions, track goals, and stay accountable.

What would you like to work on today?`,
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
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold">Chat</h1>
              <p className="text-sm text-muted-foreground">
                Chat with AI that knows your startup
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/settings/api-keys">
                <Settings className="h-4 w-4 mr-2" />
                Configure AI
              </a>
            </Button>
          </div>

          {/* Messages */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "assistant"
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <svg
                        className="h-4 w-4 text-primary-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium">SC</span>
                    )}
                  </div>
                  <div className="flex-1 max-w-[85%]">
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="text-xs h-7"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Context Bar */}
            <div className="border-t px-4 py-2 flex items-center gap-2 text-xs bg-muted/30">
              <Badge variant="secondary" className="gap-1">
                <Brain className="h-3 w-3" />
                Memory: Active
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                Context: {memoryContext.startupName}
              </Badge>
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[56px] max-h-[200px] resize-none"
                />
                <Button
                  size="icon"
                  className="h-[56px] w-[56px]"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
