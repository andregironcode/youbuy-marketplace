
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const Messages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const {
    chats,
    messages,
    currentChat,
    currentProduct,
    newMessage,
    setNewMessage,
    sendingMessage,
    loadingChats,
    loadingMessages,
    handleSendMessage,
    handleDeleteMessage,
    handleImageUpload,
    loadChatById,
    fetchChats
  } = useMessages(chatId);

  // Force load the chat when the component mounts or chatId changes
  useEffect(() => {
    if (chatId) {
      console.log("Messages page: Explicitly loading chat ID:", chatId);
      loadChatById(chatId);
    }
  }, [chatId, loadChatById]);

  // Add this debugging log to track chat loading
  useEffect(() => {
    console.log("Current chat state:", { 
      chatId, 
      hasCurrentChat: !!currentChat, 
      loadingMessages,
      messagesCount: messages.length
    });
  }, [chatId, currentChat, loadingMessages, messages]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <ProfileSidebar />
        <main className="flex-1 container py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
            {/* Chat List */}
            <div className={`border rounded-lg overflow-hidden ${chatId ? 'hidden md:block' : 'block'}`}>
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold text-lg">Messages</h2>
              </div>
              
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <ChatList 
                  chats={chats} 
                  loading={loadingChats} 
                  currentChatId={chatId} 
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className={`border rounded-lg overflow-hidden md:col-span-2 lg:col-span-3 flex flex-col ${!chatId ? 'hidden md:flex' : 'flex'}`}>
              {!chatId ? (
                <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to view messages</p>
                </div>
              ) : loadingMessages ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b bg-gray-50 flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-3/4" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : !currentChat ? (
                <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">Chat is loading or could not be found</p>
                  <p className="text-sm">Please try refreshing if this persists. Chat ID: {chatId}</p>
                </div>
              ) : (
                <ChatWindow 
                  currentChat={currentChat}
                  messages={messages}
                  currentProduct={currentProduct}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  handleImageUpload={handleImageUpload}
                  sendingMessage={sendingMessage}
                  loading={loadingMessages}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Messages;
