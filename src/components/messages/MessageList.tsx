import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageType } from '@/types/message';
import { formatMessageDate } from '@/utils/dateFormat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Check, 
  CheckCheck, 
  Copy, 
  MoreHorizontal, 
  Reply, 
  Trash2, 
  Image as ImageIcon,
  Download,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageListProps {
  messages: MessageType[];
  loading?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (message: MessageType) => void;
}

export const MessageList = ({ messages, loading, onDeleteMessage, onReplyMessage }: MessageListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          description: 'Message copied to clipboard',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'youbuy-image-' + Date.now();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      description: 'Image download started',
    });
  };

  const addReaction = (messageId: string, reaction: string) => {
    setReactions(prev => ({
      ...prev,
      [messageId]: reaction
    }));

    toast({
      description: `You reacted with ${reaction}`,
    });
  };

  // Group messages by date and sender
  const groupedMessages = messages.reduce((acc, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    const senderId = message.sender_id;

    if (!acc[date]) {
      acc[date] = {};
    }

    if (!acc[date][senderId]) {
      acc[date][senderId] = [];
    }

    acc[date][senderId].push(message);
    return acc;
  }, {} as Record<string, Record<string, MessageType[]>>);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="daisy-chat daisy-chat-start">
            <div className="daisy-chat-image daisy-avatar">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="daisy-chat-header opacity-50">
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="daisy-chat-bubble daisy-chat-bubble-accent opacity-50">
              <Skeleton className="h-16 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="daisy-hero h-full bg-base-200">
        <div className="daisy-hero-content text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-bold">No messages yet</h2>
            <p className="py-4">Start the conversation by sending a message about this product.</p>
            <div className="daisy-chat daisy-chat-start opacity-50 mt-6">
              <div className="daisy-chat-bubble">Hi, is this item still available?</div>
            </div>
            <div className="daisy-chat daisy-chat-end opacity-50 mt-2">
              <div className="daisy-chat-bubble daisy-chat-bubble-primary">Yes, it's available! Are you interested?</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {Object.entries(groupedMessages).map(([date, senderMessages]) => (
        <div key={date} className="space-y-6">
          <div className="flex items-center justify-center my-4">
            <div className="daisy-badge daisy-badge-neutral py-2 px-4">
              {formatMessageDate(date)}
            </div>
          </div>

          {Object.entries(senderMessages).map(([senderId, messages]) => {
            const isUserMessage = senderId === user?.id;
            const lastMessage = messages[messages.length - 1];

            return (
              <div key={senderId} className="space-y-2">
                {messages.map((message, index) => {
                  const isImage = message.content.startsWith('image:');
                  const imageUrl = isImage ? message.content.replace('image:', '') : '';
                  const showSenderInfo = index === 0;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "daisy-chat",
                        isUserMessage ? "daisy-chat-end" : "daisy-chat-start"
                      )}
                    >
                      {showSenderInfo && !isUserMessage && (
                        <div className="daisy-chat-image daisy-avatar">
                          <div className="w-12 rounded-full">
                            <Avatar>
                              <AvatarImage src={message.sender_avatar} />
                              <AvatarFallback className="bg-primary text-primary-content">
                                {message.sender_name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      )}

                      {showSenderInfo && (
                        <div className="daisy-chat-header mb-1">
                          <span className="font-medium">{isUserMessage ? 'You' : message.sender_name}</span>
                          <time className="text-xs opacity-70 ml-2">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </time>
                        </div>
                      )}

                      <div 
                        className={cn(
                          "group relative daisy-chat-bubble",
                          isUserMessage ? "daisy-chat-bubble-primary" : "daisy-chat-bubble-accent",
                          isImage ? "p-2 overflow-hidden" : "p-3"
                        )}
                      >
                        {isImage ? (
                          <div className="relative">
                            <img
                              src={imageUrl}
                              alt="Message image"
                              className="max-w-full h-auto rounded-lg"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadImage(imageUrl);
                                }}
                              >
                                <Download className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-base">{message.content}</div>
                        )}

                        <div className="daisy-dropdown daisy-dropdown-end absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                          <label tabIndex={0} className="daisy-btn daisy-btn-circle daisy-btn-ghost daisy-btn-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </label>
                          <ul tabIndex={0} className="daisy-dropdown-content z-[1] daisy-menu p-3 shadow bg-base-100 rounded-box w-56">
                            <li>
                              <a onClick={() => copyToClipboard(isImage ? imageUrl : message.content)} className="py-2">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy {isImage ? 'image link' : 'text'}
                              </a>
                            </li>
                            <li>
                              <a onClick={() => onReplyMessage?.(message)} className="py-2">
                                <Reply className="h-4 w-4 mr-2" />
                                Reply
                              </a>
                            </li>
                            {isUserMessage && (
                              <li>
                                <a onClick={() => onDeleteMessage?.(message.id)} className="text-error py-2">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {reactions[message.id] && (
                        <div className="daisy-chat-footer opacity-70 mt-1">
                          <div className="daisy-badge daisy-badge-sm px-2 py-1">{reactions[message.id]}</div>
                        </div>
                      )}

                      {!isUserMessage && (
                        <div className="daisy-chat-footer opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mt-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  className="daisy-btn daisy-btn-circle daisy-btn-ghost daisy-btn-sm"
                                  onClick={() => addReaction(message.id, '👍')}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Like</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  className="daisy-btn daisy-btn-circle daisy-btn-ghost daisy-btn-sm"
                                  onClick={() => addReaction(message.id, '❤️')}
                                >
                                  <Heart className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Love</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}

                      {isUserMessage && index === messages.length - 1 && (
                        <div className="daisy-chat-footer opacity-70 flex justify-end mt-1">
                          {message.read ? (
                            <div className="flex items-center">
                              <CheckCheck className="h-4 w-4 text-primary" />
                              <span className="text-xs ml-1">Read</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs ml-1">Sent</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};
