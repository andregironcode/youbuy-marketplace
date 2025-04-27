import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ChatList } from "@/components/messages/ChatList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useMessages } from "@/hooks/useMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Settings, Loader2, ArrowLeft, Bell, Search as SearchIcon, Filter, Plus } from "lucide-react";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

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

    // Ensure chats are loaded before navigating
    if (chats.length > 0 && !loadingChats) {
      // On mobile, don't auto-navigate to first chat
      if (!isMobile) {
        const isExactMessagesRoute = location.pathname === '/messages';
        if (isExactMessagesRoute) {
          console.log('Auto-navigating to first chat:', chats[0].id);
          navigate(`/messages/${chats[0].id}`, { replace: true });
        }
      }
    }
  }, [chatId, chats, initialLoadComplete, navigate, location.pathname, authLoading, isMobile, loadingChats]);

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      chat.other_user?.full_name?.toLowerCase().includes(searchLower) ||
      chat.product?.title?.toLowerCase().includes(searchLower) ||
      chat.last_message?.content?.toLowerCase().includes(searchLower)
    );
  });

  // Count unread messages
  const unreadCount = chats.reduce((count, chat) => {
    if (chat.last_message && !chat.last_message.read && chat.last_message.sender_id !== user?.id) {
      return count + 1;
    }
    return count;
  }, 0);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="daisy-loading daisy-loading-spinner daisy-loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading your messages...</p>
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
        <div className="daisy-navbar bg-base-100 shadow-sm">
          <div className="flex-1">
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
        </div>
      ) : (
        // Desktop header or mobile chat list header
        <PageHeader
          title="Messages"
          description="Chat with buyers and sellers about products"
        >
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/search')}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 daisy-badge daisy-badge-primary daisy-badge-xs">{unreadCount}</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => fetchChats()}>
                  <Bell className="h-4 w-4 mr-2" />
                  Refresh Messages
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Notification settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PageHeader>
      )}

      <div className={`daisy-card daisy-card-bordered bg-base-100 shadow-sm overflow-hidden flex ${isMobile ? 'h-[calc(100vh-9rem)]' : 'h-[calc(100vh-12rem)]'}`}>
        {/* Left sidebar: Chat list - always visible on desktop, conditionally on mobile */}
        {(!isMobile || showChatList) && (
          <div className={`${isMobile ? 'w-full' : 'w-96'} border-r flex flex-col`}>
            <div className="flex flex-col h-full">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-4 pt-4">
                  <TabsList className="w-full daisy-tabs daisy-tabs-boxed">
                    <TabsTrigger value="all" className="flex-1 daisy-tab">All</TabsTrigger>
                    <TabsTrigger value="unread" className="flex-1 daisy-tab">
                      Unread
                      {unreadCount > 0 && (
                        <Badge className="ml-1 bg-primary text-primary-content">{unreadCount}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="flex-1 daisy-tab">Archived</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search messages..."
                      className="daisy-input daisy-input-bordered w-full pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <TabsContent value="all" className="m-0 flex-1 flex flex-col">
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
                    {filteredChats.filter(chat => 
                      chat.last_message && 
                      !chat.last_message.read && 
                      chat.last_message.sender_id !== user.id
                    ).length > 0 ? (
                      <ChatList 
                        chats={filteredChats.filter(chat => 
                          chat.last_message && 
                          !chat.last_message.read && 
                          chat.last_message.sender_id !== user.id
                        )}
                        loading={loadingChats}
                        currentChatId={chatId}
                      />
                    ) : (
                      <div className="daisy-hero h-full bg-base-200">
                        <div className="daisy-hero-content text-center">
                          <div className="max-w-md">
                            <h2 className="text-xl font-bold">No unread messages</h2>
                            <p className="py-4">You're all caught up! Check back later for new messages.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="archived" className="m-0 flex-1">
                  <div className="daisy-hero h-full bg-base-200">
                    <div className="daisy-hero-content text-center">
                      <div className="max-w-md">
                        <h2 className="text-xl font-bold">No archived conversations</h2>
                        <p className="py-4">Archived conversations will appear here</p>
                        <Button variant="outline">Learn how archiving works</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Right side: Chat window - always visible on desktop, conditionally on mobile */}
        {showChatDetail && (
          <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
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
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default Messages;
