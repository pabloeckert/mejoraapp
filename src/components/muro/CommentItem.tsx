/** CommentItem — Individual comment in a wall post thread */

import { memo } from "react";
import { CornerDownRight } from "lucide-react";
import type { WallComment } from "@/hooks/useWallInteractions";
import { timeAgo, formatFullDate } from "./utils";

interface CommentItemProps {
  comment: WallComment;
  isOwn: boolean;
}

export const CommentItem = memo(({ comment, isOwn }: CommentItemProps) => (
  <div className="flex gap-2 items-start py-1.5">
    <CornerDownRight className="w-3 h-3 text-muted-foreground/50 mt-1 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">{comment.content}</p>
      <span className="text-caption text-muted-foreground" title={formatFullDate(comment.created_at)}>
        {isOwn ? "Vos" : "Anónimo"} · {timeAgo(comment.created_at)}
      </span>
    </div>
  </div>
));
CommentItem.displayName = "CommentItem";
