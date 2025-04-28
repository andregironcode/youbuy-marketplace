import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "John Doe",
      avatar: "/avatars/john.jpg",
    },
    lastMessage: {
      text: "Hey, I'm interested in your product!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isRead: false,
    },
  },
  {
    id: "2",
    user: {
      id: "user2",
      name: "Jane Smith",
      avatar: "/avatars/jane.jpg",
    },
    lastMessage: {
      text: "Is this still available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      isRead: true,
    },
  },
  {
    id: "3",
    user: {
      id: "user3",
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg",
    },
    lastMessage: {
      text: "Thanks for the quick response!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
    },
  },
];

interface MessageListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function MessageList({ selectedChatId, onSelectChat }: MessageListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChatId === conversation.id ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelectChat(conversation.id)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                  <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{conversation.user.name}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className={`text-sm truncate ${!conversation.lastMessage.isRead ? "font-semibold" : "text-muted-foreground"}`}>
                      {conversation.lastMessage.text}
                    </p>
                    {!conversation.lastMessage.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}