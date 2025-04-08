import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatType } from "@/types/message";

interface ChatListProps {
  chats: ChatType[];
  loading?: boolean;
  currentChatId?: string;
}

export function ChatList({ chats, loading, currentChatId }: ChatListProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[160px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground mb-2">No conversations yet</p>
        <p className="text-sm">Start browsing products to chat with sellers</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {chats.map((chat) => {
        const isSelected = currentChatId === chat.id;

        return (
          <button
            key={chat.id}
            className={cn(
              "w-full flex items-start space-x-4 p-4 hover:bg-accent/50 transition-colors",
              isSelected && "bg-accent"
            )}
            onClick={() => navigate(`/messages/${chat.id}`)}
          >
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={chat.other_user?.avatar_url} />
              <AvatarFallback>
                {chat.other_user?.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <p className="font-medium line-clamp-1">
                  {chat.other_user?.full_name || "Unknown User"}
                </p>
                {chat.last_message?.created_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.last_message.created_at))}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {chat.last_message?.content || "No messages yet"}
                </p>
                {chat.last_message && !chat.last_message.read && (
                  <div className="h-2 w-2 rounded-full bg-youbuy" />
                )}
              </div>
              {chat.product && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="font-medium truncate">
                    {chat.product.title}
                  </span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
