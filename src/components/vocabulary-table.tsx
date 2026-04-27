"use client";

import { useState } from "react";
import { VocabularyCard } from "./vocabulary-card";
import type { VocabularyEntry } from "@/lib/types";

interface VocabularyTableProps {
  entries: VocabularyEntry[];
}

export function VocabularyTable({ entries }: VocabularyTableProps) {
  const [showExtra, setShowExtra] = useState(false);

  const coreEntries = entries.filter((e) => !e.isExtra);
  const extraEntries = entries.filter((e) => e.isExtra);

  const grouped = new Map<string, VocabularyEntry[]>();
  for (const entry of coreEntries) {
    const key = entry.category || "General";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            {category}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((entry, i) => (
              <VocabularyCard
                key={`${entry.arabic}-${i}`}
                arabic={entry.arabic}
                transliteration={entry.transliteration}
                english={entry.english}
              />
            ))}
          </div>
        </div>
      ))}

      {extraEntries.length > 0 && (
        <div>
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="mb-3 text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            {showExtra ? "Hide" : "Show"} Extra Vocabulary (
            {extraEntries.length})
          </button>
          {showExtra && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {extraEntries.map((entry, i) => (
                <VocabularyCard
                  key={`extra-${entry.arabic}-${i}`}
                  arabic={entry.arabic}
                  transliteration={entry.transliteration}
                  english={entry.english}
                  isExtra
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
