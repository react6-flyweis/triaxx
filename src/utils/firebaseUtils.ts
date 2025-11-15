import { createGroupChat } from "@/services/chatService";
import { db } from "@/config/firebase";
import { collection, getDocs, deleteDoc } from "firebase/firestore";

/**
 * Utility functions to help with Firebase data management
 */

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  const requiredEnvVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
  ];

  return requiredEnvVars.every(
    (key) =>
      import.meta.env[key] && import.meta.env[key] !== "your_api_key_here"
  );
};

// Initialize default group chats for teams
export const initializeDefaultChats = async (currentUserId: string) => {
  try {
    // Check if chats already exist
    const chatsRef = collection(db, "chats");
    const snapshot = await getDocs(chatsRef);

    if (snapshot.empty) {
      // Create default team chats
      const teamGroups = [
        {
          name: "Team Triaxx (Cashiers)",
          avatar: "https://randomuser.me/api/portraits/women/46.jpg",
          memberIds: ["u1", "u2", currentUserId],
        },
        {
          name: "Team Triaxx (Waiters)",
          avatar: "https://randomuser.me/api/portraits/men/47.jpg",
          memberIds: ["u3", currentUserId],
        },
        {
          name: "Team Triaxx (Chefs)",
          avatar: "https://randomuser.me/api/portraits/men/48.jpg",
          memberIds: ["u4", currentUserId],
        },
      ];

      for (const group of teamGroups) {
        await createGroupChat(
          group.name,
          group.avatar,
          group.memberIds,
          currentUserId
        );
      }

      console.log("✅ Default team chats created successfully");
      return true;
    }

    console.log("ℹ️ Chats already exist, skipping initialization");
    return false;
  } catch (error) {
    console.error("❌ Error initializing default chats:", error);
    throw error;
  }
};

// Get Firebase usage statistics
export const getFirebaseStats = async () => {
  try {
    const chatsSnapshot = await getDocs(collection(db, "chats"));
    const messagesSnapshot = await getDocs(collection(db, "messages"));

    return {
      totalChats: chatsSnapshot.size,
      totalMessages: messagesSnapshot.size,
      chats: chatsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error("Error getting Firebase stats:", error);
    throw error;
  }
};

// Delete all chat data (use with caution!)
export const clearAllChatData = async () => {
  if (
    !confirm(
      "⚠️ Are you sure you want to delete ALL chat data? This cannot be undone!"
    )
  ) {
    return;
  }

  try {
    const chatsSnapshot = await getDocs(collection(db, "chats"));
    const messagesSnapshot = await getDocs(collection(db, "messages"));

    // Delete all messages
    for (const doc of messagesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Delete all chats
    for (const doc of chatsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    console.log("✅ All chat data deleted successfully");
    return true;
  } catch (error) {
    console.error("❌ Error deleting chat data:", error);
    throw error;
  }
};
