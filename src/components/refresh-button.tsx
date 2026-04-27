"use client";

import { useState } from "react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRefresh() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage(`Updated — ${data.lessonCount} lessons loaded`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage("Failed to refresh");
      }
    } catch {
      setMessage("Failed to refresh");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="rounded-md bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200 disabled:opacity-50"
      >
        {loading ? "Refreshing..." : "Refresh Content"}
      </button>
      {message && (
        <span className="text-xs text-stone-500">{message}</span>
      )}
    </div>
  );
}
