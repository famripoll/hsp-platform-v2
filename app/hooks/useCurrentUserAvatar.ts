"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase-client";

// Module-level shared store so every consumer of useCurrentUserAvatar()
// reads/writes the same profile/avatar data instead of each holding its own
// useState — same pattern as useUnreadNotifications.
type AvatarState = {
  photoUrl: string | null;
  initials: string;
  fullName: string | null;
  role: string | null;
  loading: boolean;
};

const INITIAL_STATE: AvatarState = {
  photoUrl: null,
  initials: "?",
  fullName: null,
  role: null,
  loading: true,
};

let sharedState: AvatarState = INITIAL_STATE;
let inFlightRefresh: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setSharedState(next: AvatarState) {
  sharedState = next;
  notifyListeners();
}

// Same byte-identical logic as the existing copies elsewhere in the app.
function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

async function performRefresh(): Promise<void> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSharedState({ photoUrl: null, initials: "?", fullName: null, role: null, loading: false });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? null;
    const fullName = profile?.full_name ?? null;
    const initials = getInitials(fullName);

    let photoUrl: string | null = null;

    if (role === "student") {
      const { data: student } = await supabase
        .from("students")
        .select("photo_url")
        .eq("profile_id", user.id)
        .single();

      if (student?.photo_url) {
        if (student.photo_url.startsWith("http")) {
          photoUrl = student.photo_url;
        } else {
          const { data } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(student.photo_url, 3600);
          photoUrl = data?.signedUrl ?? null;
        }
      }
    }

    setSharedState({ photoUrl, initials, fullName, role, loading: false });
  } catch {
    setSharedState({ photoUrl: null, initials: "?", fullName: null, role: null, loading: false });
  }
}

// Coalesces concurrent refresh() calls (e.g. several consumers mounting at
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

function getSnapshot(): AvatarState {
  return sharedState;
}

function getServerSnapshot(): AvatarState {
  return INITIAL_STATE;
}

export function useCurrentUserAvatar() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const refresh = useCallback(() => refreshShared(), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return state;
}
