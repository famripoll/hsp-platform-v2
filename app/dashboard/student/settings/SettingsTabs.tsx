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
  subscriptionStatus,
  subscriptionPlan,
  billingFrequency,
  parentName,
  parentEmail,
  parentPhone,
}: {
  subscriptionStatus: string | null;
  subscriptionPlan: "silver" | "gold" | null;
  billingFrequency: "monthly" | "6months" | "annual" | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("security");

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
                  ? "border-[#d93025] text-[#d93025] font-semibold"
                  : "border-transparent text-[#64748b] hover:text-[#d93025] hover:scale-105"
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
          subscriptionStatus={subscriptionStatus}
          subscriptionPlan={subscriptionPlan}
          billingFrequency={billingFrequency}
        />
      )}
      {activeTab === "family" && <FamilyTab parentName={parentName} parentEmail={parentEmail} parentPhone={parentPhone} />}
    </div>
  );
}
