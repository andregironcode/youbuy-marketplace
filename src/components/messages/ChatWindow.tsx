
import { useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, SendHorizonal, ImagePlus } from "lucide-react";
import { MessageList } from "./MessageList";
import { ProductInfoCard } from "./ProductInfoCard";
import { Skeleton } from "@/components/ui/skeleton"; 
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
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && handleImageUpload) {
      handleImageUpload(files[0]);
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const userName = currentChat?.otherUser?.name || 'User';

  const renderChatHeader = () => (
    <div className="p-3 border-b bg-gray-50 flex items-center">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden mr-2"
        onClick={() => navigate('/messages')}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      {loading ? (
        <>
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </>
      ) : (
        <>
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={currentChat?.otherUser?.avatar} />
            <AvatarFallback>
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentProduct?.title || currentChat?.product?.title || 'Product'}
            </p>
          </div>
        </>
      )}
    </div>
  );

  const renderProductInfo = () => {
    if (loading) {
      return (
        <div className="p-3 border-b bg-accent/5">
          <div className="flex items-center p-2">
            <Skeleton className="w-16 h-16 rounded mr-3" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      );
    }
    
    return <ProductInfoCard 
      product={currentProduct || currentChat?.product} 
      productId={currentChat?.product_id}
    />;
  };

  const renderMessages = () => {
    if (loading) {
      return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                <Skeleton className={`h-14 w-48 rounded-lg ${index % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 overflow-x-hidden">
        <MessageList 
          messages={messages} 
          onDeleteMessage={handleDeleteMessage}
        />
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading && newMessage.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {renderChatHeader()}
      {renderProductInfo()}
      {renderMessages()}

      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[45px] max-h-[120px]"
            disabled={loading || sendingMessage}
            onKeyDown={handleKeyPress}
          />
          <div className="flex flex-col space-y-2 self-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={triggerFileInput}
              disabled={loading || sendingMessage}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={loading || sendingMessage}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage || loading}
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
