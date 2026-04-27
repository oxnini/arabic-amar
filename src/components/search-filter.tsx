"use client";

import { useState } from "react";
import type { VocabularyEntry } from "@/lib/types";
import { VocabularyCard } from "./vocabulary-card";

interface SearchFilterProps {
  entries: VocabularyEntry[];
  topics: { slug: string; name: string }[];
}

export function SearchFilter({ entries, topics }: SearchFilterProps) {
  const [query, setQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const filtered = entries.filter((entry) => {
    const matchesQuery =
      !query ||
      entry.arabic.includes(query) ||
      entry.transliteration.toLowerCase().includes(query.toLowerCase()) ||
      entry.english.toLowerCase().includes(query.toLowerCase());

    const matchesTopic =
      selectedTopic === "all" ||
      entry.category.toLowerCase() === selectedTopic.toLowerCase();

    return matchesQuery && matchesTopic;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Arabic, transliteration, or English..." className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400" />
        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="rounded-lg border border-stone-200 px-4 py-2 text-stone-800">
          <option value="all">All Topics</option>
          {topics.map((t) => (<option key={t.slug} value={t.name}>{t.name}</option>))}
        </select>
      </div>
      <p className="mb-4 text-sm text-stone-400">{filtered.length} entries</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry, i) => (
          <VocabularyCard key={`${entry.arabic}-${i}`} arabic={entry.arabic} transliteration={entry.transliteration} english={entry.english} isExtra={entry.isExtra} />
        ))}
      </div>
    </div>
  );
}
