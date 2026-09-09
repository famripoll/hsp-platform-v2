"use client";

import { useState } from "react";
import ChangePasswordForm from "./ChangePasswordForm";
import SubscriptionCard from "./SubscriptionCard";
import FamilyTab from "./FamilyTab";

const TABS = [
  { label: "Security", value: "security" },
  { label: "Subscription", value: "subscription" },
  { label: "Manage Family", value: "family" },
] as const;

type TabValue = typeof TABS[number]["value"];

export default function SettingsTabs({
  initialTab = "security",
  viewerRole,
  cancelAtPeriodEnd,
  subscriptionStatus,
  subscriptionPlan,
  billingFrequency,
  renewsOn,
  parentName,
  parentEmail,
  parentPhone,
  parentRelationship,
  familyMembers,
  studentId,
}: {
  initialTab?: string;
  viewerRole: string;
  cancelAtPeriodEnd: boolean;
  subscriptionStatus: string | null;
  subscriptionPlan: "silver" | "gold" | null;
  billingFrequency: "monthly" | "6months" | "annual" | null;
  renewsOn: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  parentRelationship: string | null;
  familyMembers: { id: string; full_name: string; relationship: string; email: string | null; phone: string | null; show_on_profile: boolean }[];
  studentId: string | null;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>(
    TABS.some((tab) => tab.value === initialTab) ? (initialTab as TabValue) : "security"
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-sm">
        <nav className="flex flex-wrap justify-center px-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 px-4 py-4 text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.value
                  ? "border-[#CE2C22] text-[#CE2C22] font-semibold"
                  : "border-transparent text-[#5A6779] hover:text-[#CE2C22] hover:scale-105"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "security" && <ChangePasswordForm />}
      {activeTab === "subscription" && (
        <SubscriptionCard
          viewerRole={viewerRole}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          subscriptionStatus={subscriptionStatus}
          subscriptionPlan={subscriptionPlan}
          billingFrequency={billingFrequency}
          renewsOn={renewsOn}
        />
      )}
      {activeTab === "family" && <FamilyTab familyMembers={familyMembers} studentId={studentId} parentName={parentName} parentEmail={parentEmail} parentPhone={parentPhone} parentRelationship={parentRelationship} />}
    </div>
  );
}
