"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase-client";

// Module-level shared store so every consumer of useUnreadNotifications()
// reads/writes the same count instead of each holding its own useState.
let sharedUnreadCount = 0;
let inFlightRefresh: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setSharedUnreadCount(next: number) {
  if (next !== sharedUnreadCount) {
    sharedUnreadCount = next;
    notifyListeners();
  }
}

async function performRefresh(): Promise<void> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSharedUnreadCount(0);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, conversation_key")
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      setSharedUnreadCount(0);
      return;
    }

    const conversationKeys = new Set<string>();
    let individualCount = 0;

    for (const row of data ?? []) {
      if (row.type === "new_message" && row.conversation_key !== null) {
        conversationKeys.add(row.conversation_key);
      } else {
        individualCount += 1;
      }
    }

    setSharedUnreadCount(conversationKeys.size + individualCount);
  } catch {
    setSharedUnreadCount(0);
  }
}

// Coalesces concurrent refresh() calls (e.g. three consumers mounting at
// once) into a single in-flight query rather than one per caller.
function refreshShared(): Promise<void> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number {
  return sharedUnreadCount;
}

function getServerSnapshot(): number {
  return 0;
}

export function useUnreadNotifications() {
  const unreadCount = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const refresh = useCallback(() => refreshShared(), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { unreadCount, refresh };
}
