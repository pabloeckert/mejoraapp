/**
 * useMentor — Hook para el Modo Mentor IA
 *
 * Provides: useMentorChat (chat interface), useMentorConversations (history)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ───────────────────────────────────────────────────────

export interface MentorMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model_used?: string;
  created_at: string;
}

export interface MentorConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  message_count?: number;
  last_message?: string;
}

interface UseMentorChatOptions {
  conversationId?: string;
}

interface UseMentorChatReturn {
  messages: MentorMessage[];
  loading: boolean;
  sending: boolean;
  streamingContent: string;
  error: string | null;
  conversationId: string | null;
  sendMessage: (content: string) => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (id: string) => void;
  clearError: () => void;
}

// ── Chat Hook ───────────────────────────────────────────────────

export function useMentorChat(options?: UseMentorChatOptions): UseMentorChatReturn {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    options?.conversationId || null
  );
  const abortRef = useRef<AbortController | null>(null);

  // Load existing messages when conversation changes
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("mentor_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (fetchError) throw fetchError;
        setMessages((data as MentorMessage[]) || []);
      } catch (e) {
        setError("Error al cargar mensajes");
        console.error("useMentor:loadMessages", e);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;

      setSending(true);
      setStreamingContent("");
      setError(null);

      // Optimistic: add user message immediately
      const userMsg: MentorMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || "",
        role: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) throw new Error("No hay sesión activa");

        // Abort previous request if still pending
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat-stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ message: content.trim(), conversationId }),
            signal: abortRef.current.signal,
          }
        );

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${res.status}`);
        }

        // Consume SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";
        let finalConversationId = conversationId;
        let finalModel = "unknown";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const payload = JSON.parse(trimmed.slice(6));

              if (payload.error) throw new Error(payload.error);

              if (payload.conversationId && !finalConversationId) {
                finalConversationId = payload.conversationId;
                setConversationId(payload.conversationId);
              }

              if (payload.chunk) {
                accumulated += payload.chunk;
                setStreamingContent(accumulated);
              }

              if (payload.done) {
                finalConversationId = payload.conversationId ?? finalConversationId;
                finalModel = payload.model ?? finalModel;
                if (!conversationId && finalConversationId) {
                  setConversationId(finalConversationId);
                }
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== "Unexpected token") {
                throw parseErr;
              }
            }
          }
        }

        // Flush: replace optimistic + streaming with final persisted messages
        setStreamingContent("");
        const convId = finalConversationId || conversationId || "";
        const assistantMsg: MentorMessage = {
          id: `assistant-${Date.now()}`,
          conversation_id: convId,
          role: "assistant",
          content: accumulated,
          model_used: finalModel,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== userMsg.id);
          return [
            ...withoutTemp,
            { ...userMsg, id: `user-${Date.now()}`, conversation_id: convId },
            assistantMsg,
          ];
        });
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        const errorMsg = e instanceof Error ? e.message : "Error desconocido";
        setError(errorMsg);
        setStreamingContent("");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        console.error("useMentor:sendMessage", e);
      } finally {
        setSending(false);
      }
    },
    [conversationId, sending]
  );

  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const loadConversation = useCallback((id: string) => {
    setConversationId(id);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    loading,
    sending,
    streamingContent,
    error,
    conversationId,
    sendMessage,
    startNewConversation,
    loadConversation,
    clearError,
  };
}

// ── Conversations List Hook ─────────────────────────────────────

interface UseMentorConversationsReturn {
  conversations: MentorConversation[];
  loading: boolean;
  error: string | null;
  deleteConversation: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMentorConversations(): UseMentorConversationsReturn {
  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("mentor_conversations")
        .select("id, title, created_at, updated_at, is_active")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      // Get last message for each conversation
      const enriched = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from("mentor_messages")
            .select("content")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count } = await supabase
            .from("mentor_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id);

          return {
            ...conv,
            message_count: count || 0,
            last_message: lastMsg?.content?.substring(0, 100) || "",
          };
        })
      );

      setConversations(enriched);
    } catch (e) {
      setError("Error al cargar conversaciones");
      console.error("useMentorConversations:fetch", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        const { error: delError } = await supabase
          .from("mentor_conversations")
          .update({ is_active: false })
          .eq("id", id);

        if (delError) throw delError;
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } catch (e) {
        setError("Error al eliminar conversación");
        console.error("useMentorConversations:delete", e);
      }
    },
    []
  );

  return {
    conversations,
    loading,
    error,
    deleteConversation,
    refresh: fetchConversations,
  };
}
