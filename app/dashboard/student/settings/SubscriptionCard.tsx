"use client";

import { useState } from "react";
import { CreditCard, Gift, Calendar } from "lucide-react";

const LABEL = "text-sm font-medium text-gray-600 mb-1 block";

function formatFrequency(freq: "monthly" | "6months" | "annual" | null): string {
  if (freq === "monthly") return "Monthly";
  if (freq === "6months") return "Every 6 Months";
  if (freq === "annual") return "Annual";
  return "";
}

export default function SubscriptionCard({
  subscriptionStatus,
  subscriptionPlan,
  billingFrequency,
}: {
  subscriptionStatus: string | null;
  subscriptionPlan: "silver" | "gold" | null;
  billingFrequency: "monthly" | "6months" | "annual" | null;
}) {
  const [loading, setLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const isPaid = subscriptionStatus === "paid";

  async function handleManageBilling() {
    setLoading(true);
    setPortalError(null);

    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setPortalError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setPortalError("Unable to reach billing service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-full grid grid-rows-[auto_1fr]">
      <div className="flex items-start gap-3">
        <div className="bg-red-50 rounded-xl p-3 shrink-0">
          <CreditCard size={22} color="#d93025" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">Subscription</h2>
          <p className="text-sm text-[#64748b]">View your current plan and billing details.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 justify-between">
        <div>
          <div className="border-t border-gray-100 my-5" />
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Gift size={18} className="text-gray-500 shrink-0" />
              <div>
                <span className={LABEL}>Current Plan</span>
                <p className="text-[#0f172a] font-semibold">
                  {subscriptionPlan === "gold" ? (
                    <>
                      Gold
                      {billingFrequency && (
                        <span className="block text-xs font-normal text-[#64748b] mt-0.5">
                          {formatFrequency(billingFrequency)}
                        </span>
                      )}
                    </>
                  ) : subscriptionPlan === "silver" ? (
                    <>
                      Silver
                      {billingFrequency && (
                        <span className="block text-xs font-normal text-[#64748b] mt-0.5">
                          {formatFrequency(billingFrequency)}
                        </span>
                      )}
                    </>
                  ) : isPaid ? (
                    "Premium"
                  ) : (
                    "Free"
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-gray-500 shrink-0" />
              <div>
                <span className={LABEL}>Renews On</span>
                <p className="text-[#0f172a] font-semibold">—</p>
              </div>
            </div>

            <div className="border-t border-gray-100 my-5" />

            <p className="text-sm text-[#64748b]">
              {subscriptionPlan === "gold"
                ? "You're on the Gold plan — you have access to all features and benefits."
                : subscriptionPlan === "silver"
                ? "You're on the Silver plan. Upgrade to Gold anytime for additional benefits."
                : isPaid
                ? "You're on the Premium plan. Manage your billing details or update your subscription anytime."
                : "You're on the Free plan. Upgrade anytime to unlock more features and additional benefits."}
            </p>
          </div>
        </div>

        <div>
          <div className="pt-1">
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="bg-[#d93025] text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105 disabled:opacity-60"
            >
              {loading ? "Loading…" : "Manage Billing"}
            </button>
          </div>

          {portalError && (
            <p className="mt-3 text-sm text-gray-500">{portalError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
