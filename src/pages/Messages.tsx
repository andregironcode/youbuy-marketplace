import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Settings, Loader2, ArrowLeft } from "lucide-react";
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams<{ chatId: string }>();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  
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
    // On mobile, don't auto-navigate to first chat
    if (!isMobile) {
      const isExactMessagesRoute = location.pathname === '/messages';
      if (isExactMessagesRoute && chats.length > 0) {
        navigate(`/messages/${chats[0].id}`, { replace: true });
      }
    }
  }, [chatId, chats, initialLoadComplete, navigate, location.pathname, authLoading, isMobile]);

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      chat.other_user?.full_name?.toLowerCase().includes(searchLower) ||
      chat.product?.title?.toLowerCase().includes(searchLower) ||
      chat.last_message?.content?.toLowerCase().includes(searchLower)
    );
  });

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

  // On mobile, show either the chat list or a specific chat based on URL
  const showChatList = isMobile && !chatId;
  const showChatDetail = !isMobile || (isMobile && chatId);

  return (
    <AccountLayout>
      {isMobile && chatId ? (
        // Mobile-specific header when viewing a chat
        <div className="px-4 py-3 border-b flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/messages')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
      ) : (
        // Desktop header or mobile chat list header
        <PageHeader
          title="Messages"
          description=""
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
      )}

      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex ${isMobile ? 'h-[calc(100vh-9rem)]' : 'h-[calc(100vh-12rem)]'}`}>
        {/* Left sidebar: Chat list - always visible on desktop, conditionally on mobile */}
        {(!isMobile || showChatList) && (
          <div className={`${isMobile ? 'w-full' : 'w-80'} border-r flex flex-col`}>
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
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full pl-9 pr-4 py-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <ChatList 
                      chats={filteredChats}
                      loading={loadingChats}
                      currentChatId={chatId}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="unread" className="m-0 flex-1">
                  <div className="h-full overflow-auto">
                    <ChatList 
                      chats={filteredChats.filter(chat => !chat.last_message?.read)}
                      loading={loadingChats}
                      currentChatId={chatId}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="archived" className="m-0 flex-1">
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p className="text-muted-foreground mb-2">No archived conversations</p>
                    <p className="text-sm">Archived conversations will appear here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {/* Right side: Chat window - always visible on desktop, conditionally on mobile */}
        {showChatDetail && (
          <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
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
        )}
      </div>
    </AccountLayout>
  );
};

export default Messages;
