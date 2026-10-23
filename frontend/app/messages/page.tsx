"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import { Interactive3DCard } from "@/components/ui/Interactive3DCard";
import {
  MessageCircle,
  Send,
  Search,
  User as UserIcon,
  Check,
  CheckCheck,
  ArrowLeft,
  Heart,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Participant = {
  id: number;
  fullName: string;
  email?: string;
  profilePhoto?: string | null;
  city?: string | null;
  state?: string | null;
  occupation?: string | null;
};

type LastMessage = {
  id: number;
  senderUserId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type Conversation = {
  id: number;
  participant: Participant;
  lastMessage: LastMessage | null;
  unreadCount: number;
  updatedAt: string;
};

type Message = {
  id: number;
  conversationId: number;
  senderUserId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserIdParam = searchParams.get("userId");
  const targetConvIdParam = searchParams.get("conversationId");

  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    targetConvIdParam ? Number(targetConvIdParam) : null
  );
  const [directParticipant, setDirectParticipant] = useState<Participant | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll management refs
  const isInitialLoadRef = useRef<boolean>(true);
  const userJustSentRef = useRef<boolean>(false);
  const prevMessagesLengthRef = useRef<number>(0);
  const prevActiveConvIdRef = useRef<number | null>(null);

  const selectedConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const activeParticipant =
    selectedConversation?.participant || directParticipant || null;

  useEffect(() => {
    const storedToken = localStorage.getItem("connectsoulmate_token");
    const storedUser = localStorage.getItem("connectsoulmate_user");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          setCurrentUserId(Number(parsed.id));
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    async function verifyUser() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.ok) {
          localStorage.removeItem("connectsoulmate_token");
          localStorage.removeItem("connectsoulmate_user");
          router.replace("/login");
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUserId(Number(data.user.id));
        }
      } catch (err) {
        console.error("Verify user error", err);
      }
    }

    verifyUser();
  }, [router]);

  const fetchConversations = useCallback(
    async (quiet = false) => {
      if (!token) return;

      if (!quiet) setLoadingConversations(true);

      try {
        const res = await fetch(`${API_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error("Failed to load conversations");
        }

        const data = await res.json();
        if (data.success) {
          setConversations(data.conversations || []);
        }
      } catch (err: any) {
        if (!quiet) setError(err.message || "Failed to load conversations");
      } finally {
        if (!quiet) setLoadingConversations(false);
      }
    },
    [token, router]
  );

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token, fetchConversations]);

  useEffect(() => {
    if (!token || !targetUserIdParam) return;

    const targetId = Number(targetUserIdParam);
    if (!Number.isInteger(targetId)) return;

    async function initDirectConversation() {
      try {
        const res = await fetch(`${API_URL}/api/messages/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipientUserId: targetId }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setActiveConversationId(data.conversationId);
          if (data.participant) {
            setDirectParticipant(data.participant);
          }
          fetchConversations(true);
        } else {
          setError(data.message || "Could not open conversation");
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize conversation");
      }
    }

    initDirectConversation();
  }, [token, targetUserIdParam, fetchConversations]);

  const fetchMessages = useCallback(
    async (convId: number, quiet = false) => {
      if (!token) return;

      if (!quiet) setLoadingMessages(true);

      try {
        const res = await fetch(
          `${API_URL}/api/messages/conversations/${convId}?limit=30`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);
          setHasMore(Boolean(data.hasMore));

          setConversations((prev) => {
            const target = prev.find((c) => c.id === convId);
            if (target && target.unreadCount > 0) {
              return prev.map((c) =>
                c.id === convId ? { ...c, unreadCount: 0 } : c
              );
            }
            return prev;
          });
        }
      } catch (err: any) {
        if (!quiet) setError(err.message || "Failed to load messages");
      } finally {
        if (!quiet) setLoadingMessages(false);
      }
    },
    [token]
  );

  // Active conversation change handler for auto-scroll tracking
  useEffect(() => {
    if (activeConversationId) {
      if (activeConversationId !== prevActiveConvIdRef.current) {
        isInitialLoadRef.current = true;
        prevActiveConvIdRef.current = activeConversationId;
      }
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
      prevActiveConvIdRef.current = null;
    }
  }, [activeConversationId, fetchMessages]);

  // Smart Auto-Scroll Logic
  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    const container = messagesContainerRef.current;
    const isInitial = isInitialLoadRef.current;
    const userJustSent = userJustSentRef.current;

    // Calculate distance from bottom before scrolling
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 120;

    if (isInitial) {
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
    } else if (userJustSent) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      userJustSentRef.current = false;
    } else if (isNearBottom && messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Short polling
  useEffect(() => {
    if (!token) return;

    const convInterval = setInterval(() => {
      fetchConversations(true);
    }, 6000);

    let msgInterval: NodeJS.Timeout | null = null;
    if (activeConversationId) {
      msgInterval = setInterval(() => {
        fetchMessages(activeConversationId, true);
      }, 3000);
    }

    return () => {
      clearInterval(convInterval);
      if (msgInterval) clearInterval(msgInterval);
    };
  }, [token, activeConversationId, fetchConversations, fetchMessages]);

  const handleLoadMore = async () => {
    if (!token || !activeConversationId || messages.length === 0 || loadingMore) return;

    setLoadingMore(true);
    const oldestMessageId = messages[0].id;

    try {
      const res = await fetch(
        `${API_URL}/api/messages/conversations/${activeConversationId}?beforeId=${oldestMessageId}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        const olderMessages = data.messages || [];
        setMessages((prev) => [...olderMessages, ...prev]);
        setHasMore(Boolean(data.hasMore));
      }
    } catch (err) {
      console.error("Load more error", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeConversationId || !messageText.trim() || sending) return;

    const textToSend = messageText.trim();
    setMessageText("");
    setSending(true);
    setError(null);
    userJustSentRef.current = true;

    try {
      const res = await fetch(
        `${API_URL}/api/messages/conversations/${activeConversationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: textToSend }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [...prev, data.message]);
        fetchConversations(true);
      } else {
        userJustSentRef.current = false;
        setMessageText(textToSend);
        setError(data.message || "Failed to send message");
      }
    } catch (err: any) {
      userJustSentRef.current = false;
      setMessageText(textToSend);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    setActiveConversationId(null);
    setDirectParticipant(null);
    if (targetUserIdParam || targetConvIdParam) {
      router.replace("/messages");
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participant.fullName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-transparent text-[var(--text-primary)] flex flex-col overflow-hidden">
      <HeaderNav />

      {error && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-300 px-4 py-2 text-xs text-center flex items-center justify-between max-w-7xl mx-auto w-full shrink-0">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col">
        <div className="surface-card rounded-2xl flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 overflow-hidden shadow-xl border border-[var(--border)]">
          {/* LEFT SIDEBAR: Conversation List */}
          <div
            className={`md:col-span-4 border-r border-[var(--border)] flex flex-col min-h-0 h-full bg-[var(--surface-soft)]/50 ${
              activeConversationId ? "hidden md:flex" : "flex flex-1"
            }`}
          >
            <div className="p-3 sm:p-4 border-b border-[var(--border)] space-y-3 shrink-0">
              <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search matched members..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[var(--border)]">
              {loadingConversations ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] shrink-0"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-[var(--surface-soft)] rounded w-1/2"></div>
                        <div className="h-2.5 bg-[var(--surface-soft)] rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] space-y-3">
                  <MessageCircle className="h-10 w-10 mx-auto text-[var(--text-muted)]" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">No conversations yet</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Connect with mutually accepted members to start chatting.
                  </p>
                  <Link
                    href="/interests"
                    className="inline-block text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                  >
                    View Accepted Interests →
                  </Link>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  const initial = conv.participant.fullName.charAt(0).toUpperCase();

                  return (
                    <Interactive3DCard key={conv.id} className="rounded-none border-b border-[var(--border)] overflow-hidden">
                      <button
                        onClick={() => setActiveConversationId(conv.id)}
                        className={`w-full text-left p-3.5 flex items-center space-x-3 transition hover:bg-[var(--surface-hover)] ${
                          isActive ? "bg-[var(--surface-soft)] border-l-3 border-[var(--brand-primary)]" : ""
                        }`}
                      >
                        <div className="relative shrink-0">
                          {conv.participant.profilePhoto ? (
                            <img
                              src={`${API_URL}${conv.participant.profilePhoto}`}
                              alt={conv.participant.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-purple)] flex items-center justify-center text-white font-bold text-sm">
                              {initial}
                            </div>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[var(--brand-primary)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">
                              {conv.participant.fullName}
                            </h3>
                            <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                              {conv.lastMessage
                                ? formatTimestamp(conv.lastMessage.createdAt)
                                : formatTimestamp(conv.updatedAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {conv.lastMessage ? conv.lastMessage.message : "Click to open conversation"}
                          </p>
                        </div>
                      </button>
                    </Interactive3DCard>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT CHAT WINDOW */}
          <div
            className={`md:col-span-8 flex flex-col min-h-0 h-full bg-[var(--surface)] ${
              activeConversationId ? "flex flex-1" : "hidden md:flex"
            }`}
          >
            {activeConversationId ? (
              <>
                {/* Active Partner Header */}
                <div className="p-3 sm:p-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-soft)] shrink-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="md:hidden flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-primary)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1.5 rounded-lg transition shrink-0"
                      aria-label="Back to conversation list"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>

                    {activeParticipant ? (
                      <>
                        {activeParticipant.profilePhoto ? (
                          <img
                            src={`${API_URL}${activeParticipant.profilePhoto}`}
                            alt={activeParticipant.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-[var(--border)] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-purple)] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {activeParticipant.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                            <span className="truncate">{activeParticipant.fullName}</span>
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 rounded-full font-semibold shrink-0">
                              Matched Connection
                            </span>
                          </h3>
                          <p className="text-[10px] text-[var(--text-muted)] truncate">
                            {[activeParticipant.city, activeParticipant.occupation]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-[var(--text-muted)] animate-pulse">
                        Loading conversation details...
                      </div>
                    )}
                  </div>

                  {activeParticipant && (
                    <Link
                      href={`/profile/${activeParticipant.id}`}
                      className="btn-secondary text-[11px] px-3 py-1.5 shrink-0 ml-2"
                    >
                      View Profile
                    </Link>
                  )}
                </div>

                {/* Message History Window */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[var(--surface-soft)]/20"
                >
                  {hasMore && (
                    <div className="text-center my-2">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="btn-secondary text-[11px] px-3 py-1 rounded-full disabled:opacity-50"
                      >
                        {loadingMore ? "Loading..." : "Load earlier messages"}
                      </button>
                    </div>
                  )}

                  {loadingMessages ? (
                    <div className="space-y-3 py-8">
                      <div className="flex justify-start">
                        <div className="w-48 h-9 bg-[var(--surface-soft)] rounded-xl animate-pulse"></div>
                      </div>
                      <div className="flex justify-end">
                        <div className="w-56 h-10 bg-[var(--brand-primary)]/20 rounded-xl animate-pulse"></div>
                      </div>
                    </div>
                  ) : !activeParticipant ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)] space-y-2">
                      <p className="text-xs text-[var(--text-muted)] animate-pulse">Loading message history...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)] space-y-2">
                      <Heart className="h-10 w-10 text-[var(--brand-primary)]" />
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        Start your conversation with {activeParticipant.fullName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                        You are mutually matched. Begin with a polite and respectful greeting.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderUserId === currentUserId;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                              isMe
                                ? "bg-[var(--brand-primary)] text-white rounded-br-none"
                                : "bg-[var(--surface-soft)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border)]"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed break-words">
                              {msg.message}
                            </p>
                            <div
                              className={`flex items-center justify-end space-x-1 mt-1 text-[9px] ${
                                isMe ? "text-white/80" : "text-[var(--text-muted)]"
                              }`}
                            >
                              <span>{formatTimestamp(msg.createdAt)}</span>
                              {isMe && (
                                <span>
                                  {msg.isRead ? <CheckCheck className="h-3 w-3 inline" /> : <Check className="h-3 w-3 inline" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 sm:p-3 bg-[var(--surface-soft)] border-t border-[var(--border)] flex items-center space-x-2 shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Type a respectful message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    maxLength={2000}
                    disabled={!activeParticipant}
                    className="flex-1 px-3.5 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--brand-primary)] disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sending || !activeParticipant}
                    className="btn-primary text-xs px-4 py-2 rounded-xl disabled:opacity-50 shrink-0 flex items-center space-x-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{sending ? "..." : "Send"}</span>
                  </button>
                </form>
              </>
            ) : (
              /* Empty state when no active chat */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[var(--text-muted)] space-y-3">
                <MessageCircle className="h-12 w-12 text-[var(--text-muted)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Your Matrimonial Messages</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                  Select a conversation from the left sidebar or connect with accepted matches to start chatting.
                </p>
                <Link
                  href="/interests"
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Manage Interests & Matches →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
          <p className="text-xs text-[var(--text-muted)] animate-pulse">Loading messages...</p>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
