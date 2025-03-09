import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChatType, MessageType } from "@/types/message";
import { SendHorizonal, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const Messages = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch chats
  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
      return;
    }

    if (user) {
      const fetchChats = async () => {
        setLoadingChats(true);
        try {
          const { data, error } = await supabase
            .from('chats')
            .select(`
              id, 
              product_id, 
              seller_id, 
              buyer_id, 
              last_message_at, 
              created_at
            `)
            .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
            .order('last_message_at', { ascending: false });

          if (error) throw error;

          // Fetch additional info for each chat
          const enhancedChats = await Promise.all(
            (data || []).map(async (chat) => {
              // Determine if user is buyer or seller
              const isUserSeller = chat.seller_id === user.id;
              const otherUserId = isUserSeller ? chat.buyer_id : chat.seller_id;

              // Get the other user's info
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', otherUserId)
                .single();

              // For local development, we'll use mock product data since we don't have a products table in Supabase
              // In a real app, you would fetch this from your database
              const productData = {
                title: "Product Item",
                price: 100,
                image_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              };

              // Get last message
              const { data: lastMessageData } = await supabase
                .from('messages')
                .select('content, created_at')
                .or(`sender_id.eq.${chat.seller_id},sender_id.eq.${chat.buyer_id}`)
                .eq('product_id', chat.product_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              // Get unread count
              const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('receiver_id', user.id)
                .eq('read', false)
                .eq('product_id', chat.product_id);

              return {
                ...chat,
                otherUser: {
                  name: profileData?.full_name || 'Unknown User',
                  avatar: profileData?.avatar_url || '',
                },
                product: {
                  title: productData.title || 'Unknown Product',
                  price: productData.price || 0,
                  image: productData.image_url || '',
                },
                lastMessage: lastMessageData?.content,
                unreadCount: count || 0,
              };
            })
          );

          setChats(enhancedChats);
        } catch (error) {
          console.error("Error fetching chats:", error);
          toast({
            title: "Error loading chats",
            description: "Please try again later",
            variant: "destructive",
          });
        } finally {
          setLoadingChats(false);
        }
      };

      fetchChats();

      // Subscribe to changes in chats
      const chatSubscription = supabase
        .channel('public:chats')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'chats',
          filter: `seller_id=eq.${user.id}|buyer_id=eq.${user.id}`
        }, () => {
          fetchChats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(chatSubscription);
      };
    }
  }, [user, loading, navigate, toast]);

  // Fetch messages for current chat
  useEffect(() => {
    if (!chatId || !user) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        // Get the current chat
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();

        if (chatError) throw chatError;
        setCurrentChat(chatData as ChatType);

        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('product_id', chatData.product_id)
          .or(`sender_id.eq.${chatData.seller_id},sender_id.eq.${chatData.buyer_id}`)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData as MessageType[]);

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiver_id', user.id)
          .eq('product_id', chatData.product_id);

      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error loading conversation",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `product_id=eq.${currentChat?.product_id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as MessageType]);
        
        // If message is for current user, mark as read
        if (payload.new.receiver_id === user.id) {
          supabase
            .from('messages')
            .update({ read: true })
            .eq('id', payload.new.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [chatId, user, currentChat?.product_id, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !currentChat) return;
    
    setSendingMessage(true);
    try {
      const receiverId = currentChat.seller_id === user.id 
        ? currentChat.buyer_id 
        : currentChat.seller_id;
      
      // Insert message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          product_id: currentChat.product_id,
          content: newMessage,
        });
        
      if (msgError) throw msgError;
      
      // Update last_message_at in chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentChat.id);
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm');
    }
    
    // If within last 7 days, show day of week
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return format(date, 'EEE');
    }
    
    // Otherwise show date
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Chat List */}
          <div className={`border rounded-lg overflow-hidden ${chatId ? 'hidden md:block' : 'block'}`}>
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-bold text-lg">Messages</h2>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {loadingChats ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading conversations...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">No messages yet</p>
                  <p className="text-sm">When you message sellers about items, you'll see your conversations here.</p>
                </div>
              ) : (
                <>
                  {chats.map((chat) => (
                    <div 
                      key={chat.id}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${chatId === chat.id ? 'bg-gray-100' : ''}`}
                      onClick={() => navigate(`/messages/${chat.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={chat.otherUser?.avatar} />
                          <AvatarFallback>{chat.otherUser?.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-medium truncate">{chat.otherUser?.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatChatTime(chat.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {chat.product?.title}
                          </p>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="mt-1 flex justify-end">
                          <Badge className="bg-youbuy">{chat.unreadCount}</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
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
              <div className="flex justify-center items-center h-full">
                <p>Loading messages...</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b bg-gray-50 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden mr-2"
                    onClick={() => navigate('/messages')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={currentChat?.otherUser?.avatar} />
                    <AvatarFallback>
                      {currentChat?.otherUser?.name.substring(0, 2) || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {currentChat?.otherUser?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentChat?.product?.title || 'Unknown Product'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-center">
                      <p className="text-muted-foreground mb-2">No messages yet</p>
                      <p className="text-sm">Start the conversation by sending a message</p>
                    </div>
                  ) : (
                    messages.map((message) => {
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
                    })
                  )}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t">
                  <div className="flex space-x-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="min-h-[45px] max-h-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-youbuy hover:bg-youbuy-dark self-end h-[45px] px-4"
                    >
                      <SendHorizonal className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
