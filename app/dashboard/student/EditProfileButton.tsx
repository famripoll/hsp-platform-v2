"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

export default function EditProfileButton() {
  return (
    <Link href="/dashboard/student/edit" className="absolute top-3 right-3">
      <button
        aria-label="Edit profile"
        className="p-1 rounded-md text-[#5A6779] hover:text-[#d93025] hover:bg-red-50 transition-colors"
      >
        <Pencil className="w-4 h-4" aria-hidden="true" />
      </button>
    </Link>
  );
}
