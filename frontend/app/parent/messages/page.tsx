"use client";

import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HeaderNav from "@/components/layout/HeaderNav";
import { resolveProfileImageUrl } from "@/lib/formatPreferences";
import {
  MessageCircle,
  Send,
  Search,
  Users,
  Check,
  CheckCheck,
  ArrowLeft,
  Heart,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Participant = {
  id: number;
  fullName: string;
  role?: string;
  managedBy?: string;
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

function ParentMessagesContent() {
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
      router.replace("/login?mode=parent");
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
          router.replace("/login?mode=parent");
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
            router.replace("/login?mode=parent");
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
          setError(data.message || "Could not open conversation. Ensure interest is mutually accepted.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize family conversation");
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

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    const container = messagesContainerRef.current;
    const isInitial = isInitialLoadRef.current;
    const userJustSent = userJustSentRef.current;

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
      router.replace("/parent/messages");
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
    <div className="min-h-screen bg-transparent text-[var(--text-primary)]">
      <HeaderNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner */}
        <div className="surface-card p-4 sm:p-6 mb-6 border border-[var(--border)] relative overflow-hidden bg-gradient-to-r from-[var(--surface-soft)] via-[var(--surface)] to-[var(--surface-soft)] shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 text-xs font-semibold text-purple-400 mb-1">
                <Users className="h-3 w-3" />
                <span>Family Messaging Hub</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Family-to-Family Conversations
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Messaging is unlocked between mutually accepted matches. Communicate respectfully and schedule comfortable family meetings.
              </p>
            </div>
            <Link href="/parent/interests?tab=connections" className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Connected Families</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="surface-card border border-rose-500/30 p-3 mb-4 text-xs text-rose-400 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          {/* LEFT COLUMN: CONVERSATION LIST */}
          <div
            className={`lg:col-span-4 surface-card border border-[var(--border)] rounded-2xl flex flex-col h-full overflow-hidden ${
              activeConversationId !== null ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Search Header */}
            <div className="p-3.5 border-b border-[var(--border)] space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search family conversations..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
              {loadingConversations ? (
                <div className="p-8 text-center space-y-2">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--brand-primary)] border-r-transparent" />
                  <p className="text-xs text-[var(--text-secondary)]">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <Users className="h-8 w-8 text-[var(--text-muted)] mx-auto" />
                  <p className="text-xs text-[var(--text-secondary)]">
                    No family conversations active yet. Accept or send family interests to start conversations.
                  </p>
                  <Link href="/parent/search" className="btn-primary text-xs px-3.5 py-1.5 inline-flex">
                    Find Matches
                  </Link>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                        isActive
                          ? "bg-[var(--brand-primary)]/10"
                          : "hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      <div className="relative h-11 w-11 rounded-full overflow-hidden bg-[var(--surface-soft)] border border-[var(--border)] shrink-0">
                        {resolveProfileImageUrl(conv.participant.profilePhoto) ? (
                          <img
                            src={resolveProfileImageUrl(conv.participant.profilePhoto)!}
                            alt={conv.participant.fullName}
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)]">
                            <Users className="h-5 w-5" />
                          </div>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-[var(--brand-primary)] border-2 border-[var(--surface)]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate">
                            {conv.participant.fullName}
                          </h4>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                              {formatTimestamp(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-black/60 text-white font-medium px-1.5 py-0.2 rounded shrink-0">
                            {conv.participant.managedBy || "Family"}
                          </span>
                          <p className="text-[11px] text-[var(--text-muted)] truncate flex-1">
                            {conv.lastMessage?.message || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE THREAD */}
          <div
            className={`lg:col-span-8 surface-card border border-[var(--border)] rounded-2xl flex flex-col h-full overflow-hidden ${
              activeConversationId === null ? "hidden lg:flex items-center justify-center" : "flex"
            }`}
          >
            {activeConversationId === null ? (
              <div className="text-center space-y-3 p-8">
                <MessageCircle className="h-12 w-12 text-[var(--text-muted)] mx-auto" />
                <h3 className="font-serif text-lg font-bold">Select a Family Conversation</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Pick a conversation from the left to read messages or start discussing marriage prospects.
                </p>
              </div>
            ) : (
              <>
                {/* Active Header */}
                <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-soft)]/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBackToList}
                      className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--text-secondary)]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="h-10 w-10 rounded-full overflow-hidden bg-[var(--surface-soft)] border border-[var(--border)] shrink-0">
                      {resolveProfileImageUrl(activeParticipant?.profilePhoto) ? (
                        <img
                          src={resolveProfileImageUrl(activeParticipant?.profilePhoto)!}
                          alt={activeParticipant?.fullName || "User"}
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[var(--text-muted)]">
                          <Users className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                          {activeParticipant?.fullName || "Family Member"}
                        </h3>
                        <span className="text-[10px] bg-black/60 text-white font-semibold px-2 py-0.2 rounded-full">
                          {activeParticipant?.managedBy || "Family Mode"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {[activeParticipant?.occupation, activeParticipant?.city].filter(Boolean).join(" • ") || "Connected Family"}
                      </p>
                    </div>
                  </div>

                  {activeParticipant && (
                    <Link
                      href={`/parent/profile/${activeParticipant.id}`}
                      className="btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1"
                    >
                      <span>View Family Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {/* Family Safety Reminder Note */}
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[11px] text-amber-400 flex items-center justify-between">
                  <span>
                    🕊️ <strong className="font-semibold">Family Courtesy:</strong> Discuss cultural values, expectations, and arrange mutually convenient family meetings.
                  </span>
                </div>

                {/* Messages Body */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 p-4 overflow-y-auto space-y-3 bg-[var(--surface)]"
                >
                  {hasMore && (
                    <div className="text-center py-2">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="text-xs text-[var(--brand-primary)] hover:underline"
                      >
                        {loadingMore ? "Loading older messages..." : "Load Older Messages"}
                      </button>
                    </div>
                  )}

                  {loadingMessages ? (
                    <div className="py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--brand-primary)] border-r-transparent" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-16 text-center space-y-2 text-[var(--text-muted)]">
                      <Heart className="h-8 w-8 mx-auto text-[var(--brand-primary)]" />
                      <p className="text-xs">
                        Mutual interest is confirmed! Send a warm family greeting to start the conversation.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = currentUserId !== null && msg.senderUserId === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-[var(--brand-primary)] text-white rounded-br-none"
                                : "surface-panel border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                isMe ? "text-white/80" : "text-[var(--text-muted)]"
                              }`}
                            >
                              <span>{formatTimestamp(msg.createdAt)}</span>
                              {isMe && (
                                msg.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-white" />
                                ) : (
                                  <Check className="h-3 w-3 text-white/70" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compose Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-[var(--border)] bg-[var(--surface-soft)]/40 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type a respectful message to the family..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sending}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="btn-primary p-2.5 rounded-xl disabled:opacity-40 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ParentMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-[var(--brand-primary)] border-r-transparent" />
            <p className="text-xs text-[var(--text-secondary)]">Loading messages...</p>
          </div>
        </div>
      }
    >
      <ParentMessagesContent />
    </Suspense>
  );
}
