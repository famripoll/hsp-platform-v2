"use client";

import DashboardNav from "@/app/components/dashboard/DashboardNav";
import BackToTopButton from "@/app/components/ui/BackToTopButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen shrink-0"
      style={{ backgroundColor: "#F2F3F3" }}
    >
      <DashboardNav />
      {children}
      <BackToTopButton />
    </div>
  );
}
