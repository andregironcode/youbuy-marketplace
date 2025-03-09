
import { useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, SendHorizonal, ImagePlus } from "lucide-react";
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
  handleDeleteMessage?: (messageId: string) => void;
  handleImageUpload?: (file: File) => void;
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
  handleDeleteMessage,
  handleImageUpload,
  sendingMessage,
  loading
}: ChatWindowProps) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && handleImageUpload) {
      handleImageUpload(files[0]);
      // Reset the input to allow uploading the same file again
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
          <AvatarImage src={currentProduct?.image} />
          <AvatarFallback>
            {currentProduct?.title?.substring(0, 2) || '??'}
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 overflow-x-hidden">
        <MessageList 
          messages={messages} 
          onDeleteMessage={handleDeleteMessage}
        />
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
          <div className="flex flex-col space-y-2 self-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={triggerFileInput}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              className="bg-youbuy hover:bg-youbuy-dark h-9 w-9 p-0"
            >
              <SendHorizonal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
