"use client";

import { useSyncExternalStore } from "react";

// Module-level shared store so any consumer (e.g. BackToTopButton) can read
// whether a message thread is currently open without prop drilling.
let sharedThreadOpen = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function setThreadOpen(open: boolean) {
  if (open !== sharedThreadOpen) {
    sharedThreadOpen = open;
    notifyListeners();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return sharedThreadOpen;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useActiveThread() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
