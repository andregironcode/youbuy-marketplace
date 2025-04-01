import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
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
  // Get the auth context
  const { user, loading: authLoading } = useAuth();
  
  // Only proceed with message loading after auth is confirmed
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

  // Redirect to auth if user is not logged in (but only after auth has fully loaded)
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Debug current state
  useEffect(() => {
    console.log("Current chat state:", { 
      chatId, 
      hasCurrentChat: !!currentChat, 
      loadingMessages,
      messagesCount: messages.length,
      loadingChats,
      chatsCount: chats.length,
      initialLoadComplete,
      authLoading,
      isAuthenticated: !!user
    });
  }, [chatId, currentChat, loadingMessages, messages, loadingChats, chats, initialLoadComplete, authLoading, user]);

  // Mark when initial data loading is done
  useEffect(() => {
    if (!loadingChats && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [loadingChats, initialLoadComplete]);

  // Only redirect to the first chat if explicitly on the /messages route (not during refresh)
  // and after initial loading is complete with available chats
  useEffect(() => {
    // Only proceed if we've completed initial loading and auth is also loaded
    if (!initialLoadComplete || authLoading) return;
    
    // Only redirect if we're on the exact /messages path (not a specific chat)
    const isExactMessagesRoute = location.pathname === '/messages';
    
    // Only redirect if we have chats to redirect to
    if (isExactMessagesRoute && chats.length > 0) {
      console.log("Redirecting to first chat:", chats[0].id);
      navigate(`/messages/${chats[0].id}`, { replace: true });
    }
  }, [chatId, chats, initialLoadComplete, navigate, location.pathname, authLoading]);

  // Show loading state while authentication is being checked
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

  // Don't render anything if not authenticated - we'll redirect
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex">
      <ProfileSidebar />
      <main className="flex-1 py-4 px-6 ml-[280px] overflow-hidden">
        <div className="flex flex-col h-[calc(100vh-2rem)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-youbuy" />
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
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
          </div>

          {/* Main content */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex-1 flex">
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
              ) : loadingMessages ? (
                <div className="flex-1 flex flex-col h-full">
                  <div className="p-4 border-b flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="md:hidden mr-2"
                      onClick={() => navigate('/messages')}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex-1 p-6 space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className={`h-12 w-56 rounded-lg ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : !currentChat && chatId ? (
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
        </div>
      </main>
    </div>
  );
};

export default Messages;
