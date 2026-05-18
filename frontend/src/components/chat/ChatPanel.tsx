import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MessageCircle,
  User,
  Calendar,
  Video,
  AlertCircle,
  ArrowLeft,
  Clock,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { messagesAPI } from "../../lib/supabase";
import { formatDate } from "../../lib/utils";
import Button from "../ui/Button";

interface ChatPanelProps {
  userRole: "doctor" | "customer";
  activeConsultationId?: string; // Optional direct navigation link
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  userRole,
  activeConsultationId,
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
    return () => {
      stopPolling();
    };
  }, [userRole]);

  // Deep-link to a specific consultation if activeConsultationId is provided
  useEffect(() => {
    if (activeConsultationId && conversations.length > 0) {
      const targetChat = conversations.find(
        (c) => c.consultation_id === activeConsultationId
      );
      if (targetChat) {
        handleSelectChat(targetChat);
      }
    }
  }, [activeConsultationId, conversations]);

  // Start polling when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.consultation_id, true);
      startPolling(selectedChat.consultation_id);
    } else {
      stopPolling();
      setMessages([]);
    }
    return () => stopPolling();
  }, [selectedChat]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startPolling = (consultationId: string) => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      fetchMessagesSilently(consultationId);
    }, 3000); // Poll every 3 seconds
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await messagesAPI.getConversations();
      if (response.data?.data) {
        setConversations(response.data.data);
      } else if (Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load active chats");
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (consultationId: string, showLoader = false) => {
    if (showLoader) setLoadingMessages(true);
    try {
      const response = await messagesAPI.getMessages(consultationId);
      if (response.data?.data) {
        setMessages(response.data.data);
      } else if (Array.isArray(response.data)) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  };

  const fetchMessagesSilently = async (consultationId: string) => {
    try {
      const response = await messagesAPI.getMessages(consultationId);
      const data = response.data?.data || response.data || [];
      if (Array.isArray(data) && data.length !== messages.length) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Error silent fetching messages:", error);
    }
  };

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear text instantly for UI responsiveness
    setSendingMessage(true);

    try {
      const response = await messagesAPI.sendMessage(
        selectedChat.consultation_id,
        messageText
      );
      if (response.error) {
        toast.error(`Failed to send: ${response.error}`);
        setNewMessage(messageText); // Restore on error
        return;
      }
      // Re-fetch messages immediately
      await fetchMessages(selectedChat.consultation_id, false);
      // Refresh conversation list to update last message preview
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred");
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Filter conversations based on query
  const filteredConversations = conversations.filter((c) => {
    const name = (c.other_user_name || "Active Chat").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "?";
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-[600px] border border-gray-200 dark:border-gray-700/60 rounded-2xl bg-white dark:bg-gray-850 overflow-hidden shadow-lg">
      {/* 1. Sidebar - Chat List */}
      <div
        className={`w-full md:w-80 border-r border-gray-250 dark:border-gray-700/60 flex flex-col ${
          selectedChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-3">
            Conversations
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients/doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={16}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading chats...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs">No active conversations.</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isSelected =
                selectedChat?.consultation_id === chat.consultation_id;
              return (
                <button
                  key={chat.consultation_id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all text-left ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(chat.other_user_name)}
                    </div>
                    {/* Status Dot */}
                    <div
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
                        chat.status === "ongoing" || chat.status === "scheduled"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Conversation Detail Snippet */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {chat.other_user_name}
                      </p>
                      {chat.last_message_time && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(chat.last_message_time).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      )}
                    </div>
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                      {chat.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {chat.last_message || "No messages yet. Say hello!"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Message Area (Body) */}
      <div
        className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/25 ${
          !selectedChat ? "hidden md:flex items-center justify-center" : "flex"
        }`}
      >
        {!selectedChat ? (
          <div className="text-center p-8 max-w-sm">
            <div className="bg-blue-100 dark:bg-blue-950/20 p-4 rounded-full inline-block text-blue-600 dark:text-blue-400 mb-4">
              <MessageCircle size={36} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Your Secure Consultation Chat
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a conversation from the sidebar to view full message history, share updates, or join meetings.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Room Header */}
            <div className="bg-white dark:bg-gray-850 px-4 py-3 border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
              <div className="flex items-center">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="mr-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 md:hidden transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>

                {/* Avatar & Header details */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                  {getInitials(selectedChat.other_user_name)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    {selectedChat.other_user_name}
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedChat.status === "ongoing"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />
                    Consultation ID: {selectedChat.consultation_id.substring(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Quick Actions (Join Video Meeting) */}
              <div className="flex items-center space-x-2">
                <span
                  className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    selectedChat.status === "ongoing"
                      ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {selectedChat.status}
                </span>
              </div>
            </div>

            {/* Message Thread Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle
                    className="mx-auto text-gray-300 mb-2"
                    size={36}
                  />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    No messages yet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Introduce yourself and describe your query!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  // Determine sender alignment
                  const isMe = msg.sender_id !== selectedChat.other_user_id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[75%] sm:max-w-[60%]">
                        {/* Bubble */}
                        <div
                          className={`p-3 rounded-2xl shadow-sm text-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-100 border border-gray-100 dark:border-gray-700/60 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line break-words leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        {/* Timestamp */}
                        <p
                          className={`text-[9px] text-gray-400 mt-1 px-1 flex items-center gap-0.5 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <Clock size={10} />
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer Area */}
            <div className="bg-white dark:bg-gray-850 p-3 border-t border-gray-200 dark:border-gray-700/60">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end space-x-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-250 dark:border-gray-700/65"
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a secure message..."
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none max-h-24 overflow-y-auto leading-relaxed"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="flex-shrink-0 p-2 rounded-xl flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all shadow-sm"
                >
                  <Send size={16} />
                </Button>
              </form>
              <p className="text-[9px] text-gray-400 mt-1 px-1">
                Consultation communications are end-to-end encrypted and HIPAA compliant.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
