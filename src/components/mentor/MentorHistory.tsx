/**
 * MentorHistory — Conversation history sidebar
 *
 * Shows: list of past conversations with preview
 * Actions: select, delete, new conversation
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Plus, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMentorConversations, type MentorConversation } from "@/hooks/useMentor";

interface MentorHistoryProps {
  currentConversationId: string | null;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
}

export const MentorHistory = ({
  currentConversationId,
  onSelect,
  onNew,
}: MentorHistoryProps) => {
  const { conversations, loading, deleteConversation } = useMentorConversations();
  const [open, setOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
  };

  const handleNew = () => {
    onNew();
    setOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Historial de conversaciones">
          <History className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Conversaciones
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-4"
            onClick={handleNew}
          >
            <Plus className="w-4 h-4" />
            Nueva conversación
          </Button>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-body text-muted-foreground">
                  Todavía no tenés conversaciones
                </p>
                <p className="text-body-sm text-muted-foreground mt-1">
                  Empezá a chatear con tu Mentor IA
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface ConversationItemProps {
  conversation: MentorConversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  formatDate: (date: string) => string;
}

const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  formatDate,
}: ConversationItemProps) => (
  <button
    onClick={() => onSelect(conversation.id)}
    className={cn(
      "w-full text-left p-3 rounded-lg transition-all duration-150",
      "hover:bg-accent group",
      isActive && "bg-primary/10 border border-primary/20"
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium truncate">{conversation.title}</p>
        {conversation.last_message && (
          <p className="text-caption text-muted-foreground truncate mt-0.5">
            {conversation.last_message}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-caption text-muted-foreground">
            {formatDate(conversation.updated_at)}
          </span>
          {conversation.message_count && (
            <span className="text-caption text-muted-foreground">
              · {conversation.message_count} mensajes
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => onDelete(e, conversation.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
        aria-label="Eliminar conversación"
      >
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </button>
    </div>
  </button>
);

export default MentorHistory;
