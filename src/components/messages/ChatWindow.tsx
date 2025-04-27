import { useRef, useState, useEffect } from 'react';
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
  MessageCircle,
  Phone,
  Video,
  User,
  FileImage,
  Camera,
  Paperclip,
  Mic,
  AlertCircle
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
  DropdownMenuSeparator
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const otherUser = currentChat?.other_user;
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Simulate upload progress
  useEffect(() => {
    if (uploadingImage) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [uploadingImage]);

  // Reset upload state when complete
  useEffect(() => {
    if (uploadProgress >= 100) {
      setTimeout(() => {
        setUploadingImage(false);
        setUploadProgress(0);
        setImagePreview(null);
      }, 500);
    }
  }, [uploadProgress]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setUploadingImage(true);
      };
      reader.readAsDataURL(file);

      // Upload the image
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

  const handleSendReservationMessage = (message: string) => {
    setNewMessage(message);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (!currentChat) {
    return (
      <div className="daisy-hero h-full bg-base-200">
        <div className="daisy-hero-content text-center">
          <div className="max-w-md mx-auto px-4">
            <div className="daisy-avatar placeholder mb-6 mx-auto">
              <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center">
                <MessageCircle size={40} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Messages</h1>
            <p className="py-4 text-base-content/80">
              Select a conversation from the list to view your messages. Messages about items you're buying or selling will appear here.
            </p>
            <Button 
              onClick={() => navigate('/search')}
              className="daisy-btn daisy-btn-primary mt-2"
            >
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-200">
      {/* Chat Header */}
      <div className="daisy-navbar bg-base-100 shadow-sm px-4 py-2">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate('/messages')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={otherUser?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-content">
                {otherUser?.full_name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">{otherUser?.full_name}</h3>
              <div className="flex items-center gap-2">
                <span className="daisy-badge daisy-badge-sm daisy-badge-success"></span>
                <p className="text-xs">
                  {otherUser?.last_seen 
                    ? `Last seen ${formatDistanceToNow(new Date(otherUser.last_seen))} ago` 
                    : 'Online'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-none gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Video className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate(`/seller/${otherUser?.id}`)}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                {currentProduct && (
                  <DropdownMenuItem onClick={() => navigate(`/product/${currentProduct.id}`)}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View Product
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Product Info */}
      {currentProduct && (
        <div className="p-2 bg-base-100 border-b">
          <ProductInfoCard 
            product={currentProduct} 
            onReserve={() => {}} 
            onSendMessage={handleSendReservationMessage}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1" ref={messagesContainerRef}>
        <MessageList
          messages={messages}
          loading={loading}
          onDeleteMessage={handleDeleteMessage}
          onReplyMessage={handleReply}
        />
      </ScrollArea>

      {/* Reply Preview */}
      {replyTo && (
        <div className="p-3 bg-base-100 border-t">
          <div className="daisy-alert daisy-alert-info shadow-sm">
            <div className="flex justify-between w-full">
              <div className="flex items-start gap-3">
                <Reply className="h-5 w-5" />
                <div>
                  <h3 className="font-bold text-sm">Replying to {replyTo.sender_name}</h3>
                  <p className="text-xs opacity-70 line-clamp-1">
                    {replyTo.content.startsWith('image:') ? '📷 Image' : replyTo.content}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setReplyTo(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Preview */}
      {uploadingImage && (
        <div className="p-3 bg-base-100 border-t">
          <div className="daisy-alert daisy-alert-info shadow-sm">
            <div className="flex justify-between w-full">
              <div className="flex items-start gap-3">
                <FileImage className="h-5 w-5" />
                <div className="w-full">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-sm">Uploading image...</h3>
                    <span className="text-xs font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3 mt-2" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setUploadingImage(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {imagePreview && (
            <div className="mt-3 relative">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="h-24 w-auto rounded-md object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-base-100 border-t relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {showAttachmentOptions && (
                <div className="absolute bottom-12 left-0 bg-base-100 rounded-lg shadow-lg p-3 border z-10 w-48">
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex justify-start h-10"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentOptions(false);
                      }}
                    >
                      <ImagePlus className="h-5 w-5 mr-3" />
                      Gallery
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex justify-start h-10"
                          onClick={() => setShowAttachmentOptions(false)}
                        >
                          <Camera className="h-5 w-5 mr-3" />
                          Camera
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Camera Access</DialogTitle>
                          <DialogDescription>
                            This feature would open your camera to take a photo.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex justify-start h-10"
                          onClick={() => setShowAttachmentOptions(false)}
                        >
                          <Mic className="h-5 w-5 mr-3" />
                          Voice Message
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Microphone Access</DialogTitle>
                          <DialogDescription>
                            This feature would allow you to record a voice message.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="daisy-textarea daisy-textarea-bordered min-h-[44px] max-h-[120px] resize-none w-full py-3 px-4"
            />
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            className="daisy-btn daisy-btn-primary h-12 w-12 rounded-full flex items-center justify-center"
          >
            {sendingMessage ? (
              <span className="daisy-loading daisy-loading-spinner daisy-loading-sm"></span>
            ) : (
              <SendHorizonal className="h-6 w-6" />
            )}
          </Button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-10 shadow-xl rounded-lg overflow-hidden">
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
