import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { AccountLayout } from "@/components/profile/AccountLayout";
import { PageHeader } from "@/components/profile/PageHeader";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams<{ chatId: string }>();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, loading: authLoading } = useAuth();
  
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

  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!loadingChats && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loadingChats, initialLoadComplete]);

  useEffect(() => {
    if (!initialLoadComplete || authLoading) return;
    const isExactMessagesRoute = location.pathname === '/messages';
    if (isExactMessagesRoute && chats.length > 0) {
      navigate(`/messages/${chats[0].id}`, { replace: true });
    }
  }, [chatId, chats, initialLoadComplete, navigate, location.pathname, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-youbuy mb-2" />
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <AccountLayout>
      <PageHeader
        title="Messages"
        description="Your conversations with buyers and sellers"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark all as read</DropdownMenuItem>
            <DropdownMenuItem>Archive chats</DropdownMenuItem>
            <DropdownMenuItem>Notification settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex h-[calc(100vh-12rem)]">
        {/* Left sidebar: Chat list */}
        <div className={`w-1/3 border-r ${chatId && 'hidden md:block'}`}>
          <div className="flex flex-col h-full">
            <Tabs defaultValue="all" className="w-full">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                  <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
                </TabsList>
              </div>
              
              <Separator className="mt-4" />
              
              <TabsContent value="all" className="m-0 flex-1 flex flex-col">
                <div className="p-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search messages..." 
                      className="w-full pl-8 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-youbuy focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <ChatList 
                    chats={chats} 
                    loading={loadingChats} 
                    currentChatId={chatId} 
                  />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="unread" className="m-0">
                <div className="flex flex-col justify-center items-center h-64 p-4 text-center">
                  <p className="text-muted-foreground mb-2">No unread messages</p>
                  <p className="text-sm">All caught up!</p>
                </div>
              </TabsContent>
              
              <TabsContent value="archived" className="m-0">
                <div className="flex flex-col justify-center items-center h-64 p-4 text-center">
                  <p className="text-muted-foreground mb-2">No archived chats</p>
                  <p className="text-sm">Chats you archive will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right side: Chat window */}
        <div className={`flex-1 ${!chatId ? 'hidden md:block' : 'block'}`}>
          {!chatId ? (
            <div className="flex flex-col justify-center items-center h-full p-8 text-center bg-gray-50/50">
              <div className="w-16 h-16 rounded-full bg-youbuy/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-youbuy" />
              </div>
              <h3 className="text-lg font-medium mb-2">Your Messages</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Select a conversation from the list to view your messages. Messages about items you're buying or selling will appear here.
              </p>
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
    </AccountLayout>
  );
};

export default Messages;
