"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { ArrowLeft, MessageSquare } from "lucide-react";

type Message = {
  id: string;
  coach_id: string;
  student_id: string;
  sender_role: "coach" | "student";
  body: string;
  read_at: string | null;
  created_at: string;
};

type CoachInfo = {
  name: string;
  university: string | null;
};

type Conversation = {
  coachId: string;
  coachName: string;
  university: string | null;
  lastBody: string;
  lastCreatedAt: string;
};

type Props = {
  canReply: boolean;
};

const MAX_REPLY_LENGTH = 2000;

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function StudentMessages({ canReply }: Props) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [coachInfo, setCoachInfo] = useState<Record<string, CoachInfo>>({});
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoOpenedCoachRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let resolvedStudentId: string | null = null;

    if (profile?.role === "student") {
      const { data: studentRow } = await supabase
        .from("students")
        .select("id")
        .eq("profile_id", user.id)
        .single();
      resolvedStudentId = studentRow?.id ?? null;
    } else if (profile?.role === "parent") {
      const { data: parentRow } = await supabase
        .from("parents")
        .select("student_id")
        .eq("profile_id", user.id)
        .single();
      resolvedStudentId = parentRow?.student_id ?? null;
    }

    if (!resolvedStudentId) {
      setLoading(false);
      return;
    }

    setStudentId(resolvedStudentId);

    const { data: messageRows } = await supabase
      .from("messages")
      .select("id, coach_id, student_id, sender_role, body, read_at, created_at")
      .eq("student_id", resolvedStudentId)
      .order("created_at", { ascending: false });

    const msgs = (messageRows ?? []) as Message[];
    setMessages(msgs);

    const coachIds = Array.from(new Set(msgs.map((m) => m.coach_id)));

    if (coachIds.length > 0) {
      try {
        const res = await fetch("/api/coaches/public-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coachIds }),
        });

        const data = await res.json();
        const coaches = (data?.coaches ?? []) as { id: string; fullName: string; university: string | null }[];

        const infoMap: Record<string, CoachInfo> = {};
        for (const c of coaches) {
          infoMap[c.id] = {
            name: c.fullName ?? "College Coach",
            university: c.university,
          };
        }
        setCoachInfo(infoMap);
      } catch {
        setCoachInfo({});
      }
    } else {
      setCoachInfo({});
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const conversations = useMemo<Conversation[]>(() => {
    const seen = new Set<string>();
    const list: Conversation[] = [];

    for (const m of messages) {
      if (seen.has(m.coach_id)) continue;
      seen.add(m.coach_id);
      list.push({
        coachId: m.coach_id,
        coachName: coachInfo[m.coach_id]?.name ?? "College Coach",
        university: coachInfo[m.coach_id]?.university ?? null,
        lastBody: m.body,
        lastCreatedAt: m.created_at,
      });
    }

    return list;
  }, [messages, coachInfo]);

  useEffect(() => {
    const coachParam = searchParams.get("coach");
    if (!coachParam || autoOpenedCoachRef.current === coachParam) return;

    const match = conversations.find((c) => c.coachId === coachParam);
    if (match) {
      autoOpenedCoachRef.current = coachParam;
      setSelectedCoachId(coachParam);
    }
  }, [searchParams, conversations]);

  const threadMessages = useMemo(() => {
    if (!selectedCoachId) return [];
    return messages
      .filter((m) => m.coach_id === selectedCoachId)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, selectedCoachId]);

  useEffect(() => {
    if (loading || !selectedCoachId) return;

    let rafId2 = 0;
    const rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    });

    return () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
    };
  }, [threadMessages, selectedCoachId, loading]);

  async function handleReply() {
    const trimmed = replyText.trim();
    if (!trimmed || !selectedCoachId || sending) return;

    setSending(true);
    setReplyError("");

    try {
      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId: selectedCoachId, body: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReplyError(data?.error || "Failed to send message.");
        return;
      }

      setReplyText("");
      await fetchData();
    } catch {
      setReplyError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          Messages
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-center animate-pulse" style={{ color: "#64748b" }}>
            Loading conversations...
          </p>
        </div>
      </div>
    );
  }

  if (!studentId || conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          Messages
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <MessageSquare className="w-10 h-10" style={{ color: "#d1d5db" }} />
          <p className="text-sm text-center max-w-xs" style={{ color: "#64748b" }}>
            No messages yet. Coaches who are interested in you will reach out here.
          </p>
        </div>
      </div>
    );
  }

  if (selectedCoachId) {
    const activeConversation = conversations.find((c) => c.coachId === selectedCoachId);

    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col">
        <button
          type="button"
          onClick={() => {
            setSelectedCoachId(null);
            setReplyText("");
            setReplyError("");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-4 self-start transition-colors"
          style={{ color: "#64748b" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to conversations
        </button>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: "#d93025" }}
          >
            {getInitials(activeConversation?.coachName ?? null)}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate" style={{ color: "#0f172a" }}>
              {activeConversation?.coachName ?? "Conversation"}
            </h3>
            {activeConversation?.university && (
              <p className="text-xs truncate" style={{ color: "#64748b" }}>
                {activeConversation.university}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto px-1 py-2">
          {threadMessages.map((m) => {
            const isStudent = m.sender_role === "student";
            return (
              <div
                key={m.id}
                className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-2.5"
                  style={{
                    backgroundColor: isStudent ? "#fee2e2" : "#F2F3F3",
                    color: "#0f172a",
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="text-[10px] mt-1" style={{ color: "#64748b" }}>
                    {formatRelativeTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          {canReply ? (
            <>
              <textarea
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  setReplyError("");
                }}
                maxLength={MAX_REPLY_LENGTH}
                rows={3}
                placeholder="Write your message..."
                className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white resize-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                <span className="text-xs" style={{ color: "#64748b" }}>
                  {replyText.length} / {MAX_REPLY_LENGTH}
                </span>

                <button
                  type="button"
                  onClick={handleReply}
                  disabled={sending || replyText.trim().length === 0}
                  className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#d93025" }}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>

              {replyError && (
                <p className="text-sm mt-2" style={{ color: "#dc2626" }}>
                  {replyError}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm" style={{ color: "#64748b" }}>
              You are viewing as a parent. Only the student can reply.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
        Messages
      </h3>

      <div className="flex flex-col">
        {conversations.map((c) => (
          <button
            key={c.coachId}
            type="button"
            onClick={() => setSelectedCoachId(c.coachId)}
            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{ backgroundColor: "#d93025" }}
            >
              {getInitials(c.coachName)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm truncate" style={{ color: "#0f172a" }}>
                  {c.coachName}
                  {c.university && (
                    <span className="font-normal" style={{ color: "#64748b" }}> · {c.university}</span>
                  )}
                </span>
                <span className="text-[10px] shrink-0" style={{ color: "#64748b" }}>
                  {formatRelativeTime(c.lastCreatedAt)}
                </span>
              </div>
              <p className="text-xs truncate mt-0.5" style={{ color: "#64748b" }}>
                {truncate(c.lastBody, 60)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
