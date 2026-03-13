import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Globe, Cpu } from "lucide-react";
import type { QuickAction, AIEngine } from "@/lib/types";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  quickActions: QuickAction[];
  showQuickActions: boolean;
  aiEngine?: AIEngine;
  onToggleEngine?: (engine: AIEngine) => void;
}

export function ChatInput({ onSend, disabled, quickActions, showQuickActions, aiEngine = "gemini", onToggleEngine }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Quick Actions */}
      {showQuickActions && (
        <div className="flex flex-wrap gap-2 mb-3" data-testid="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSend(action.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors text-xs font-medium"
              data-testid={`quick-action-${action.id}`}
            >
              <Sparkles className="w-3 h-3 text-primary" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="gradient-border rounded-xl bg-card border border-card-border">
        <div className="flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              aiEngine === "perplexity"
                ? "Ask Arqos with web search powered by Perplexity..."
                : "Ask Arqos anything about Dubai real estate..."
            }
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent resize-none outline-none text-sm px-2 py-1.5 placeholder:text-muted-foreground/50 min-h-[36px] max-h-[120px]"
            data-testid="chat-input"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled}
            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            data-testid="send-button"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom row: engine selector + powered by */}
        <div className="px-3 pb-2 flex items-center justify-between gap-2">
          {/* AI Engine Selector */}
          {onToggleEngine && (
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5" data-testid="ai-engine-selector">
              <button
                onClick={() => onToggleEngine("gemini")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  aiEngine === "gemini"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="engine-gemini"
              >
                <Cpu className="w-3 h-3" />
                Gemini
              </button>
              <button
                onClick={() => onToggleEngine("perplexity")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  aiEngine === "perplexity"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="engine-perplexity"
              >
                <Globe className="w-3 h-3" />
                Perplexity
              </button>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/50 ml-auto">
            Powered by Realco Intelligence — Data-driven. Truthful. Always.
          </span>
        </div>
      </div>
    </div>
  );
}
