/**
 * MentorChat — Chat interface for Mentor IA
 *
 * Shows: message list, typing indicator, input area
 * Features: auto-scroll, send on enter, character count
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MentorMessage } from "./MentorMessage";
import type { MentorMessage as MentorMessageType } from "@/hooks/useMentor";
import { trackMentorMessageSent } from "@/lib/analytics";

interface MentorChatProps {
  messages: MentorMessageType[];
  sending: boolean;
  error: string | null;
  onSend: (content: string) => Promise<void>;
  onClearError: () => void;
}

export const MentorChat = ({
  messages,
  sending,
  error,
  onSend,
  onClearError,
}: MentorChatProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 1000;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;

    const message = input.trim();
    setInput("");
    trackMentorMessageSent("current", message.length);
    await onSend(message);
  }, [input, sending, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInput(value);
      if (error) onClearError();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  const charCount = input.length;
  const isNearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-label="Conversación con Mentor IA"
        aria-live="polite"
      >
        {messages.map((msg, i) => (
          <MentorMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            modelUsed={msg.model_used}
            createdAt={msg.created_at}
            isLast={i === messages.length - 1}
          />
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-2 animate-in fade-in duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 shadow-card">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-body-sm text-destructive">
            {error}
            <button
              onClick={onClearError}
              className="ml-2 underline hover:no-underline"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu consulta..."
              rows={1}
              className={cn(
                "w-full resize-none rounded-2xl border border-input bg-background",
                "px-4 py-2.5 pr-16 text-body",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                "transition-all duration-150",
                "min-h-[44px] max-h-[120px]"
              )}
              disabled={sending}
              aria-label="Mensaje para el Mentor IA"
            />
            {/* Character count */}
            <span
              className={cn(
                "absolute right-3 bottom-2 text-caption transition-colors",
                isNearLimit ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>

          <Button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
            className="flex-shrink-0 w-11 h-11 rounded-full"
            aria-label="Enviar mensaje"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <p className="text-caption text-muted-foreground text-center mt-2">
          El Mentor IA puede cometer errores. Verificá la información importante.
        </p>
      </div>
    </div>
  );
};

export default MentorChat;
