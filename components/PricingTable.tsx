"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function PricingTable({ plan }: { plan: "free" | "pro" }) {
  const [loading, setLoading] = useState(false);

  async function upgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  async function manage() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <div className="border border-white/10 rounded-lg p-6 flex items-center justify-between">
      <div>
        <p className="font-display text-xl text-paper capitalize">{plan} plan</p>
        <p className="text-paper-faint text-sm">
          {plan === "free" ? "5 documents · 30 questions / month" : "500 documents · 2,000 questions / month"}
        </p>
      </div>
      <button
        onClick={plan === "free" ? upgrade : manage}
        disabled={loading}
        className="bg-gold text-ink font-medium px-5 py-2.5 rounded-md hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {plan === "free" ? "Upgrade to Pro" : "Manage subscription"}
      </button>
    </div>
  );
}
