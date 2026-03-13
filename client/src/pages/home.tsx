import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, DataCard, AIEngine } from "@/lib/types";
import { quickActions } from "@/lib/mock-data";
import { sendChatMessage, sendPerplexityMessage, clearChat } from "@/lib/api";
import { ChatMessageComponent, TypingIndicator, StreamingMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TopBar } from "@/components/TopBar";
import { RightSidebar } from "@/components/RightSidebar";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { ArqosHeroIcon } from "@/components/ArqosLogo";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Realco Intelligence. I'm Arqos — your AI guide built on years of Dubai market data. I learn from every deal, every trend, and every cycle to help you make better decisions today.\n\nWhat would you like to explore?",
      timestamp: new Date(),
      cards: [],
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinnedCards, setPinnedCards] = useState<DataCard[]>([]);
  const [aiEngine, setAiEngine] = useState<AIEngine>("gemini");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, streamingText, scrollToBottom]);

  const handleSend = useCallback(
    (text: string) => {
      if (isStreaming) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingText("");

      const abortController = new AbortController();
      abortRef.current = abortController;

      let accumulated = "";
      let pendingCards: DataCard[] = [];

      const sendFn = aiEngine === "perplexity" ? sendPerplexityMessage : sendChatMessage;

      sendFn(
        text,
        {
          onText: (chunk) => {
            accumulated += chunk;
            // Strip arqos-card blocks from display text
            const displayText = accumulated.replace(/```arqos-card\n[\s\S]*?```/g, "").trim();
            setStreamingText(displayText);
          },
          onCards: (cards) => {
            pendingCards = cards;
          },
          onDone: () => {
            const displayText = accumulated.replace(/```arqos-card\n[\s\S]*?```/g, "").trim();
            const botMsg: ChatMessage = {
              id: `bot-${Date.now()}`,
              role: "assistant",
              content: displayText,
              timestamp: new Date(),
              cards: pendingCards,
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsStreaming(false);
            setStreamingText("");
            abortRef.current = null;
          },
          onError: (errorMessage) => {
            const errorMsg: ChatMessage = {
              id: `bot-error-${Date.now()}`,
              role: "assistant",
              content: `I apologize, but I encountered an issue: ${errorMessage}. Please try again.`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
            setIsStreaming(false);
            setStreamingText("");
            abortRef.current = null;
          },
        },
        abortController.signal
      );
    },
    [isStreaming, aiEngine]
  );

  const handleClear = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    clearChat();
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Conversation cleared. I'm Arqos — ready to help with Dubai market intelligence. What would you like to explore?",
        timestamp: new Date(),
        cards: [],
      },
    ]);
    setIsStreaming(false);
    setStreamingText("");
  }, []);

  const handleCloseCard = useCallback((messageId: string, cardId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, cards: msg.cards?.filter((c) => c.id !== cardId) }
          : msg
      )
    );
  }, []);

  const handlePinCard = useCallback((card: DataCard) => {
    setPinnedCards((prev) => {
      if (prev.find((c) => c.id === card.id)) {
        return prev.filter((c) => c.id !== card.id);
      }
      return [...prev, { ...card, pinned: true }];
    });
    setSidebarOpen(true);
  }, []);

  const handleRemovePin = useCallback((cardId: string) => {
    setPinnedCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const hasUserMessages = messages.length > 1;

  return (
    <div className="h-full flex flex-col overflow-hidden" data-testid="app-container">
      <TopBar
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        sidebarOpen={sidebarOpen}
        onClearChat={handleClear}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {/* Welcome hero when no user messages yet */}
              {!hasUserMessages && (
                <div className="text-center py-8" data-testid="welcome-hero">
                  {/* Animated sketchy icon */}
                  <div className="relative inline-block mb-5">
                    <ArqosHeroIcon />
                  </div>

                  {/* Name with gold shimmer */}
                  <h1 className="text-2xl font-bold mb-1">
                    <span className="gold-shimmer">ARQOS</span>
                  </h1>

                  {/* Tagline — the meaning */}
                  <p className="tagline-animate text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mb-3">
                    Trust in Past Data to Assist Humans
                  </p>

                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your Realco AI guide. Built on years of Dubai market data — every deal, every
                    trend, every cycle — to help you make better decisions today.
                  </p>

                  {/* Live status indicator */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {aiEngine === "perplexity"
                        ? "Powered by Perplexity Sonar — Live"
                        : "Powered by Gemini AI — Live"}
                    </span>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <ChatMessageComponent
                  key={msg.id}
                  message={msg}
                  onCloseCard={handleCloseCard}
                  onPinCard={handlePinCard}
                />
              ))}

              {/* Streaming response */}
              {isStreaming && streamingText && (
                <StreamingMessage text={streamingText} />
              )}

              {/* Typing indicator (before text starts streaming) */}
              {isStreaming && !streamingText && <TypingIndicator />}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              onSend={handleSend}
              disabled={isStreaming}
              quickActions={quickActions}
              showQuickActions={!hasUserMessages}
              aiEngine={aiEngine}
              onToggleEngine={setAiEngine}
            />
          </div>

          {/* Attribution */}
          <div className="text-center pb-2">
            <PerplexityAttribution />
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pinnedCards={pinnedCards}
          onRemovePin={handleRemovePin}
        />
      </div>
    </div>
  );
}
