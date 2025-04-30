import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageList } from "@/components/messages/MessageList";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Messages() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(chatId || null);
  const { chats, loadingChats } = useMessages();

  // Update selected chat when URL param changes
  useEffect(() => {
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [chatId]);

  // Update URL when selected chat changes
  useEffect(() => {
    if (selectedChat && selectedChat !== chatId) {
      navigate(`/messages/${selectedChat}`);
    }
  }, [selectedChat, navigate, chatId]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-[60vh] bg-white rounded-lg border shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to view your messages</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to access your messages</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex flex-col h-[85vh]">
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/3 border-r md:h-full h-1/3 flex flex-col">
              <div className="p-4 border-b bg-muted/30">
                <h1 className="text-2xl font-bold">Messages</h1>
              </div>
              <div className="flex-1 overflow-hidden">
                {loadingChats ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <MessageList 
                        selectedChatId={selectedChat} 
                        onSelectChat={setSelectedChat} 
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
            <div className="w-full md:w-2/3 md:h-full h-2/3 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedChat || 'empty'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col"
                >
                  {selectedChat ? (
                    <ChatWindow chatId={selectedChat} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                        <p className="text-muted-foreground max-w-md">
                          Select a conversation to start messaging or message a seller from a product page
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
