export interface VocabularyEntry {
  arabic: string;
  transliteration: string;
  english: string;
  category: string;
  subCategory?: string;
  isExtra: boolean;
}

export interface GrammarRule {
  title: string;
  content: string;
  examples?: string[];
}

export interface ConversationLine {
  speaker: string;
  arabic: string;
  transliteration: string;
  english: string;
}

export interface Conversation {
  title: string;
  lines: ConversationLine[];
}

export interface ExerciseQuestion {
  id: string;
  prompt: string;
  promptArabic?: string;
  options?: string[];
  correctAnswer: string;
  type: "multiple-choice" | "fill-blank" | "ordering" | "matching";
}

export interface Exercise {
  title: string;
  lessonId: string;
  topicSlug: string;
  questions: ExerciseQuestion[];
}

export interface Topic {
  slug: string;
  name: string;
  nameArabic?: string;
  lessonIds: string[];
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  titleArabic?: string;
  vocabulary: VocabularyEntry[];
  grammarRules: GrammarRule[];
  conversations: Conversation[];
  exercises: Exercise[];
  topicSlugs: string[];
}

export interface SiteContent {
  lessons: Lesson[];
  topics: Topic[];
  lastFetched: string;
}
