
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

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
    handleImageUpload
  } = useMessages(chatId);

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
