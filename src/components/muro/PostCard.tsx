/** PostCard — Individual wall post with likes, comments, and actions */

import { memo } from "react";
import {
  MessageSquare,
  Send,
  Heart,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Flag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { WallComment } from "@/hooks/useWallInteractions";
import type { WallPost } from "./types";
import { CommentItem } from "./CommentItem";
import { timeAgo, formatFullDate, COMMENT_MAX_LENGTH } from "./utils";

interface PostCardProps {
  post: WallPost;
  isLiked: boolean;
  isOwn: boolean;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  confirmingDelete: boolean;
  onReport: (postId: string, content: string) => void;
  expanded: boolean;
  onToggle: (postId: string) => void;
  comments: WallComment[];
  loadingComments: boolean;
  onComment: (postId: string) => void;
  commentText: string;
  onCommentTextChange: (postId: string, text: string) => void;
  submittingComment: boolean;
  userId: string | undefined;
}

export const PostCard = memo(
  ({
    post,
    isLiked,
    isOwn,
    onLike,
    onDelete,
    confirmingDelete,
    onReport,
    expanded,
    onToggle,
    comments,
    loadingComments,
    onComment,
    commentText,
    onCommentTextChange,
    submittingComment,
    userId,
  }: PostCardProps) => (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{post.content}</p>

        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-3">
            <span className="text-caption text-muted-foreground" title={formatFullDate(post.created_at)}>
              {isOwn ? "Vos" : "Anónimo"} · {timeAgo(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isOwn ? (
              <button
                onClick={() => onDelete(post.id)}
                className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-full ${
                  confirmingDelete
                    ? "text-destructive bg-destructive/10 font-medium"
                    : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                }`}
                aria-label={confirmingDelete ? "Confirmar eliminación del post" : "Eliminar post"}
                title={confirmingDelete ? "Tocá de nuevo para confirmar" : "Eliminar post"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmingDelete && <span className="text-caption">¿Eliminar?</span>}
              </button>
            ) : (
              <button
                onClick={() => onReport(post.id, post.content)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-500 transition-colors px-2 py-1 rounded-full hover:bg-amber-500/5"
                aria-label="Reportar contenido inapropiado"
                title="Reportar contenido"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded-full
                ${isLiked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"}`}
              aria-label={isLiked ? "Quitar me gusta" : "Dar me gusta"}
              aria-pressed={isLiked}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? "fill-current scale-110" : ""}`} />
              {post.likes_count > 0 && <span>{post.likes_count}</span>}
            </button>

            <button
              onClick={() => onToggle(post.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-full hover:bg-secondary"
              aria-expanded={expanded}
              aria-label={expanded ? "Ocultar comentarios" : "Ver comentarios"}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {post.comments_count > 0 && <span>{post.comments_count}</span>}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
            {loadingComments ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {comments.length === 0 && (
                  <p className="text-caption text-muted-foreground text-center py-2">
                    Sin respuestas todavía. Sé el primero.
                  </p>
                )}
                {comments.map((c) => (
                  <CommentItem key={c.id} comment={c} isOwn={c.user_id === userId} />
                ))}
              </>
            )}

            <div className="flex gap-2 items-end mt-2 pt-2 border-t border-border/30">
              <Textarea
                placeholder="Escribí una respuesta..."
                value={commentText}
                onChange={(e) => onCommentTextChange(post.id, e.target.value.slice(0, COMMENT_MAX_LENGTH))}
                className="min-h-[44px] text-xs resize-none border-0 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary/30 py-3"
                maxLength={COMMENT_MAX_LENGTH}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onComment(post.id);
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 shrink-0"
                onClick={() => onComment(post.id)}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <span className="text-caption text-muted-foreground">{commentText.length}/{COMMENT_MAX_LENGTH}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
);
PostCard.displayName = "PostCard";
