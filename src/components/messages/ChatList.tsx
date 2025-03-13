
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatType } from "@/types/message";
import { formatChatTime } from "@/utils/dateFormat";

interface ChatListProps {
  chats: ChatType[];
  loading: boolean;
  currentChatId?: string;
}

export const ChatList = ({ chats, loading, currentChatId }: ChatListProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="p-3 border-b">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-4 text-center">
        <p className="text-muted-foreground mb-2">No messages yet</p>
        <p className="text-sm">When you message sellers about items, you'll see your conversations here.</p>
      </div>
    );
  }

  const handleChatClick = (chatId: string) => {
    console.log("ChatList: Navigating to chat:", chatId);
    navigate(`/messages/${chatId}`);
  };

  return (
    <>
      {chats.map((chat) => {
        const isActive = currentChatId === chat.id;
        const userName = chat.otherUser?.name || 'User';
        const productTitle = chat.product?.title || 'Product';
        
        return (
          <div 
            key={chat.id}
            className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${isActive ? 'bg-gray-100' : ''}`}
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.otherUser?.avatar} />
                <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{userName}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatChatTime(chat.last_message_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {productTitle}
                </p>
              </div>
            </div>
            {chat.unreadCount > 0 && (
              <div className="mt-1 flex justify-end">
                <Badge className="bg-youbuy">{chat.unreadCount}</Badge>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
