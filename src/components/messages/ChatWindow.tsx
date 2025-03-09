
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { MessageList } from "./MessageList";
import { ProductInfoCard } from "./ProductInfoCard";
import { ChatType, MessageType } from "@/types/message";

interface ChatWindowProps {
  currentChat: ChatType | null;
  messages: MessageType[];
  currentProduct: any;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  sendingMessage: boolean;
  loading: boolean;
}

export const ChatWindow = ({
  currentChat,
  messages,
  currentProduct,
  newMessage,
  setNewMessage,
  handleSendMessage,
  sendingMessage,
  loading
}: ChatWindowProps) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="p-3 border-b bg-gray-50 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2"
          onClick={() => navigate('/messages')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={currentChat?.otherUser?.avatar} />
          <AvatarFallback>
            {currentChat?.otherUser?.name.substring(0, 2) || '??'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {currentChat?.otherUser?.name || 'Unknown User'}
          </p>
          <p className="text-xs text-muted-foreground">
            {currentChat?.product?.title || 'Unknown Product'}
          </p>
        </div>
      </div>

      {/* Product Information Card */}
      <ProductInfoCard product={currentProduct} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[45px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="bg-youbuy hover:bg-youbuy-dark self-end h-[45px] px-4"
          >
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};
