"use client";

import { useState, useEffect, use } from "react";
import { ExerciseFlashcard } from "@/components/exercise-flashcard";
import { ExerciseMultipleChoice } from "@/components/exercise-multiple-choice";
import { ExerciseFillBlank } from "@/components/exercise-fill-blank";
import { ExerciseOrdering } from "@/components/exercise-ordering";
import { ProgressBar } from "@/components/progress-bar";
import { useProgress } from "@/hooks/use-progress";
import type { VocabularyEntry } from "@/lib/types";

type ExerciseType = "flashcard" | "multiple-choice" | "fill-blank" | "ordering";

export default function ExercisesPage({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = use(params);
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [activeType, setActiveType] = useState<ExerciseType>("flashcard");
  const [loading, setLoading] = useState(true);
  const { recordAnswer, getTopicProgress } = useProgress();

  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch(`/api/topic-vocab?slug=${topicSlug}`);
        const data = await res.json();
        setEntries(data.entries || []);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, [topicSlug]);

  if (loading) return <p className="text-stone-400">Loading exercises...</p>;
  if (entries.length < 4) return <p className="text-stone-400">Not enough vocabulary entries for exercises (need at least 4).</p>;

  const progress = getTopicProgress(topicSlug);
  const exerciseTypes: { key: ExerciseType; label: string }[] = [
    { key: "flashcard", label: "Flashcards" },
    { key: "multiple-choice", label: "Multiple Choice" },
    { key: "fill-blank", label: "Fill in the Blank" },
    { key: "ordering", label: "Ordering" },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-stone-800">Practice: {topicSlug.replace(/-/g, " ")}</h1>
      {progress.total > 0 && (
        <div className="mb-6 max-w-xs">
          <ProgressBar label="Accuracy" value={progress.correct} max={progress.total} />
        </div>
      )}
      <div className="mb-6 flex gap-2">
        {exerciseTypes.map((type) => (
          <button key={type.key} onClick={() => setActiveType(type.key)} className={`rounded-md px-3 py-1.5 text-sm transition-colors ${activeType === type.key ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{type.label}</button>
        ))}
      </div>
      {activeType === "flashcard" && <ExerciseFlashcard entries={entries} />}
      {activeType === "multiple-choice" && <ExerciseMultipleChoice entries={entries} onAnswer={(qid, correct) => recordAnswer(topicSlug, qid, correct)} />}
      {activeType === "fill-blank" && <ExerciseFillBlank entries={entries} onAnswer={(qid, correct) => recordAnswer(topicSlug, qid, correct)} />}
      {activeType === "ordering" && <ExerciseOrdering entries={entries} onAnswer={(qid, correct) => recordAnswer(topicSlug, qid, correct)} />}
    </div>
  );
}
