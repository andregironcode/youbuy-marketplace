import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Image as ImageIcon, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  Info, 
  Loader2,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessages } from "@/hooks/useMessages";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageType } from "@/types/message";

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { 
    messages, 
    currentChat, 
    currentProduct, 
    newMessage, 
    setNewMessage, 
    handleSendMessage, 
    loadingMessages, 
    sendingMessage 
  } = useMessages(chatId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProductInfo, setShowProductInfo] = useState(false);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload
      console.log("File selected:", file);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: MessageType[]) => {
    const groups: { [key: string]: MessageType[] } = {};

    messages.forEach(message => {
      const date = new Date(message.created_at);
      let dateKey = format(date, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(message);
    });

    return groups;
  };

  // Format date for message groups
  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);

    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  // Render message content (text or image)
  const renderMessageContent = (content: string) => {
    if (content.startsWith("image:")) {
      const imageUrl = content.substring(6);
      return (
        <div className="rounded-md overflow-hidden max-w-[240px]">
          <img 
            src={imageUrl} 
            alt="Shared image" 
            className="w-full h-auto object-cover"
          />
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap break-words">{content}</p>;
  };

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="font-medium mb-1">Conversation not found</h3>
          <p className="text-sm text-muted-foreground">
            This conversation may have been deleted or is no longer available
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-3 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 border">
            <AvatarImage 
              src={currentChat.other_user.avatar_url || undefined} 
              alt={currentChat.other_user.full_name} 
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(currentChat.other_user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{currentChat.other_user.full_name}</h3>
            <p className="text-xs text-muted-foreground">
              {currentChat.other_user.last_seen 
                ? `Active ${formatDistanceToNow(new Date(currentChat.other_user.last_seen), { addSuffix: true })}`
                : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={() => setShowProductInfo(!showProductInfo)}
                >
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View product details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Block user</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Report conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main chat area with optional product info */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${showProductInfo ? 'md:w-2/3' : 'w-full'}`}>
          {Object.keys(messageGroups).length > 0 ? (
            Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-muted px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground">
                      {formatMessageDate(dateKey)}
                    </span>
                  </div>
                </div>

                {dateMessages.map((message) => {
                  const isCurrentUser = message.sender_id === user?.id;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[80%] group">
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AvatarImage 
                              src={currentChat.other_user.avatar_url || undefined} 
                              alt={currentChat.other_user.full_name} 
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(currentChat.other_user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl p-3 ${
                            isCurrentUser
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          }`}
                        >
                          {renderMessageContent(message.content)}
                          <p className="text-xs mt-1 opacity-70 text-right">
                            {format(new Date(message.created_at), 'h:mm a')}
                            {isCurrentUser && message.read && (
                              <span className="ml-1">✓</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium mb-1">No messages yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Start the conversation by sending a message about the product
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Product info sidebar */}
        {showProductInfo && currentProduct && (
          <div className="hidden md:block w-1/3 border-l p-4 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Details</h3>

              <Card className="overflow-hidden">
                <div className="aspect-square w-full overflow-hidden">
                  <img 
                    src={currentProduct.image_urls?.[0] || '/placeholder-product.jpg'} 
                    alt={currentProduct.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium truncate">{currentProduct.title}</h4>
                  <p className="text-lg font-bold text-price">AED {currentProduct.price}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <Badge 
                      variant={
                        currentProduct.product_status === "available" ? "outline" : 
                        currentProduct.product_status === "reserved" ? "secondary" : 
                        "destructive"
                      }
                    >
                      {currentProduct.product_status.charAt(0).toUpperCase() + currentProduct.product_status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50">
                      {currentProduct.category}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {currentProduct.description}
                  </div>

                  <div className="mt-3">
                    <Button size="sm" className="w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Product
                    </Button>
                  </div>
                </div>
              </Card>

              <div>
                <h4 className="font-medium mb-2">About the seller</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={currentProduct.seller?.avatar} 
                      alt={currentProduct.seller?.name} 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentProduct.seller?.name ? getInitials(currentProduct.seller.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentProduct.seller?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Member since {currentProduct.seller?.joinedDate && 
                        format(new Date(currentProduct.seller.joinedDate), 'MMMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={handleFileUpload}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send an image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach a file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={onFileSelected}
            />
          </div>

          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-full bg-muted/50"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            size="icon"
            className="rounded-full h-9 w-9"
          >
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Message icon component
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
