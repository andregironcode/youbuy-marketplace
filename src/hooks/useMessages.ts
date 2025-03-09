
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatType, MessageType } from "@/types/message";
import { products } from "@/data/products";

export const useMessages = (chatId?: string) => {
  const { user } = useAuth();
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
  const fetchChats = useCallback(async () => {
    if (!user) return;
    
    setLoadingChats(true);
    try {
      console.log("Fetching chats for user:", user.id);
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
      
      console.log("Chats fetched:", data);

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
            .maybeSingle();

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
            lastMessage: lastMessageData?.content || "No messages yet",
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
  }, [user, toast]);

  // Load chat by ID
  const loadChatById = useCallback(async (id: string) => {
    if (!user) return;
    
    console.log("loadChatById called with ID:", id);
    setLoadingMessages(true);
    setMessages([]); // Clear existing messages
    setCurrentChat(null); // Reset current chat while loading
    
    try {
      // Get the current chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (chatError) {
        console.error("Error fetching chat by ID:", chatError);
        throw chatError;
      }
      
      if (!chatData) {
        console.error("Chat not found");
        toast({
          title: "Chat not found",
          description: "The conversation you're looking for doesn't exist",
          variant: "destructive",
        });
        navigate('/messages');
        return;
      }
      
      console.log("Chat data loaded:", chatData);
      
      // Check if the user is part of this chat
      if (chatData.seller_id !== user.id && chatData.buyer_id !== user.id) {
        console.error("User not authorized to view this chat");
        toast({
          title: "Not authorized",
          description: "You don't have permission to view this conversation",
          variant: "destructive",
        });
        navigate('/messages');
        return;
      }
      
      // Find product from mock data
      const productData = products.find(p => p.id === chatData.product_id);
      setCurrentProduct(productData);
      
      // Determine if user is buyer or seller
      const isUserSeller = chatData.seller_id === user.id;
      const otherUserId = isUserSeller ? chatData.buyer_id : chatData.seller_id;
      
      // Get otherUser info
      let otherUserInfo = {
        name: 'Unknown User',
        avatar: '',
      };
      
      if (isUserSeller && productData) {
        otherUserInfo = {
          name: 'Potential Buyer',
          avatar: '',
        };
      } else if (productData) {
        otherUserInfo = {
          name: productData.seller.name,
          avatar: productData.seller.avatar,
        };
      }
      
      // Set enhanced chat data
      const enhancedChatData = {
        ...chatData,
        otherUser: otherUserInfo,
        product: {
          title: productData?.title || 'Unknown Product',
          price: productData?.price || 0,
          image: productData?.image || '',
        },
      };
      
      setCurrentChat(enhancedChatData);
      
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('product_id', chatData.product_id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        throw messagesError;
      }
      
      console.log("Messages loaded:", messagesData?.length);
      setMessages(messagesData || []);

      // Mark messages as read
      if (messagesData && messagesData.length > 0) {
        const unreadMessages = messagesData.filter(msg => 
          msg.receiver_id === user.id && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', user.id)
            .eq('product_id', chatData.product_id)
            .eq('read', false);
        }
      }

    } catch (error) {
      console.error("Error loading chat by ID:", error);
      toast({
        title: "Error loading conversation",
        description: "Please try again later",
        variant: "destructive",
      });
      navigate('/messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [user, toast, navigate]);

  // Fetch chats on initial load
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchChats();
    
    // Set up message subscription for all user's chats
    const messageSubscription = supabase
      .channel('all_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        console.log("New message received in subscription");
        fetchChats(); // Refresh chats when receiving new messages
        
        // Reload current chat if we're viewing one
        if (chatId) {
          loadChatById(chatId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [user, navigate, fetchChats]);

  // Load specific chat when chatId changes
  useEffect(() => {
    if (chatId && user) {
      console.log("Chat ID changed, loading:", chatId);
      loadChatById(chatId);
    }
  }, [chatId, user, loadChatById]);

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
      
      // Reload messages after sending
      loadChatById(currentChat.id);
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

  const handleImageUpload = async (file: File) => {
    if (!user || !currentChat) return;
    
    setSendingMessage(true);
    try {
      // Create a mock image URL - in production this would be the actual upload URL
      const mockImageUrl = URL.createObjectURL(file);
      
      const receiverId = currentChat.seller_id === user.id 
        ? currentChat.buyer_id 
        : currentChat.seller_id;
      
      // Insert message with image URL
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          product_id: currentChat.product_id,
          // Prefixing with "image:" to distinguish image messages
          content: `image:${mockImageUrl}`,
        });
        
      if (msgError) throw msgError;
      
      // Update last_message_at in chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentChat.id);
      
      // Reload messages after sending
      loadChatById(currentChat.id);
    } catch (error) {
      console.error("Error sending image:", error);
      toast({
        title: "Failed to send image",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user || !currentChat) return;
    
    try {
      // First check if the message belongs to the current user
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .maybeSingle();
      
      if (messageError) throw messageError;
      
      if (!messageData) {
        toast({
          title: "Message not found",
          description: "The message you're trying to delete no longer exists.",
          variant: "destructive"
        });
        return;
      }
      
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
      
      // Reload messages after deletion
      loadChatById(currentChat.id);
      
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
    handleDeleteMessage,
    handleImageUpload,
    loadChatById,
    fetchChats
  };
};
