import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock data for messages
const mockChats = {
  "1": {
    id: "1",
    user: {
      id: "user1",
      name: "John Doe",
      avatar: "/avatars/john.jpg",
    },
    messages: [
      {
        id: "msg1",
        senderId: "user1",
        text: "Hey, I'm interested in your product!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "msg2",
        senderId: "currentUser",
        text: "Hi there! Thanks for your interest. What would you like to know?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
      },
      {
        id: "msg3",
        senderId: "user1",
        text: "Is it still available?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
      },
      {
        id: "msg4",
        senderId: "currentUser",
        text: "Yes, it's still available!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21), // 21 hours ago
      },
      {
        id: "msg5",
        senderId: "user1",
        text: "Great! Can I pick it up tomorrow?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
    ],
  },
  "2": {
    id: "2",
    user: {
      id: "user2",
      name: "Jane Smith",
      avatar: "/avatars/jane.jpg",
    },
    messages: [
      {
        id: "msg1",
        senderId: "user2",
        text: "Is this still available?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: "msg2",
        senderId: "currentUser",
        text: "Yes, it is!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
      },
    ],
  },
  "3": {
    id: "3",
    user: {
      id: "user3",
      name: "Mike Johnson",
      avatar: "/avatars/mike.jpg",
    },
    messages: [
      {
        id: "msg1",
        senderId: "currentUser",
        text: "Hi, I saw you were interested in my product.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      },
      {
        id: "msg2",
        senderId: "user3",
        text: "Yes, I am! Is it still available?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47), // 47 hours ago
      },
      {
        id: "msg3",
        senderId: "currentUser",
        text: "Yes, it is. When would you like to pick it up?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46), // 46 hours ago
      },
      {
        id: "msg4",
        senderId: "user3",
        text: "Thanks for the quick response!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    ],
  },
};

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [newMessage, setNewMessage] = useState("");
  const [chat, setChat] = useState<any>(mockChats[chatId as keyof typeof mockChats]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Update chat when chatId changes
  useEffect(() => {
    setChat(mockChats[chatId as keyof typeof mockChats]);
  }, [chatId]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: `msg${chat.messages.length + 1}`,
      senderId: "currentUser",
      text: newMessage,
      timestamp: new Date(),
    };

    setChat({
      ...chat,
      messages: [...chat.messages, newMsg],
    });
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
            <AvatarFallback>{getInitials(chat.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{chat.user.name}</h3>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message: any) => {
          const isCurrentUser = message.senderId === "currentUser";
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                    <AvatarFallback>{getInitials(chat.user.name)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}