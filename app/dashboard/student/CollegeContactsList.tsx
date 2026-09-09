"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-client";
import { GraduationCap, ChevronDown } from "lucide-react";

const PREVIEW_LENGTH = 100;

type CollegeContact = {
  id: string;
  institution_name: string;
  body: string;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export default function CollegeContactsList() {
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<CollegeContact[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

    const { data: contactRows } = await supabase
      .from("college_contacts")
      .select("id, institution_name, body, created_at")
      .eq("student_id", resolvedStudentId)
      .order("created_at", { ascending: false });

    setContacts((contactRows ?? []) as CollegeContact[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          College Contacts
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-center animate-pulse" style={{ color: "#5A6779" }}>
            Loading college contacts...
          </p>
        </div>
      </div>
    );
  }

  if (!studentId || contacts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
          College Contacts
        </h3>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <GraduationCap className="w-10 h-10" style={{ color: "#d1d5db" }} />
          <p className="text-sm text-center max-w-xs" style={{ color: "#5A6779" }}>
            You haven&apos;t contacted any colleges yet. You can reach out to a school from its
            college page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
        College Contacts
      </h3>

      <div className="flex flex-col">
        {contacts.map((c) => {
          const isLong = c.body.length > PREVIEW_LENGTH;
          const isExpanded = expandedIds.has(c.id);

          const header = (
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm" style={{ color: "#0f172a" }}>
                {c.institution_name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <span className="text-[10px]" style={{ color: "#5A6779" }}>
                  {formatDate(c.created_at)}
                </span>
                {isLong && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    style={{ color: "#5A6779" }}
                  />
                )}
              </div>
            </div>
          );

          const message = (
            <p
              className={`text-xs mt-0.5 break-words ${
                isLong && !isExpanded ? "" : "whitespace-pre-wrap"
              }`}
              style={{ color: "#5A6779" }}
            >
              {isLong && !isExpanded
                ? `${c.body.slice(0, PREVIEW_LENGTH).trimEnd()}…`
                : c.body}
            </p>
          );

          if (!isLong) {
            return (
              <div
                key={c.id}
                className="py-3 border-b border-gray-100 last:border-0 px-2 -mx-2"
              >
                {header}
                {message}
              </div>
            );
          }

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleExpanded(c.id)}
              aria-expanded={isExpanded}
              className="block py-3 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b0aa]"
            >
              {header}
              {message}
            </button>
          );
        })}
      </div>
    </div>
  );
}
