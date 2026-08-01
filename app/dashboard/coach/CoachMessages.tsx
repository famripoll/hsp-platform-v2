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

type StudentInfo = {
  id: string;
  full_name: string | null;
  photo_url: string | null;
};

type Conversation = {
  studentId: string;
  studentName: string;
  photoUrl: string | null;
  lastBody: string;
  lastCreatedAt: string;
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

export default function CoachMessages() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [studentPhotos, setStudentPhotos] = useState<Record<string, string>>({});
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoOpenedStudentRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: coachRow } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!coachRow) {
      setLoading(false);
      return;
    }

    setCoachId(coachRow.id);

    const { data: messageRows } = await supabase
      .from("messages")
      .select("id, coach_id, student_id, sender_role, body, read_at, created_at")
      .eq("coach_id", coachRow.id)
      .order("created_at", { ascending: false });

    const msgs = (messageRows ?? []) as Message[];
    setMessages(msgs);

    const studentIds = Array.from(new Set(msgs.map((m) => m.student_id)));

    if (studentIds.length > 0) {
      const { data: studentRows } = await supabase
        .from("students")
        .select("id, full_name, photo_url")
        .in("id", studentIds);

      const studentList = (studentRows ?? []) as StudentInfo[];

      const nameMap: Record<string, string> = {};
      for (const s of studentList) {
        nameMap[s.id] = s.full_name ?? "Unknown Student";
      }
      setStudentNames(nameMap);

      const photoEntries = await Promise.all(
        studentList
          .filter((s) => s.photo_url)
          .map(async (s) => {
            const path = s.photo_url!;
            if (path.startsWith("http")) return [s.id, path] as const;
            const { data: urlData } = await supabase.storage
              .from("profile-photos")
              .createSignedUrl(path, 3600);
            return [s.id, urlData?.signedUrl ?? ""] as const;
          })
      );

      const photoMap: Record<string, string> = {};
      for (const [id, url] of photoEntries) {
        if (url) photoMap[id] = url;
      }
      setStudentPhotos(photoMap);
    } else {
      setStudentNames({});
      setStudentPhotos({});
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
      if (seen.has(m.student_id)) continue;
      seen.add(m.student_id);
      list.push({
        studentId: m.student_id,
        studentName: studentNames[m.student_id] ?? "Unknown Student",
        photoUrl: studentPhotos[m.student_id] ?? null,
        lastBody: m.body,
        lastCreatedAt: m.created_at,
      });
    }

    return list;
  }, [messages, studentNames, studentPhotos]);

  useEffect(() => {
    const studentParam = searchParams.get("student");
    if (!studentParam || autoOpenedStudentRef.current === studentParam) return;

    const match = conversations.find((c) => c.studentId === studentParam);
    if (match) {
      autoOpenedStudentRef.current = studentParam;
      setSelectedStudentId(studentParam);
    }
  }, [searchParams, conversations]);

  const threadMessages = useMemo(() => {
    if (!selectedStudentId) return [];
    return messages
      .filter((m) => m.student_id === selectedStudentId)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, selectedStudentId]);

  useEffect(() => {
    if (loading || !selectedStudentId) return;

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
  }, [threadMessages, selectedStudentId, loading]);

  async function handleReply() {
    const trimmed = replyText.trim();
    if (!trimmed || !selectedStudentId || sending) return;

    setSending(true);
    setReplyError("");

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudentId, body: trimmed }),
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

  if (!coachId || conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          Messages
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <MessageSquare className="w-10 h-10" style={{ color: "#d1d5db" }} />
          <p className="text-sm text-center" style={{ color: "#64748b" }}>
            No conversations yet. Send a message from a student&apos;s profile to get started.
          </p>
        </div>
      </div>
    );
  }

  if (selectedStudentId) {
    const activeConversation = conversations.find((c) => c.studentId === selectedStudentId);

    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col">
        <button
          type="button"
          onClick={() => {
            setSelectedStudentId(null);
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
          {activeConversation?.photoUrl ? (
            <img
              src={activeConversation.photoUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: "#d93025" }}
            >
              {getInitials(activeConversation?.studentName ?? null)}
            </div>
          )}
          <h3 className="text-lg font-bold truncate" style={{ color: "#0f172a" }}>
            {activeConversation?.studentName ?? "Conversation"}
          </h3>
        </div>

        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto px-1 py-2">
          {threadMessages.map((m) => {
            const isCoach = m.sender_role === "coach";
            return (
              <div
                key={m.id}
                className={`flex ${isCoach ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-2.5"
                  style={{
                    backgroundColor: isCoach ? "#fee2e2" : "#F2F3F3",
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
            key={c.studentId}
            type="button"
            onClick={() => setSelectedStudentId(c.studentId)}
            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
          >
            {c.photoUrl ? (
              <img
                src={c.photoUrl}
                alt=""
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ backgroundColor: "#d93025" }}
              >
                {getInitials(c.studentName)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm truncate" style={{ color: "#0f172a" }}>
                  {c.studentName}
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
