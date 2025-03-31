
import { useAuth } from "@/context/AuthContext";
import { MessageType } from "@/types/message";
import { formatMessageTime } from "@/utils/dateFormat";
import { Trash2, Check, CheckCheck } from "lucide-react";
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
import { useState, useEffect, useRef } from "react";

interface MessageListProps {
  messages: MessageType[];
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageList = ({ messages, onDeleteMessage }: MessageListProps) => {
  const { user } = useAuth();
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

  return (
    <>
      {messages.map((message) => {
        const isUserMessage = message.sender_id === user?.id;
        const isImageMessage = message.content.startsWith('image:');
        
        return (
          <div 
            key={message.id}
            className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4 max-w-full`}
          >
            <div className={`relative group max-w-[80%] p-3 rounded-lg ${
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
                <img
                  src={message.content.substring(6)}
                  alt="Shared image"
                  className="rounded max-w-full h-auto cursor-pointer"
                  onClick={() => window.open(message.content.substring(6), '_blank')}
                />
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
                    <CheckCheck className="h-3.5 w-3.5 ml-1 text-blue-400" />
                  ) : (
                    <Check className="h-3.5 w-3.5 ml-1 text-gray-400" />
                  )
                )}
              </div>
              
              {isUserMessage && onDeleteMessage && (
                <AlertDialog open={messageToDelete === message.id} onOpenChange={(open) => {
                  if (!open) setMessageToDelete(null);
                }}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-destructive hover:bg-transparent transition-opacity"
                      onClick={() => setMessageToDelete(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
};
