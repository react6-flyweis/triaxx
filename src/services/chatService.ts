import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  arrayUnion,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/config/firebase";

export interface FirebaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Timestamp;
  readBy: string[];
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface FirebaseChat {
  id: string;
  type: "individual" | "group";
  name?: string;
  avatar?: string;
  memberIds: string[];
  lastMessage?: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create or get individual chat
export const getOrCreateIndividualChat = async (
  currentUserId: string,
  otherUserId: string
): Promise<string> => {
  // Check if chat already exists
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("type", "==", "individual"),
    where("memberIds", "array-contains", currentUserId)
  );

  const snapshot = await getDocs(q);
  const existingChat = snapshot.docs.find((doc) => {
    const data = doc.data();
    return data.memberIds.includes(otherUserId);
  });

  if (existingChat) {
    return existingChat.id;
  }

  // Create new chat
  const newChat = await addDoc(chatsRef, {
    type: "individual",
    memberIds: [currentUserId, otherUserId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newChat.id;
};

// Create group chat
export const createGroupChat = async (
  name: string,
  avatar: string,
  memberIds: string[],
  createdBy: string
): Promise<string> => {
  const chatsRef = collection(db, "chats");
  const newChat = await addDoc(chatsRef, {
    type: "group",
    name,
    avatar,
    memberIds,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newChat.id;
};

// Send message
export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  text: string,
  fileUrl?: string,
  fileName?: string,
  fileType?: string
): Promise<void> => {
  const messagesRef = collection(db, "messages");
  const messageData: Record<string, unknown> = {
    chatId,
    senderId,
    senderName,
    senderAvatar,
    text,
    timestamp: serverTimestamp(),
    readBy: [senderId],
  };

  if (fileUrl) {
    messageData.fileUrl = fileUrl;
    messageData.fileName = fileName;
    messageData.fileType = fileType;
  }

  await addDoc(messagesRef, messageData);

  // Update chat's last message
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: {
      text: text || "Sent a file",
      timestamp: serverTimestamp(),
      senderId,
    },
    updatedAt: serverTimestamp(),
  });
};

// Upload file to Firebase Storage
export const uploadChatFile = async (
  file: File,
  chatId: string,
  userId: string
): Promise<{ url: string; fileName: string; fileType: string }> => {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `chats/${chatId}/${userId}/${fileName}`);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    url,
    fileName: file.name,
    fileType: file.type,
  };
};

// Subscribe to messages
export const subscribeToMessages = (
  chatId: string,
  callback: (messages: FirebaseMessage[]) => void
): (() => void) => {
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("chatId", "==", chatId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages: FirebaseMessage[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseMessage[];
    callback(messages);
  });
};

// Subscribe to chats
export const subscribeToChats = (
  userId: string,
  callback: (chats: FirebaseChat[]) => void
): (() => void) => {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("memberIds", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const chats: FirebaseChat[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseChat[];
    callback(chats);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("chatId", "==", chatId),
    where("senderId", "!=", userId)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((document) => {
    const data = document.data();
    if (!data.readBy.includes(userId)) {
      batch.update(document.ref, {
        readBy: arrayUnion(userId),
      });
    }
  });

  await batch.commit();
};

// Get chat details
export const getChatDetails = async (
  chatId: string
): Promise<FirebaseChat | null> => {
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);

  if (chatDoc.exists()) {
    return {
      id: chatDoc.id,
      ...chatDoc.data(),
    } as FirebaseChat;
  }

  return null;
};

// Update group chat
export const updateGroupChat = async (
  chatId: string,
  updates: Partial<FirebaseChat>
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Add member to group
export const addMemberToGroup = async (
  chatId: string,
  userId: string
): Promise<void> => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    memberIds: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });
};

// Get unread count for a chat
export const getUnreadCount = (
  messages: FirebaseMessage[],
  userId: string
): number => {
  return messages.filter(
    (msg) => msg.senderId !== userId && !msg.readBy.includes(userId)
  ).length;
};
