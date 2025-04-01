import { useRef, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, SendHorizonal, ImagePlus, MoreHorizontal, ExternalLink, ShoppingBag } from "lucide-react";
import { MessageList } from "./MessageList";
import { ProductInfoCard } from "./ProductInfoCard";
import { Skeleton } from "@/components/ui/skeleton"; 
import { ChatType, MessageType } from "@/types/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
  const productTitle = currentProduct?.title || currentChat?.product?.title || 'Product';

  const renderChatHeader = () => (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center">
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
              <div className="flex items-center">
                <p className="font-medium">
                  {userName}
                </p>
                {currentChat?.otherUser?.isVerified && (
                  <Badge className="ml-1 px-1 py-0 h-auto text-xs bg-blue-500">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {productTitle}
              </p>
            </div>
          </>
        )}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            Block user
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive">
            Report conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const renderProductInfo = () => {
    if (loading) {
      return (
        <div className="p-3 border-b">
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
    
    const product = currentProduct || currentChat?.product;
    
    if (!product) return null;

    return (
      <div className="p-3 border-b bg-accent/5">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{product.title}</p>
            <p className="text-sm font-bold text-emerald-600">
              AED {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View listing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="icon" className="h-8 w-8 bg-youbuy hover:bg-youbuy-dark">
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Buy now</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
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
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4 min-h-full">
          <MessageList 
            messages={messages} 
            onDeleteMessage={handleDeleteMessage}
          />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading && newMessage.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {renderChatHeader()}
      {renderProductInfo()}
      {renderMessages()}

      <div className="p-4 border-t mt-auto bg-white">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[45px] max-h-[120px] resize-none"
            disabled={loading || sendingMessage}
            onKeyDown={handleKeyPress}
          />
          <div className="flex flex-col space-y-2 self-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={loading || sendingMessage}
              aria-label="Upload image"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage || loading}
                    variant="default"
                    size="icon"
                    className="h-9 w-9 p-0 bg-youbuy hover:bg-youbuy-dark"
                  >
                    <SendHorizonal className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
