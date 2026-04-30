/**
 * MentorMessage — Individual message bubble for Mentor chat
 *
 * Supports: user, assistant, system roles
 * Features: timestamp, model badge, auto-link detection
 */

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface MentorMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  modelUsed?: string;
  createdAt: string;
  isLast?: boolean;
}

export const MentorMessage = ({
  role,
  content,
  modelUsed,
  createdAt,
  isLast,
}: MentorMessageProps) => {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  const time = new Date(createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row",
        isLast && "mb-1"
      )}
    >
      {/* Avatar */}
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mc-dark-blue/10 flex items-center justify-center">
          <User className="w-4 h-4 text-mc-dark-blue" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-body",
          isUser
            ? "bg-mc-dark-blue text-white rounded-tr-md"
            : "bg-card border border-border rounded-tl-md shadow-card"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>

        {/* Footer: time + model */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1.5 text-caption",
            isUser ? "text-white/60 justify-end" : "text-muted-foreground"
          )}
        >
          <span>{time}</span>
          {isAssistant && modelUsed && modelUsed !== "fallback" && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-medium",
                "bg-primary/10 text-primary"
              )}
            >
              {modelUsed.split("/").pop()?.split(":")[0] || modelUsed}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorMessage;
