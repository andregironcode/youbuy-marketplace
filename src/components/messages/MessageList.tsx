
import { useAuth } from "@/context/AuthContext";
import { MessageType } from "@/types/message";
import { formatMessageTime } from "@/utils/dateFormat";
import { Trash2 } from "lucide-react";
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
import { useState } from "react";

interface MessageListProps {
  messages: MessageType[];
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageList = ({ messages, onDeleteMessage }: MessageListProps) => {
  const { user } = useAuth();
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  
  if (messages.length === 0) {
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
        return (
          <div 
            key={message.id}
            className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`relative max-w-[70%] p-3 rounded-lg ${
              isUserMessage 
                ? 'bg-youbuy text-white rounded-tr-none' 
                : 'bg-gray-100 rounded-tl-none'
            }`}>
              <p>{message.content}</p>
              <p className={`text-xs mt-1 text-right ${
                isUserMessage ? 'text-white/80' : 'text-gray-500'
              }`}>
                {formatMessageTime(message.created_at)}
              </p>
              
              {isUserMessage && onDeleteMessage && (
                <AlertDialog open={messageToDelete === message.id} onOpenChange={(open) => {
                  if (!open) setMessageToDelete(null);
                }}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-8 top-0 text-gray-400 hover:text-destructive hover:bg-transparent"
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
    </>
  );
};
