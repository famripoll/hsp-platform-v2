"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Real browser-history back, so the student returns to the exact search URL
// they came from — filters + page (persisted in the query string by
// CollegeSearchClient) and the browser's own scroll restoration.
export default function BackToSearchLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
      style={{ color: "#64748b" }}
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Search
    </button>
  );
}
