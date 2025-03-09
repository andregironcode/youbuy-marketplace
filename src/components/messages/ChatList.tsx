
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex justify-center items-center h-full">
        <p>Loading conversations...</p>
      </div>
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

  return (
    <>
      {chats.map((chat) => (
        <div 
          key={chat.id}
          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${currentChatId === chat.id ? 'bg-gray-100' : ''}`}
          onClick={() => navigate(`/messages/${chat.id}`)}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.otherUser?.avatar} />
              <AvatarFallback>{chat.otherUser?.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium truncate">{chat.otherUser?.name}</p>
                <span className="text-xs text-muted-foreground">
                  {formatChatTime(chat.last_message_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {chat.lastMessage || "No messages yet"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {chat.product?.title}
              </p>
            </div>
          </div>
          {chat.unreadCount > 0 && (
            <div className="mt-1 flex justify-end">
              <Badge className="bg-youbuy">{chat.unreadCount}</Badge>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
