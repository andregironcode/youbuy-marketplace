import { useAuth } from "@/context/AuthContext";
import { MessageType } from "@/types/message";
import { formatMessageTime } from "@/utils/dateFormat";
import { Trash2, Check, CheckCheck, Image, Copy, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface MessageListProps {
  messages: MessageType[];
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageList = ({ messages, onDeleteMessage }: MessageListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center">
        <p className="text-muted-foreground mb-2">No messages yet</p>
        <p className="text-sm">Start the conversation by sending a message</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (messageToDelete && onDeleteMessage) {
      onDeleteMessage(messageToDelete);
      setMessageToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          description: "Message copied to clipboard",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  // Group messages by date
  const groupedMessages: { [key: string]: MessageType[] } = {};
  messages.forEach(message => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0 right-0 h-px bg-gray-200"></div>
            <span className="relative bg-white px-2 text-xs text-gray-500">{date}</span>
          </div>
          
          {dateMessages.map((message) => {
            const isUserMessage = message.sender_id === user?.id;
            const isImageMessage = message.content.startsWith('image:');
            
            return (
              <div 
                key={message.id}
                className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`relative max-w-[80%] ${
                  isUserMessage 
                    ? 'order-2'
                    : 'order-1'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    isUserMessage
                      ? 'bg-youbuy text-white rounded-tr-none'
                      : !message.read
                        ? 'bg-blue-50 rounded-tl-none shadow-sm'
                        : 'bg-gray-100 rounded-tl-none'
                  }`}>
                    {!isUserMessage && !message.read && (
                      <span className="absolute -left-1.5 -top-1.5 bg-blue-600 text-white text-[8px] font-medium px-1.5 py-0.5 rounded-full ring-1 ring-white">
                        NEW
                      </span>
                    )}
                    
                    {isImageMessage ? (
                      <div className="relative">
                        <img
                          src={message.content.substring(6)}
                          alt="Shared image"
                          className="rounded max-w-full h-auto cursor-pointer"
                          onClick={() => window.open(message.content.substring(6), '_blank')}
                        />
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(message.content.substring(6), '_blank')}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="break-words whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <p className={`text-xs ${
                        isUserMessage ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {formatMessageTime(message.created_at)}
                      </p>
                      {isUserMessage && (
                        message.read ? (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div>
                                <CheckCheck className="h-3.5 w-3.5 ml-1 text-blue-400" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="p-2 text-xs w-auto">
                              Read
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div>
                                <Check className="h-3.5 w-3.5 ml-1 text-gray-400" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="p-2 text-xs w-auto">
                              Delivered
                            </HoverCardContent>
                          </HoverCard>
                        )
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`absolute top-0 opacity-0 h-7 w-7 p-1.5 rounded-full bg-white/90 border shadow-sm group-hover:opacity-100 ${
                          isUserMessage ? '-left-9' : '-right-9'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                          <path d="M2 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12.5 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isUserMessage ? "end" : "start"}>
                      <DropdownMenuItem onClick={() => copyToClipboard(message.content)} className="cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" /> Copy text
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Reply className="h-4 w-4 mr-2" /> Reply
                      </DropdownMenuItem>
                      
                      {isUserMessage && onDeleteMessage && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertDialog open={messageToDelete === message.id} onOpenChange={(open) => {
                            if (!open) setMessageToDelete(null);
                          }}>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setMessageToDelete(message.id);
                                }}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this message? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {!isUserMessage && (
                  <Avatar className="h-6 w-6 order-0 mt-6 mr-2">
                    <AvatarImage src={message.sender_avatar} />
                    <AvatarFallback className="text-xs bg-gray-100">
                      {message.sender_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
