import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import searchIcon from "@/assets/chats/searchIcon.svg";
import sendIcon from "@/assets/chats/sendIcon.svg";
import mentionIcon from "@/assets/chats/mentionIcon.svg";
import cameraIcon from "@/assets/chats/cameraIcon.svg";
import customerServiceIcon from "@/assets/setting/customer-service.svg";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { settingsTrainingSteps } from "@/walkthrough/steps";
import { useNavigate } from "react-router-dom";
import { useFirebaseChat } from "@/hooks/useFirebaseChat";
import FirebaseDebug from "@/components/common/FirebaseDebug";

// Types
interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastSeen: string;
  type: "individual";
  mobile?: string;
}
interface Group {
  id: string;
  name: string;
  avatar: string;
  memberIds: string[];
  type: "group";
  lastMessage?: {
    text: string;
    time: string;
    senderId: string;
    unread: boolean;
  };
}
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  readBy: string[];
  senderName?: string;
  senderAvatar?: string;
}
type Chat = User | Group;

const roles = ["All", "Waiters", "Chefs", "Managers"];

// Utility functions for chat data
const getChatName = (chat: Chat) => chat.name;
const getChatAvatar = (chat: Chat) => chat.avatar;
const getChatLastMessage = (
  chat: Chat,
  currentUserId: string,
  allMessages: Record<string, Message[]>
) => {
  if (chat.type === "group" && chat.lastMessage) {
    return chat.lastMessage;
  }

  // Get last message from Firebase messages
  const chatMsgs = allMessages[chat.id] || [];
  if (!chatMsgs.length) return null;

  const last = chatMsgs[chatMsgs.length - 1];
  return {
    text: last.text,
    time: new Date(last.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    senderId: last.senderId,
    unread: !last.readBy.includes(currentUserId),
  };
};

// ChatTile component
const ChatTile = ({
  chat,
  selected,
  onClick,
  currentUserId,
  allMessages,
  unreadCount,
}: {
  chat: Chat;
  selected: boolean;
  onClick: () => void;
  currentUserId: string;
  allMessages: Record<string, Message[]>;
  unreadCount: number;
}) => {
  const { t } = useTranslation();
  const lastMsg = getChatLastMessage(chat, currentUserId, allMessages);

  return (
    <div
      className={`flex items-center gap-3 px-2 py-3 cursor-pointer rounded-lg transition-all ${
        selected ? "bg-[#F8EAEE]" : "hover:bg-[#F8EAEE]"
      }`}
      onClick={onClick}
    >
      <img
        src={getChatAvatar(chat) || "https://via.placeholder.com/48"}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base truncate text-[#2C2C2E]">
          {getChatName(chat) || t("chats.unknown")}
        </div>
        <div className="truncate text-sm font-normal text-[#666668]">
          {lastMsg?.text || t("chats.noMessagesYet")}
        </div>
      </div>
      <div className="flex flex-col items-end min-w-[40px]">
        {unreadCount > 0 && (
          <div className="mt-1 bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </div>
        )}
        <div className="text-xs text-[#BDBDBD] font-semibold">
          {lastMsg?.time || ""}
        </div>
      </div>
    </div>
  );
};

// MessageBubble component
const MessageBubble = ({
  message,
  isSelf,
}: {
  message: Message;
  isSelf: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className={`flex ${isSelf ? "justify-end" : "justify-start"} mb-2`}>
      {!isSelf && message.senderAvatar && (
        <img
          src={message.senderAvatar}
          alt={message.senderName || t("chats.user")}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div
        className={`max-w-[60%] ${
          isSelf
            ? "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white"
            : "bg-[#F8EAEE] text-black"
        } px-4 py-2 rounded-xl relative`}
      >
        {!isSelf && message.senderName && (
          <div className="text-xs font-bold mb-1 text-[#6A1B9A]">
            {message.senderName}
          </div>
        )}
        <div className="text-base break-words">{message.text}</div>
        <div
          className={`text-xs mt-1 flex justify-end items-center gap-1 ${
            isSelf ? "text-white/80" : "text-[#BDBDBD]"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          <span>✓✓</span>
        </div>
      </div>
    </div>
  );
};

// 1. Add a mobile detection hook (SSR-safe)
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
}

// 3. Update ChatWindow to accept isMobile and onBack, and add a back button for mobile
const ChatWindow = ({
  chat,
  messages,
  currentUser,
  isMobile,
  onBack,
  leftPanelRef,
  onSendMessage,
}: {
  chat: Chat;
  messages: Message[];
  currentUser: User;
  isMobile?: boolean;
  onBack?: () => void;
  leftPanelRef: React.RefObject<HTMLDivElement>;
  onSendMessage: (text: string, files?: File[]) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const chatObj = chat; // Use chat directly since it's already the chat object
  const chatMsgs = messages; // Messages are already filtered
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (message.trim() && !uploading) {
      setUploading(true);
      try {
        await onSendMessage(message);
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && !uploading) {
      setUploading(true);
      try {
        const filesArray = Array.from(files);
        await onSendMessage(message || "", filesArray);
        setMessage("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Failed to upload files:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  // Modal state for group members
  const [showMembers, setShowMembers] = React.useState<boolean>(false);
  const membersButtonRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>(
    {}
  );

  // Position popover absolutely within left panel, left-aligned to avatars button
  useEffect(() => {
    if (showMembers && membersButtonRef.current && leftPanelRef.current) {
      const btnRect = membersButtonRef.current.getBoundingClientRect();
      const panelRect = leftPanelRef.current.getBoundingClientRect();
      setPopoverStyle({
        position: "absolute",
        top: btnRect.bottom - panelRect.top + 8,
        left: btnRect.left - panelRect.left,
        zIndex: 50,
        width: 260,
        maxHeight: 400,
        overflowY: "scroll",
      });
    }
  }, [showMembers]);

  // Click outside to close
  useEffect(() => {
    if (!showMembers) return;
    function handleClick(e: MouseEvent) {
      if (
        membersButtonRef.current &&
        popoverRef.current &&
        !membersButtonRef.current.contains(e.target as Node) &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowMembers(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMembers]);

  // Helper for group member avatars (simplified - showing count only)
  const renderGroupAvatars = (group: Group) => (
    <button
      ref={membersButtonRef}
      className="flex items-center gap-2 relative z-10 focus:outline-none"
      onClick={() => setShowMembers(true)}
      title={t("chats.viewMembers")}
      type="button"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow">
        {group.memberIds.length}
      </div>
      <span className="text-xs text-[#666668]">{t("chats.members")}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden flex-1 min-h-0">
      {/* Header */}
      {chatObj && (
        <div className="flex items-center px-4 md:px-8 py-4 md:py-5 border-b border-[#E5E5EA] bg-white relative">
          {/* Mobile back button */}
          {isMobile && onBack && (
            <button
              className="mr-3 flex-shrink-0 md:hidden"
              onClick={onBack}
              aria-label="Back to chat list"
              type="button"
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="#6A1B9A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          {chat.type === "group" ? (
            <>
              {renderGroupAvatars(chatObj as Group)}
              <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                <div className="flex items-center gap-2">
                  <img
                    src={chatObj.avatar}
                    alt="group logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-bold text-lg text-[#2C2C2E] truncate">
                    {chatObj.name}
                  </span>
                </div>
                <div className="text-xs text-[#BDBDBD] mt-1">
                  {t("chats.lastSeen", { time: "45 minutes ago" })}
                </div>
              </div>
            </>
          ) : (
            <>
              <img
                src={chatObj.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                <span className="font-bold text-lg text-[#2C2C2E] truncate">
                  {chatObj.name}
                </span>
                <span className="text-xs text-[#BDBDBD] mt-1">
                  {t("chats.lastSeen", { time: "45 minutes ago" })}
                </span>
              </div>
            </>
          )}
        </div>
      )}
      {/* Team Members Modal */}
      {chat.type === "group" && showMembers && chatObj ? (
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="bg-white shadow-xl p-4 border border-[#E5E5EA] animate-fade-in relative rounded w-[260px]"
        >
          {/* Arrow aligned to avatars button */}
          <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-[#E5E5EA] rotate-45 z-10"></div>
          <div
            className="font-medium text-sm mb-3 rounded-xl border-0 px-2 py-1 text-[#666668]"
            style={{ boxShadow: "0px -3px 0px 0px #E5E5EA inset" }}
          >
            {t("chats.teamMembers")}
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
            {(chatObj as Group).memberIds.map((id) => (
              <div
                key={id}
                className="flex items-center gap-3 justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {id.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-base">
                      {t("chats.userWithId", { id })}
                    </div>
                    <div className="text-xs text-[#BDBDBD]">
                      {t("chats.teamMemberRole")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {/* Date */}
      <div className="text-center text-xs text-[#BDBDBD] py-2 bg-white">
        8/20/2020
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 bg-white min-h-0">
        {uploading && (
          <div className="text-center text-[#6A1B9A] py-2">
            <span className="inline-block animate-pulse">Uploading...</span>
          </div>
        )}
        {chatMsgs.length === 0 ? (
          <div className="text-center text-[#222] mt-20">
            {t("chats.noMessagesYet")}
          </div>
        ) : (
          chatMsgs.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSelf={msg.senderId === currentUser.id}
            />
          ))
        )}
      </div>
      {/* Input */}
      <div
        className="border-t border-[#E5E5EA] px-4 md:px-6 py-4 flex items-center gap-3 bg-white"
        style={{ boxShadow: "0px -2px 8px 0px #E5E5EA1A" }}
      >
        <button
          className="text-2xl text-[#6A1B9A] flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F8EAEE] transition"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <img src={cameraIcon} alt="upload" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          multiple
          accept="image/*,video/*"
        />
        <input
          type="text"
          className="flex-1 border-none outline-none text-base text-[#666668] placeholder:text-[#BDBDBD]"
          placeholder={t("chats.startTyping")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="text-2xl text-[#6A1B9A] flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F8EAEE] transition"
          type="button"
        >
          <img src={mentionIcon} alt="@" className="w-6 h-6" />
        </button>
        <button
          className="text-2xl text-[#6A1B9A] flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F8EAEE] transition disabled:opacity-50"
          onClick={handleSendMessage}
          disabled={uploading || !message.trim()}
          type="button"
        >
          <img src={sendIcon} alt={t("chats.send")} className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// 2. Update TeamChats component
const TeamChats: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // TODO: Replace with actual logged-in user from auth context
  const currentUser: User = {
    id: "current-user-id",
    name: "Current User",
    role: "Employee",
    avatar: "https://via.placeholder.com/48",
    lastSeen: new Date().toISOString(),
    type: "individual",
  };

  const isMobile = useIsMobile();
  const leftPanelRef = React.useRef<HTMLDivElement>(null!);
  const {
    isActive,
    steps,
    currentStep,
    next,
    completed,
    activeTraining,
    completedTrainings,
    startTraining,
  } = useWalkthroughStore();
  const navigate = useNavigate();

  // Firebase integration
  const {
    chats: firebaseChats,
    messages: firebaseMessages,
    loading: firebaseLoading,
    error: firebaseError,
    subscribeToChat,
    sendMessage: sendFirebaseMessage,
    markAsRead,
    // getUnreadCountForChat, // Available for future use
  } = useFirebaseChat(currentUser.id);

  // Convert all Firebase messages to local format
  const convertedAllMessages = useMemo(() => {
    const converted: Record<string, Message[]> = {};

    Object.keys(firebaseMessages).forEach((chatId) => {
      converted[chatId] = firebaseMessages[chatId]
        .filter((msg) => msg.timestamp) // Filter out messages with null timestamps
        .map((msg) => ({
          id: msg.id,
          chatId: msg.chatId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderAvatar: msg.senderAvatar,
          text: msg.text,
          timestamp:
            msg.timestamp?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          readBy: msg.readBy,
        })) as Message[];
    });

    return converted;
  }, [firebaseMessages]);

  // Convert Firebase messages to local format for selected chat
  const convertedMessages = useMemo(() => {
    if (!selectedChat || !convertedAllMessages[selectedChat.id]) {
      return [];
    }

    return convertedAllMessages[selectedChat.id];
  }, [selectedChat, convertedAllMessages]);

  // Subscribe to selected chat messages
  useEffect(() => {
    if (selectedChat) {
      const unsubscribe = subscribeToChat(selectedChat.id);
      markAsRead(selectedChat.id);
      return () => unsubscribe();
    }
  }, [selectedChat, subscribeToChat, markAsRead]);

  // Use Firebase chats directly
  const allChats = useMemo(() => {
    return firebaseChats.map((fc) => {
      if (fc.type === "group") {
        return {
          id: fc.id,
          name: fc.name || t("chats.unnamedGroup"),
          avatar: fc.avatar || "https://via.placeholder.com/48",
          memberIds: fc.memberIds,
          type: "group" as const,
          lastMessage:
            fc.lastMessage && fc.lastMessage.timestamp
              ? {
                  text: fc.lastMessage.text,
                  time: fc.lastMessage.timestamp?.toDate?.()
                    ? new Date(
                        fc.lastMessage.timestamp.toDate()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Now",
                  senderId: fc.lastMessage.senderId,
                  unread: !firebaseMessages[fc.id]?.every((msg) =>
                    msg.readBy.includes(currentUser.id)
                  ),
                }
              : undefined,
        } as Group;
      } else {
        // For individual chats
        const otherUserId = fc.memberIds.find((id) => id !== currentUser.id);
        return {
          id: fc.id,
          name: fc.name || t("chats.userWithId", { id: otherUserId }),
          role: "Team Member",
          avatar: fc.avatar || "https://via.placeholder.com/48",
          lastSeen: new Date().toISOString(),
          type: "individual" as const,
        } as User;
      }
    });
  }, [firebaseChats, firebaseMessages, currentUser.id]);

  // Filter chats by tab and search
  const chatList = useMemo(() => {
    let chats = allChats;

    // Filter by role/tab
    if (activeTab !== "All") {
      // For now, don't filter by role since we don't have role data from Firebase
      // This can be enhanced when user data is properly integrated
      // chats = chats (keeping all chats for now)
    }

    // Filter by search
    if (search) {
      chats = chats.filter((c) => {
        const chatName = getChatName(c);
        const searchLower = search.toLowerCase();
        return chatName && chatName.toLowerCase().includes(searchLower);
      });
    }

    return chats;
  }, [activeTab, search, allChats]);

  // Calculate unread counts for each chat
  const unreadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(firebaseMessages).forEach(([chatId, messages]) => {
      counts[chatId] = messages.filter(
        (msg) =>
          msg.senderId !== currentUser.id &&
          !msg.readBy.includes(currentUser.id)
      ).length;
    });
    return counts;
  }, [firebaseMessages, currentUser.id]);

  // When tab changes, clear selected chat
  const handleTabClick = (role: string) => {
    setActiveTab(role);
    setSelectedChat(null);
  };

  // Start settings training after teamchat training completes
  React.useEffect(() => {
    if (
      completed &&
      activeTraining === "teamchat" &&
      !completedTrainings.settings
    ) {
      startTraining("settings", settingsTrainingSteps);
      navigate("/");
    }
  }, [completed, activeTraining, completedTrainings, startTraining, navigate]);

  return (
    <div className="p-0 md:p-6 flex flex-col h-screen overflow-hidden relative">
      {/* Firebase Debug Component (Development Only) */}
      {import.meta.env.DEV && <FirebaseDebug currentUserId={currentUser.id} />}

      {/* Desktop Title */}
      <div className="text-3xl font-bold mb-4 md:mb-6 px-4 md:px-0 hidden md:block">
        {t("chats.title")}
      </div>
      {/* Mobile Title with Icon */}
      <div className="flex items-center gap-3 px-4 py-4 md:hidden">
        <img
          src={customerServiceIcon}
          alt={t("chats.teamTitle")}
          className="w-7 h-7"
        />
        <span className="text-xl font-bold text-[#2C2C2E]">
          {t("chats.teamTitle")}
        </span>
      </div>
      <div className="bg-white lg:shadow-2xl sm:shadow px-0 md:px-6 flex flex-1 min-h-0 rounded-2xl overflow-hidden relative team-chat-full-panel">
        {/* Left: Chat List */}
        <div
          ref={leftPanelRef}
          className={
            `w-full md:w-[420px] border-r-0 md:border-r-2 border-[#E5E5EA] pr-0 md:pr-4 flex flex-col min-h-0 relative team-chat-left-panel` +
            (isMobile && selectedChat ? " hidden" : "")
          }
        >
          {/* Search */}
          <div className="my-4 px-4 md:px-0">
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg bg-[#FAFAFA] pl-10 pr-6 py-3 text-sm text-[#666668] placeholder:text-[#666668] focus:outline-none"
                placeholder={t("chats.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ boxShadow: "0px -3px 0px 0px #E5E5EA inset" }}
              />
              <img
                src={searchIcon}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BDBDBD] text-lg"
              />
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 mb-4 px-4 md:px-0">
            {roles.map((role) => (
              <button
                key={role}
                className={`px-4 py-1 rounded-full font-medium text-base transition-all ${
                  activeTab === role
                    ? "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white"
                    : "bg-[#F8EAEE]  hover:bg-[#F8EAEE]"
                }`}
                onClick={() => handleTabClick(role)}
                type="button"
              >
                {(() => {
                  const key = role.toLowerCase();
                  return t(`chats.roles.${key}`);
                })()}
              </button>
            ))}
          </div>
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto min-h-0 h-full flex flex-col px-2 md:px-0">
            {firebaseLoading ? (
              <div className="text-center text-[#666668] mt-10">
                <p className="text-lg font-semibold mb-2">
                  {t("chats.loadingChats")}
                </p>
              </div>
            ) : firebaseError ? (
              <div className="text-center text-red-500 mt-10">
                <p className="text-lg font-semibold mb-2">
                  {t("chats.errorLoadingChats")}
                </p>
                <p className="text-sm">{firebaseError}</p>
              </div>
            ) : chatList.length === 0 ? (
              <div className="text-center text-[#666668] mt-10">
                <p className="text-lg font-semibold mb-2">
                  {t("chats.noChatsYet")}
                </p>
                <p className="text-sm">
                  {firebaseChats.length === 0
                    ? t("chats.noChatsFound")
                    : t("chats.noChatsMatchSearch")}
                </p>
              </div>
            ) : (
              chatList.map((chat) => (
                <ChatTile
                  key={chat.id}
                  chat={chat}
                  selected={!!selectedChat && selectedChat.id === chat.id}
                  currentUserId={currentUser.id}
                  allMessages={convertedAllMessages}
                  unreadCount={unreadCounts[chat.id] || 0}
                  onClick={() => {
                    setSelectedChat(chat);
                    // Advance walkthrough if on the left panel step
                    const step = steps[currentStep];
                    if (
                      isActive &&
                      step &&
                      step.selector === ".team-chat-left-panel"
                    ) {
                      next();
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
        {/* Right: Chat Window */}
        <div
          className={`flex-1 flex flex-col min-h-0 w-full${
            isMobile && !selectedChat ? " hidden" : ""
          }`}
        >
          {!selectedChat ? (
            <div className="flex items-center justify-center h-full text-center text-lg text-[#2C2C2E] bg-transparent">
              <div>
                {t("chats.empty.title")}
                <br />
                {t("chats.empty.subtitle")}
              </div>
            </div>
          ) : (
            <ChatWindow
              chat={selectedChat}
              messages={convertedMessages}
              currentUser={currentUser}
              isMobile={isMobile}
              onBack={() => setSelectedChat(null)}
              leftPanelRef={leftPanelRef}
              onSendMessage={async (text: string, files?: File[]) => {
                await sendFirebaseMessage(
                  selectedChat.id,
                  text,
                  currentUser.name,
                  currentUser.avatar,
                  files
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamChats;
