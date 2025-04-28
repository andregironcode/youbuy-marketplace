import { useState } from "react";
import { useParams } from "react-router-dom";
import { AccountLayout } from "@/components/profile/AccountLayout";
import { MessageList } from "@/components/messages/MessageList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useAuth } from "@/context/AuthContext";

export default function Messages() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(chatId || null);

  if (!user) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">Please sign in to view your messages</p>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="bg-white rounded-lg border shadow-sm">
        <h1 className="text-xl font-semibold p-4 border-b">Messages</h1>
        <div className="flex flex-col md:flex-row h-[70vh]">
          <div className="w-full md:w-1/3 border-r">
            <MessageList 
              selectedChatId={selectedChat} 
              onSelectChat={setSelectedChat} 
            />
          </div>
          <div className="w-full md:w-2/3">
            {selectedChat ? (
              <ChatWindow chatId={selectedChat} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}