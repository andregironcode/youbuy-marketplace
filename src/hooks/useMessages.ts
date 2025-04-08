import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatType, MessageType } from "@/types/message";
import { ProductType } from "@/types/product";
import { toast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";

type Tables = Database["public"]["Tables"];
type ChatRow = Tables["chats"]["Row"];
type MessageRow = Tables["messages"]["Row"];
type ProfileRow = Tables["profiles"]["Row"];
type ProductRow = Tables["products"]["Row"];

type MessageInsert = {
  chat_id: string;
  content: string;
  sender_id: string;
  read: boolean;
  product_id: string;
  receiver_id: string;
};

// Custom type for messages with profile information
type MessageWithProfile = {
  id: string;
  content: string;
  created_at: string | null;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  read: boolean | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function useMessages(chatId?: string) {
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductType | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load chats on initial load
  useEffect(() => {
    console.log('Loading chats...');
    fetchChats();
  }, []);

  // Fetch chats for the current user
  const fetchChats = async () => {
    if (!user) {
      console.log('No user found, skipping chat fetch');
      setLoadingChats(false);
      return;
    }

    try {
      console.log('Fetching chats for user:', user.id);
      setLoadingChats(true);
      
      // First, get all chats for the user
      const { data: chatsData, error: chatsError } = await supabase
        .from("chats")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
        throw chatsError;
      }

      if (!chatsData || chatsData.length === 0) {
        console.log('No chats found');
        setChats([]);
        setLoadingChats(false);
        return;
      }

      // Then, for each chat, get the associated product, profiles, and messages
      const enhancedChats = await Promise.all(chatsData.map(async (chat) => {
        const [
          { data: product },
          { data: otherUserProfile },
          { data: messages }
        ] = await Promise.all([
          // Get product details
          supabase
            .from("products")
            .select("id, title, price, image_urls, product_status")
            .eq("id", chat.product_id)
            .single(),
          // Get other user's profile
          supabase
            .from("profiles")
            .select("id, full_name, avatar_url, updated_at")
            .eq("id", chat.buyer_id === user.id ? chat.seller_id : chat.buyer_id)
            .single(),
          // Get latest message
          supabase
            .from("messages")
            .select("id, content, created_at, read")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1)
        ]);

        if (!product || !otherUserProfile) {
          console.error('Missing product or profile data for chat:', chat.id);
          return null;
        }

        const lastMessage = messages?.[0];

        const chatData: ChatType = {
          id: chat.id,
          created_at: chat.created_at || new Date().toISOString(),
          last_message_at: chat.last_message_at || new Date().toISOString(),
          buyer_id: chat.buyer_id,
          seller_id: chat.seller_id,
          product_id: chat.product_id,
          unread_count: 0, // TODO: Calculate unread count
          last_message: lastMessage ? {
            id: lastMessage.id,
            content: lastMessage.content,
            created_at: lastMessage.created_at || new Date().toISOString(),
            read: lastMessage.read || false
          } : undefined,
          product: {
            id: product.id,
            title: product.title,
            price: product.price,
            image_urls: product.image_urls,
            product_status: product.product_status as "available" | "reserved" | "sold"
          },
          other_user: {
            id: otherUserProfile.id,
            full_name: otherUserProfile.full_name || "Unknown",
            avatar_url: otherUserProfile.avatar_url,
            last_seen: otherUserProfile.updated_at
          }
        };

        return chatData;
      }));

      const validChats = enhancedChats.filter((chat): chat is ChatType => chat !== null);
      console.log('Processed chats:', validChats);
      setChats(validChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chats. Please try again.",
      });
    } finally {
      setLoadingChats(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!chatId || !user) return;

    console.log(`Subscribing to chat:${chatId}`);
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload: { 
          eventType: string; 
          new: MessageRow;
        }) => {
          console.log('Message event received:', payload.eventType, payload.new);
          if (payload.eventType === 'INSERT') {
            const { data: sender } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", payload.new.sender_id)
              .single();

            const newMessage: MessageType = {
              id: payload.new.id,
              content: payload.new.content,
              created_at: payload.new.created_at || new Date().toISOString(),
              sender_id: payload.new.sender_id,
              receiver_id: payload.new.receiver_id,
              product_id: payload.new.product_id,
              read: payload.new.read || false,
              sender_name: sender?.full_name || "Unknown",
              sender_avatar: sender?.avatar_url
            };

            console.log('Adding new message to state:', newMessage);
            setMessages(prev => [...prev, newMessage]);
            
            // Update chat list if this is the latest message
            setChats(prev => prev.map(chat => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  last_message: {
                    id: newMessage.id,
                    content: newMessage.content,
                    created_at: newMessage.created_at,
                    read: newMessage.read
                  }
                };
              }
              return chat;
            }));
          } else if (payload.eventType === 'UPDATE') {
            // Update message in messages state
            setMessages(prev => prev.map(msg => 
              msg.id === payload.new.id ? {
                ...msg,
                read: payload.new.read || false,
                content: payload.new.content,
                created_at: payload.new.created_at || msg.created_at
              } : msg
            ));

            // Update chat in chats state if it's the last message
            setChats(prev => prev.map(chat => {
              if (chat.id === chatId && chat.last_message?.id === payload.new.id) {
                return {
                  ...chat,
                  last_message: {
                    id: payload.new.id,
                    content: payload.new.content,
                    created_at: payload.new.created_at || new Date().toISOString(),
                    read: payload.new.read || false
                  }
                };
              }
              return chat;
            }));
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`Unsubscribing from chat:${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!chatId || !user || !currentChat) return;

    const markMessagesAsRead = async () => {
      console.log('Marking messages as read in chat:', chatId);
      const { error } = await supabase
        .from("messages")
        .update({ read: true })
        .eq("chat_id", chatId)
        .eq("read", false)
        .neq("sender_id", user.id);

      if (error) {
        console.error('Error marking messages as read:', error);
      } else {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.sender_id !== user.id ? { ...msg, read: true } : msg
        ));

        // Update chat list
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId && chat.last_message) {
            return {
              ...chat,
              last_message: { ...chat.last_message, read: true },
              unread_count: 0
            };
          }
          return chat;
        }));
      }
    };

    markMessagesAsRead();
  }, [chatId, user, currentChat]);

  // Fetch messages for a chat
  const fetchMessages = async (chatId: string) => {
    if (!user) return;

    try {
      console.log('Fetching messages for chat:', chatId);
      setLoadingMessages(true);
      
      // Get all messages for this chat
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, sender_id, receiver_id, product_id, read")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Get all unique sender IDs
        const senderIds = [...new Set(data.map(msg => msg.sender_id))];
        
        // Fetch profiles for all senders in one query
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", senderIds);
        
        // Create a map of profiles by ID for easy lookup
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, {
              full_name: profile.full_name,
              avatar_url: profile.avatar_url
            });
          });
        }
        
        // Format messages with sender info
        const formattedMessages: MessageType[] = data.map(msg => {
          const profile = profilesMap.get(msg.sender_id);
          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at || new Date().toISOString(),
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            product_id: msg.product_id,
            read: msg.read || false,
            sender_name: profile?.full_name || "Unknown",
            sender_avatar: profile?.avatar_url
          };
        });
        
        console.log('Fetched messages:', formattedMessages.length);
        setMessages(formattedMessages);
      } else {
        console.log('No messages found for chat:', chatId);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages. Please try again.",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load a specific chat by ID
  const loadChatById = async (chatId: string) => {
    if (!user) return;

    try {
      console.log('Loading chat:', chatId);
      setLoadingMessages(true);

      // First get the chat details
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();

      if (chatError) throw chatError;
      
      if (!chatData) {
        console.error('Chat not found:', chatId);
        return;
      }

      // Then get the product details
      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("id", chatData.product_id)
        .single();

      // Get the other user's profile
      const otherId = chatData.buyer_id === user.id ? chatData.seller_id : chatData.buyer_id;
      
      const { data: otherUserData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherId)
        .single();

      // Create current chat object
      if (productData && otherUserData) {
        const currentChatData: ChatType = {
          id: chatData.id,
          created_at: chatData.created_at || new Date().toISOString(),
          last_message_at: chatData.last_message_at || new Date().toISOString(),
          buyer_id: chatData.buyer_id,
          seller_id: chatData.seller_id,
          product_id: chatData.product_id,
          unread_count: 0,
          product: {
            id: productData.id,
            title: productData.title,
            price: productData.price,
            image_urls: productData.image_urls,
            product_status: productData.product_status as "available" | "reserved" | "sold"
          },
          other_user: {
            id: otherUserData.id,
            full_name: otherUserData.full_name || "Unknown",
            avatar_url: otherUserData.avatar_url,
            last_seen: otherUserData.updated_at
          }
        };
        
        setCurrentChat(currentChatData);
        
        if (productData) {
          setCurrentProduct({
            id: productData.id,
            title: productData.title,
            description: productData.description,
            price: productData.price,
            image_urls: productData.image_urls,
            location: productData.location,
            createdAt: productData.created_at,
            product_status: productData.product_status as "available" | "reserved" | "sold",
            seller: {
              id: chatData.seller_id,
              name: otherUserData.full_name || "Unknown",
              avatar: otherUserData.avatar_url || '',
              joinedDate: otherUserData.created_at
            },
            category: productData.category,
            likeCount: productData.like_count
          } as ProductType);
        }
      }

      // Get messages
      await fetchMessages(chatId);

    } catch (error) {
      console.error("Error loading chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat. Please try again.",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!user || !chatId || !newMessage.trim() || !currentChat) {
      console.error('Cannot send message - missing data', { user, chatId, messageContent: newMessage, currentChat });
      return;
    }

    try {
      console.log('Sending message in chat:', chatId);
      setSendingMessage(true);

      const messageData: MessageInsert = {
        chat_id: chatId,
        content: newMessage.trim(),
        sender_id: user.id,
        read: false,
        product_id: currentChat.product_id,
        receiver_id: user.id === currentChat.buyer_id ? currentChat.seller_id : currentChat.buyer_id
      };

      const { error } = await supabase
        .from("messages")
        .insert(messageData);

      if (error) throw error;

      // Update the last_message_at timestamp for the chat
      await supabase
        .from("chats")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        description: "Message deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message. Please try again.",
      });
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!user || !chatId || !currentChat) return;

    try {
      setSendingMessage(true);

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      const messageData: MessageInsert = {
        chat_id: chatId,
        content: `image:${publicUrl}`,
        sender_id: user.id,
        read: false,
        product_id: currentChat.product_id,
        receiver_id: user.id === currentChat.buyer_id ? currentChat.seller_id : currentChat.buyer_id
      };

      const { error: messageError } = await supabase
        .from("messages")
        .insert(messageData);

      if (messageError) throw messageError;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Load specific chat when chatId changes
  useEffect(() => {
    if (chatId) {
      loadChatById(chatId);
    } else {
      setCurrentChat(null);
      setCurrentProduct(null);
      setMessages([]);
    }
  }, [chatId]);

  return {
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
    fetchChats,
  };
}
