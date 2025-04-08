import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  SendHorizonal, 
  ImagePlus, 
  MoreHorizontal, 
  ExternalLink, 
  ShoppingBag,
  Smile,
  Reply,
  X,
  Check,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import { MessageList } from './MessageList';
import { ProductInfoCard } from './ProductInfoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatType, MessageType } from '@/types/message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ProductType } from '@/types/product';
import { Separator } from '@/components/ui/separator';
import { Image as ImageIcon } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  currentChat: ChatType | null;
  messages: MessageType[];
  currentProduct: ProductType | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleDeleteMessage: (messageId: string) => void;
  handleImageUpload: (file: File) => void;
  sendingMessage: boolean;
  loading: boolean;
}

export function ChatWindow({
  currentChat,
  messages,
  currentProduct,
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleDeleteMessage,
  handleImageUpload,
  sendingMessage,
  loading,
}: ChatWindowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const otherUser = currentChat?.other_user;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleReply = (message: MessageType) => {
    setReplyTo(message);
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(newMessage + emoji.native);
    setShowEmojiPicker(false);
  };

  if (!currentChat) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 text-center bg-gray-50/50">
        <div className="w-16 h-16 rounded-full bg-youbuy/10 flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-youbuy" />
        </div>
        <h3 className="text-lg font-medium mb-2">Your Messages</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Select a conversation from the list to view your messages. Messages about items you're buying or selling will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="p-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate('/messages')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatar_url} />
              <AvatarFallback>{otherUser?.full_name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate mb-0">{otherUser?.full_name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {otherUser?.last_seen ? `Last seen ${formatDistanceToNow(new Date(otherUser.last_seen))} ago` : 'Online'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Product Info */}
      {currentProduct && (
        <div className="p-2 border-b bg-white">
          <ProductInfoCard product={currentProduct} />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <MessageList
          messages={messages}
          loading={loading}
          onDeleteMessage={handleDeleteMessage}
          onReplyMessage={handleReply}
        />
      </ScrollArea>

      {/* Reply Preview */}
      {replyTo && (
        <div className="p-2 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Replying to {replyTo.sender_name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setReplyTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {replyTo.content}
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 border-t bg-white relative">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] max-h-[120px] resize-none"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="h-8 w-8"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
            />
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
