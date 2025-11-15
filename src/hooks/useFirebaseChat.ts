import { useState, useEffect, useCallback } from "react";
import type { FirebaseMessage, FirebaseChat } from "@/services/chatService";
import {
  subscribeToMessages,
  subscribeToChats,
  sendMessage as sendMessageService,
  markMessagesAsRead,
  uploadChatFile,
  getOrCreateIndividualChat,
  getUnreadCount,
} from "@/services/chatService";

export const useFirebaseChat = (currentUserId: string) => {
  const [chats, setChats] = useState<FirebaseChat[]>([]);
  const [messages, setMessages] = useState<Record<string, FirebaseMessage[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to chats
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    const unsubscribe = subscribeToChats(currentUserId, (updatedChats) => {
      setChats(updatedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Subscribe to messages for a specific chat
  const subscribeToChat = useCallback((chatId: string) => {
    const unsubscribe = subscribeToMessages(chatId, (updatedMessages) => {
      setMessages((prev) => ({
        ...prev,
        [chatId]: updatedMessages,
      }));
    });

    return unsubscribe;
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (
      chatId: string,
      text: string,
      senderName: string,
      senderAvatar: string,
      files?: File[]
    ) => {
      try {
        if (files && files.length > 0) {
          // Upload files and send messages
          for (const file of files) {
            const { url, fileName, fileType } = await uploadChatFile(
              file,
              chatId,
              currentUserId
            );
            await sendMessageService(
              chatId,
              currentUserId,
              senderName,
              senderAvatar,
              text || `Sent ${fileName}`,
              url,
              fileName,
              fileType
            );
          }
        } else if (text.trim()) {
          // Send text message
          await sendMessageService(
            chatId,
            currentUserId,
            senderName,
            senderAvatar,
            text
          );
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
        throw err;
      }
    },
    [currentUserId]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (chatId: string) => {
      try {
        await markMessagesAsRead(chatId, currentUserId);
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    },
    [currentUserId]
  );

  // Start individual chat
  const startIndividualChat = useCallback(
    async (otherUserId: string) => {
      try {
        const chatId = await getOrCreateIndividualChat(
          currentUserId,
          otherUserId
        );
        return chatId;
      } catch (err) {
        console.error("Error starting chat:", err);
        setError("Failed to start chat");
        throw err;
      }
    },
    [currentUserId]
  );

  // Get unread count for a chat
  const getUnreadCountForChat = useCallback(
    (chatId: string) => {
      const chatMessages = messages[chatId] || [];
      return getUnreadCount(chatMessages, currentUserId);
    },
    [messages, currentUserId]
  );

  return {
    chats,
    messages,
    loading,
    error,
    subscribeToChat,
    sendMessage,
    markAsRead,
    startIndividualChat,
    getUnreadCountForChat,
  };
};
