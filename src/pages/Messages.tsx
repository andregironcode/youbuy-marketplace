
import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Messages = () => {
  const navigate = useNavigate();
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
    handleImageUpload
  } = useMessages(chatId);  // No need to check for undefined - useMessages handles it

  // Debug current state
  useEffect(() => {
    console.log("Current chat state:", { 
      chatId, 
      hasCurrentChat: !!currentChat, 
      loadingMessages,
      messagesCount: messages.length
    });
  }, [chatId, currentChat, loadingMessages, messages]);

  // If no valid chatId but chats are loaded, redirect to the first chat
  useEffect(() => {
    if (!chatId && chats.length > 0 && !loadingChats) {
      navigate(`/messages/${chats[0].id}`);
    }
  }, [chatId, chats, loadingChats, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <ProfileSidebar />
        <main className="flex-1 container py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
            {/* Chat List - Always visible on desktop, hidden on mobile when showing a chat */}
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

            {/* Chat Window or Empty State */}
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
                  <p className="text-sm">Please try refreshing if this persists.</p>
                  <Link to="/messages" className="mt-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to messages</span>
                    </Button>
                  </Link>
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
