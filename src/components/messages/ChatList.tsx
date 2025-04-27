import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatType } from "@/types/message";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MessageSquare, Check } from "lucide-react";

interface ChatListProps {
  chats: ChatType[];
  loading?: boolean;
  currentChatId?: string;
}

export function ChatList({ chats, loading, currentChatId }: ChatListProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="daisy-card daisy-card-side bg-base-100 shadow-sm transition-all duration-300">
            <div className="daisy-card-body p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-5 w-[80%]" />
                  <Skeleton className="h-4 w-[60%]" />
                  <div className="flex gap-2 mt-1">
                    <Skeleton className="h-4 w-[120px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="daisy-hero h-full bg-base-200 p-4">
        <div className="daisy-hero-content text-center">
          <div className="max-w-md mx-auto px-4">
            <div className="daisy-avatar placeholder mb-4 mx-auto">
              <div className="bg-primary text-primary-content rounded-full w-20 h-20 flex items-center justify-center">
                <MessageSquare size={32} />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
            <p className="py-4 text-base-content/80">
              Start browsing products to chat with sellers and reserve items you're interested in.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {chats.map((chat, index) => {
        const isSelected = currentChatId === chat.id;
        const isUnread = chat.last_message && !chat.last_message.read && chat.last_message.sender_id !== chat.other_user?.id;
        const productStatus = chat.product?.product_status;

        // Don't show image content in preview
        const lastMessageContent = chat.last_message?.content?.startsWith('image:') 
          ? '📷 Image' 
          : chat.last_message?.content || "No messages yet";

        return (
          <div
            key={chat.id}
            className={cn(
              "daisy-card daisy-card-side bg-base-100 cursor-pointer hover:bg-base-200 transition-all duration-300",
              isSelected ? "daisy-card-bordered border-primary shadow-md" : "border-transparent",
              isUnread && "bg-base-200",
              "animate-fadeIn"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(`/messages/${chat.id}`)}
          >
            <div className="daisy-card-body p-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-base-200">
                    <AvatarImage src={chat.other_user?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-content">
                      {chat.other_user?.full_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {isUnread && (
                    <span className="absolute -top-1 -right-1 daisy-badge daisy-badge-primary daisy-badge-xs flex items-center justify-center">
                      <span className="sr-only">Unread message</span>
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold truncate">
                      {chat.other_user?.full_name || "Unknown User"}
                    </h3>
                    {chat.last_message?.created_at && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: false })}
                      </span>
                    )}
                  </div>

                  <p className="text-sm line-clamp-1 mb-2">
                    {lastMessageContent}
                  </p>

                  {chat.product && (
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <div className="daisy-badge daisy-badge-sm bg-base-300 text-base-content gap-1">
                        <ShoppingBag size={12} />
                        <span className="truncate max-w-[180px] text-xs">
                          {chat.product.title}
                        </span>
                      </div>

                      {productStatus && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            productStatus === "available" && "bg-success/10 text-success border-success/20",
                            productStatus === "reserved" && "bg-warning/10 text-warning border-warning/20",
                            productStatus === "sold" && "bg-neutral/10 text-neutral border-neutral/20"
                          )}
                        >
                          {productStatus}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
