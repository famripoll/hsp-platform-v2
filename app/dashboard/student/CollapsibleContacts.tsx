"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CollapsibleContacts({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="sm:hidden w-full flex items-center justify-between border-t border-gray-100 pt-4"
      >
        <span className="text-xs font-semibold uppercase" style={{ color: "#d93025" }}>
          Contact Information
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#d93025" }}
        />
      </button>
      <div className={`${open ? "block" : "hidden"} sm:block`}>{children}</div>
    </>
  );
}
