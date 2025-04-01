import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatType } from "@/types/message";
import { formatChatTime } from "@/utils/dateFormat";
import { Check, CheckCheck, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ChatListProps {
  chats: ChatType[];
  loading: boolean;
  currentChatId?: string;
}

export const ChatList = ({ chats, loading, currentChatId }: ChatListProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
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

  const handleChatClick = (chatId: string) => {
    console.log("ChatList: Navigating to chat:", chatId);
    navigate(`/messages/${chatId}`);
  };

  return (
    <div className="divide-y">
      {chats.map((chat) => {
        const isActive = currentChatId === chat.id;
        const userName = chat.otherUser?.name || 'User';
        const productTitle = chat.product?.title || 'Product';
        const hasUnread = chat.unreadCount > 0;
        
        return (
          <div 
            key={chat.id}
            className={`p-4 hover:bg-gray-50/80 cursor-pointer transition-colors relative ${
              isActive ? 'bg-gray-50 border-l-4 border-l-youbuy' : ''
            }`}
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chat.otherUser?.avatar} />
                  <AvatarFallback className="bg-youbuy/10 text-youbuy">
                    {userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-youbuy rounded-full ring-2 ring-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-center">
                  <p className={`font-medium truncate ${hasUnread ? 'text-youbuy' : ''}`}>
                    {userName}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatChatTime(chat.last_message_at)}
                  </span>
                </div>
                
                <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-muted-foreground'}`}>
                  {chat.lastMessage || "No messages yet"}
                </p>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 truncate max-w-[150px]">
                    {productTitle}
                  </p>
                  
                  <div className="flex items-center space-x-1">
                    {chat.unreadCount > 0 ? (
                      <Badge variant="default" className="bg-youbuy h-5 min-w-[20px] flex items-center justify-center">
                        {chat.unreadCount}
                      </Badge>
                    ) : (
                      <CheckCheck className="h-4 w-4 text-youbuy" />
                    )}
                  </div>
                </div>
              </div>
              
              <div onClick={(e) => e.stopPropagation()} className="ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as read</DropdownMenuItem>
                    <DropdownMenuItem>Mute conversation</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete conversation</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
