
import { useAuth } from "@/context/AuthContext";
import { MessageType } from "@/types/message";
import { formatMessageTime } from "@/utils/dateFormat";

interface MessageListProps {
  messages: MessageType[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const { user } = useAuth();
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center">
        <p className="text-muted-foreground mb-2">No messages yet</p>
        <p className="text-sm">Start the conversation by sending a message</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => {
        const isUserMessage = message.sender_id === user?.id;
        return (
          <div 
            key={message.id}
            className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] p-3 rounded-lg ${
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
            </div>
          </div>
        );
      })}
    </>
  );
};
