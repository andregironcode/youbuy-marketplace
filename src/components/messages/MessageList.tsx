import { useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageType } from '@/types/message';
import { formatMessageDate } from '@/utils/dateFormat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, CheckCheck, Copy, MoreHorizontal, Reply, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground mb-2">No messages yet</p>
        <p className="text-sm">Start the conversation by sending a message</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([date, senderMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="px-4 py-1 bg-gray-100 rounded-full text-sm text-muted-foreground">
              {formatMessageDate(date)}
            </div>
          </div>
          {Object.entries(senderMessages).map(([senderId, messages]) => {
            const isUserMessage = senderId === user?.id;
            const lastMessage = messages[messages.length - 1];

            return (
              <div
                key={senderId}
                className={cn(
                  "flex flex-col",
                  isUserMessage && "items-end"
                )}
              >
                <div className="space-y-1 max-w-[80%]">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "group relative",
                        isUserMessage && "ml-auto"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          isUserMessage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        {message.content.startsWith('image:') ? (
                          <img
                            src={message.content.replace('image:', '')}
                            alt="Message image"
                            className="max-w-full h-auto rounded-lg"
                          />
                        ) : (
                          message.content
                        )}
                      </div>
                      <div
                        className={cn(
                          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          isUserMessage ? "left-0 -translate-x-full" : "right-0 translate-x-full"
                        )}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isUserMessage ? "start" : "end"}>
                            <DropdownMenuItem onClick={() => copyToClipboard(message.content)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReplyMessage?.(message)}>
                              <Reply className="h-4 w-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            {isUserMessage && (
                              <DropdownMenuItem
                                onClick={() => onDeleteMessage?.(message.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  {isUserMessage && (
                    <div className="flex items-center justify-end space-x-1">
                      {lastMessage.read ? (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Check className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
