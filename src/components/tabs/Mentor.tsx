/**
 * Mentor — Main tab component for Modo Mentor IA
 *
 * Features:
 * - Welcome screen with quick actions (new conversation)
 * - Chat interface with AI mentor
 * - Conversation history sidebar
 * - Personalized context from user profile + diagnostic
 */

import { useState, useEffect, useCallback } from "react";
import { Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMentorChat } from "@/hooks/useMentor";
import { MentorWelcome } from "@/components/mentor/MentorWelcome";
import { MentorChat } from "@/components/mentor/MentorChat";
import { MentorHistory } from "@/components/mentor/MentorHistory";
import { trackMentorQuickAction, trackMentorNewConversation } from "@/lib/analytics";

const Mentor = () => {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string | undefined>();
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const {
    messages,
    loading,
    sending,
    error,
    conversationId,
    sendMessage,
    startNewConversation,
    loadConversation,
    clearError,
  } = useMentorChat();

  // Load user context
  useEffect(() => {
    if (!user) return;

    const loadContext = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("empresa, cargo")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.empresa) {
        setUserName(user.user_metadata?.nombre || user.email?.split("@")[0]);
      }

      const { data: diagnostic } = await supabase
        .from("diagnostic_results")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      setHasDiagnostic(!!diagnostic);
    };

    loadContext();
  }, [user]);

  // Switch to chat view when conversation starts
  useEffect(() => {
    if (messages.length > 0 || conversationId) {
      setShowWelcome(false);
    }
  }, [messages, conversationId]);

  const handleQuickAction = useCallback(
    async (prompt: string) => {
      trackMentorQuickAction(prompt.substring(0, 50));
      setShowWelcome(false);
      await sendMessage(prompt);
    },
    [sendMessage]
  );

  const handleNewConversation = useCallback(() => {
    trackMentorNewConversation();
    startNewConversation();
    setShowWelcome(true);
  }, [startNewConversation]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      loadConversation(id);
      setShowWelcome(false);
    },
    [loadConversation]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-subtitle font-semibold">Mentor IA</h2>
            <p className="text-caption text-muted-foreground">
              Tu asistente de negocios personalizado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!showWelcome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewConversation}
              aria-label="Nueva conversación"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
          <MentorHistory
            currentConversationId={conversationId}
            onSelect={handleSelectConversation}
            onNew={handleNewConversation}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" aria-live="polite">
        {showWelcome && messages.length === 0 ? (
          <MentorWelcome
            userName={userName}
            hasDiagnostic={hasDiagnostic}
            onQuickAction={handleQuickAction}
          />
        ) : (
          <MentorChat
            messages={messages}
            sending={sending}
            error={error}
            onSend={sendMessage}
            onClearError={clearError}
          />
        )}
      </div>
    </div>
  );
};

export default Mentor;
