import { Bot, User, Volume2, Loader2 } from "lucide-react";
import { useState } from "react";
import type { ChatMessage as ChatMessageType, DataCard } from "@/lib/types";
import { DataCardDisplay } from "./DataCardDisplay";
import { textToSpeech } from "@/lib/api";

interface ChatMessageProps {
  message: ChatMessageType;
  onCloseCard: (messageId: string, cardId: string) => void;
  onPinCard: (card: DataCard) => void;
}

export function ChatMessageComponent({ message, onCloseCard, onPinCard }: ChatMessageProps) {
  const isBot = message.role === "assistant";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioSrc = await textToSpeech(message.content.slice(0, 500));
      const audio = new Audio(audioSrc);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play();
    } catch {
      setIsSpeaking(false);
    }
  };

  return (
    <div
      className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}
      data-testid={`message-${message.id}`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isBot ? (
          <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center pulse-ring">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-2 max-w-[85%] min-w-0 ${isBot ? "" : "items-end"}`}>
        {/* Role label */}
        <span className="text-xs font-medium text-muted-foreground">
          {isBot ? "Arqos" : "You"}
        </span>

        {/* Message text */}
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isBot
              ? "bg-card border border-card-border"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {line}
            </p>
          ))}
        </div>

        {/* TTS button for bot messages */}
        {isBot && message.content.length > 10 && (
          <button
            onClick={handleSpeak}
            disabled={isSpeaking}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid={`speak-${message.id}`}
          >
            {isSpeaking ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
            {isSpeaking ? "Speaking..." : "Listen"}
          </button>
        )}

        {/* Cards */}
        {message.cards && message.cards.length > 0 && (
          <div className="flex flex-col gap-2 w-full mt-1">
            {message.cards.map((card) => (
              <DataCardDisplay
                key={card.id}
                card={card}
                onClose={() => onCloseCard(message.id, card.id)}
                onPin={onPinCard}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/60">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

/** Streaming message — renders partial text as it arrives */
export function StreamingMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3" data-testid="streaming-message">
      <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center pulse-ring shrink-0">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col gap-2 max-w-[85%] min-w-0">
        <span className="text-xs font-medium text-muted-foreground">Arqos</span>
        <div className="rounded-xl px-4 py-3 text-sm leading-relaxed bg-card border border-card-border">
          {text.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {line}
              {/* Blinking cursor on last line */}
              {i === text.split("\n").length - 1 && (
                <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-text-bottom" />
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3" data-testid="typing-indicator">
      <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Arqos</span>
        <div className="bg-card border border-card-border rounded-xl px-4 py-3 flex gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
