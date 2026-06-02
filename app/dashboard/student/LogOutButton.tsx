"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LogOutButton() {
  const router = useRouter();

  async function handleLogOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogOut}
      className="text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors hover:bg-red-50"
      style={{ borderColor: "#d93025", color: "#d93025" }}
    >
      Log Out
    </button>
  );
}
