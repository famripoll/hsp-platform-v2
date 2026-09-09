"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Bell, MessageSquare } from "lucide-react";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link_url: string | null;
  read_at: string | null;
  created_at: string;
  conversation_key: string | null;
  sender_name: string | null;
};

type NotificationGroup = {
  key: string;
  items: Notification[];
  latest: Notification;
  unreadCount: number;
  isUnread: boolean;
};

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

function iconForType(type: string) {
  if (type === "new_message") return MessageSquare;
  return Bell;
}

type Props = {
  onReadChange?: () => void;
};

export default function NotificationsList({ onReadChange }: Props = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, link_url, read_at, created_at, conversation_key, sender_name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const groups = useMemo<NotificationGroup[]>(() => {
    const map = new Map<string, Notification[]>();

    for (const n of notifications) {
      const groupable = n.type === "new_message" && n.conversation_key !== null;
      const key = groupable ? n.conversation_key! : n.id;
      const existing = map.get(key);
      if (existing) {
        existing.push(n);
      } else {
        map.set(key, [n]);
      }
    }

    const result: NotificationGroup[] = Array.from(map.entries()).map(([key, items]) => {
      const latest = items.reduce((a, b) =>
        new Date(b.created_at).getTime() > new Date(a.created_at).getTime() ? b : a
      );
      const groupUnreadCount = items.filter((n) => !n.read_at).length;

      return {
        key,
        items,
        latest,
        unreadCount: groupUnreadCount,
        isUnread: groupUnreadCount > 0,
      };
    });

    result.sort(
      (a, b) => new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime()
    );

    return result;
  }, [notifications]);

  async function handleRowClick(group: NotificationGroup) {
    const unreadIds = group.items.filter((n) => !n.read_at).map((n) => n.id);

    if (unreadIds.length > 0) {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);

      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n
        )
      );

      onReadChange?.();
    }

    if (group.latest.link_url) {
      router.push(group.latest.link_url);
    }
  }

  async function handleMarkAllAsRead() {
    if (!userId) return;

    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    await fetchNotifications();
    onReadChange?.();
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          Notifications
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-center animate-pulse" style={{ color: "#5A6779" }}>
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          Notifications
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Bell className="w-10 h-10" style={{ color: "#d1d5db" }} />
          <p className="text-sm text-center" style={{ color: "#5A6779" }}>
            No notifications yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5 gap-3">
        <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
          Notifications
        </h3>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-xs sm:text-sm font-semibold shrink-0 hover:underline"
            style={{ color: "#CE2C22" }}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col">
        {groups.map((group) => {
          const Icon = iconForType(group.latest.type);
          const isUnread = group.isUnread;
          const showGroupTitle = group.unreadCount > 1 && group.latest.sender_name !== null;
          const titleText = showGroupTitle
            ? `${group.latest.sender_name} · ${group.unreadCount} new messages`
            : group.latest.title;

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => handleRowClick(group)}
              className="flex items-start gap-3 py-3 px-2 -mx-2 rounded-lg text-left border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50"
              style={{ backgroundColor: isUnread ? "#fef2f2" : "transparent" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#F2F3F3" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#CE2C22" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isUnread && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: "#CE2C22" }}
                      />
                    )}
                    <span className="font-bold text-sm truncate" style={{ color: "#0f172a" }}>
                      {titleText}
                    </span>
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color: "#5A6779" }}>
                    {formatRelativeTime(group.latest.created_at)}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: "#5A6779" }}>
                  {group.latest.body}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
