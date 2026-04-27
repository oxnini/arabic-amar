"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "quranic-arabic-progress";

interface AnswerRecord {
  questionId: string;
  correct: boolean;
  timestamp: string;
}

interface ProgressData {
  [topicSlug: string]: AnswerRecord[];
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  const save = useCallback((data: ProgressData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setProgress(data);
  }, []);

  const recordAnswer = useCallback(
    (topicSlug: string, questionId: string, correct: boolean) => {
      const updated = { ...progress };
      if (!updated[topicSlug]) updated[topicSlug] = [];
      updated[topicSlug].push({
        questionId,
        correct,
        timestamp: new Date().toISOString(),
      });
      save(updated);
    },
    [progress, save]
  );

  const getTopicProgress = useCallback(
    (topicSlug: string) => {
      const records = progress[topicSlug] || [];
      return {
        correct: records.filter((r) => r.correct).length,
        total: records.length,
      };
    },
    [progress]
  );

  return { recordAnswer, getTopicProgress, progress };
}
