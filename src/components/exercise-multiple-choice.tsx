"use client";

import { useState } from "react";
import { ExerciseFeedback } from "./exercise-feedback";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseMultipleChoiceProps {
  entries: VocabularyEntry[];
  onAnswer?: (questionId: string, correct: boolean) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestion(entries: VocabularyEntry[], index: number) {
  const correct = entries[index];
  const others = entries.filter((_, i) => i !== index);
  const wrongOptions = shuffleArray(others).slice(0, 3);
  const options = shuffleArray([correct, ...wrongOptions]);
  return {
    prompt: correct.english,
    correctArabic: correct.arabic,
    correctTransliteration: correct.transliteration,
    correctEnglish: correct.english,
    options: options.map((o) => ({
      arabic: o.arabic,
      transliteration: o.transliteration,
      isCorrect: o.arabic === correct.arabic,
    })),
  };
}

export function ExerciseMultipleChoice({ entries, onAnswer }: ExerciseMultipleChoiceProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [question, setQuestion] = useState(() => generateQuestion(entries, 0));

  if (entries.length < 4) {
    return <p className="text-sm text-stone-400">Need at least 4 vocabulary entries for multiple choice.</p>;
  }

  const answered = selected !== null;

  function handleSelect(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
    const isCorrect = question.options[optionIndex].isCorrect;
    onAnswer?.(`mc-${index}-${question.correctArabic}`, isCorrect);
  }

  function handleNext() {
    const nextIndex = index + 1;
    if (nextIndex >= entries.length) {
      setIndex(0);
      setQuestion(generateQuestion(entries, 0));
    } else {
      setIndex(nextIndex);
      setQuestion(generateQuestion(entries, nextIndex));
    }
    setSelected(null);
  }

  return (
    <div className="max-w-md">
      <p className="mb-1 text-sm text-stone-400">{index + 1} / {entries.length}</p>
      <p className="mb-4 text-lg font-medium text-stone-800">Which is the Arabic for &ldquo;{question.prompt}&rdquo;?</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={answered}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              answered && opt.isCorrect ? "border-green-300 bg-green-50"
                : answered && i === selected && !opt.isCorrect ? "border-red-300 bg-red-50"
                : "border-stone-200 bg-white hover:border-amber-300"
            }`}
          >
            <span dir="rtl" lang="ar" className="font-arabic text-lg">{opt.arabic}</span>
            <span className="ml-3 text-sm text-stone-400">{opt.transliteration}</span>
          </button>
        ))}
      </div>
      {answered && (
        <ExerciseFeedback
          isCorrect={question.options[selected!].isCorrect}
          correctAnswer={question.correctArabic}
          transliteration={question.correctTransliteration}
          english={question.correctEnglish}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
