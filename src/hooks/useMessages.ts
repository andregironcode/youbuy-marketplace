
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatType, MessageType } from "@/types/message";
import { products } from "@/data/products";

export const useMessages = (chatId?: string) => {
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
  const [currentProduct, setCurrentProduct] = useState<any>(null);

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

          // Get products from our local data for this demo
          const enhancedChats = await Promise.all(
            (data || []).map(async (chat) => {
              // Determine if user is buyer or seller
              const isUserSeller = chat.seller_id === user.id;
              const otherUserId = isUserSeller ? chat.buyer_id : chat.seller_id;
              
              // Find matching product from our local data
              const matchedProduct = products.find(p => p.id === chat.product_id);
              
              // For local development, we'll use mock product data
              const productData = matchedProduct || {
                title: "Product Item",
                price: 100,
                image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
              };
              
              // Get otherUser info - for mock data, we use the seller info from products
              let otherUserInfo = {
                name: 'Unknown User',
                avatar: '',
              };
              
              if (isUserSeller && matchedProduct) {
                // If current user is seller and the other user is buyer, we don't have buyer info in our mock data
                otherUserInfo = {
                  name: 'Potential Buyer',
                  avatar: '',
                };
              } else if (matchedProduct) {
                // If current user is buyer, use the seller info from our mock data
                otherUserInfo = {
                  name: matchedProduct.seller.name,
                  avatar: matchedProduct.seller.avatar,
                };
              }

              // Get last message
              const { data: lastMessageData } = await supabase
                .from('messages')
                .select('content, created_at')
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
                otherUser: otherUserInfo,
                product: {
                  title: productData.title || 'Unknown Product',
                  price: productData.price || 0,
                  image: productData.image || '',
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

  // Fetch messages for current chat and set product info
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

        // Find product from mock data
        const productData = products.find(p => p.id === chatData.product_id);
        setCurrentProduct(productData);

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

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      // First check if the message belongs to the current user
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();
      
      if (messageError) throw messageError;
      
      // Verify that the current user is the sender
      if (messageData.sender_id !== user.id) {
        toast({
          title: "Permission denied",
          description: "You can only delete your own messages.",
          variant: "destructive"
        });
        return;
      }
      
      // Delete the message
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
        
      if (deleteError) throw deleteError;
      
      // Update local state to remove the deleted message
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      toast({
        title: "Message deleted",
        description: "Your message has been removed from the conversation."
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Failed to delete message",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  return {
    user,
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
    handleDeleteMessage
  };
};
