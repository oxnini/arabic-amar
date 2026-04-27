import type { docs_v1 } from "googleapis";
import type {
  SiteContent,
  Lesson,
  VocabularyEntry,
  GrammarRule,
  Topic,
} from "./types";

function getTextFromElement(
  el: docs_v1.Schema$StructuralElement
): string {
  if (!el.paragraph?.elements) return "";
  return el.paragraph.elements
    .map((e) => e.textRun?.content || "")
    .join("")
    .trim();
}

function getHeadingLevel(
  el: docs_v1.Schema$StructuralElement
): string | null {
  return el.paragraph?.paragraphStyle?.namedStyleType || null;
}

function parseLessonHeading(text: string): {
  number: string;
  title: string;
  titleArabic?: string;
} | null {
  const match = text.match(
    /^Lesson\s+([\d\s\-–]+):\s*(.+?)(?:\s*[–—-]\s*(.+))?$/
  );
  if (!match) return null;
  return {
    number: match[1].trim(),
    title: match[2].trim(),
    titleArabic: match[3]?.trim(),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseTableToVocabulary(
  table: docs_v1.Schema$Table,
  isExtra: boolean
): VocabularyEntry[] {
  const rows = table.tableRows || [];
  if (rows.length < 2) return [];

  const entries: VocabularyEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].tableCells || [];
    const getCellText = (index: number): string => {
      const cell = cells[index];
      if (!cell?.content) return "";
      return cell.content
        .map((block) =>
          (block.paragraph?.elements || [])
            .map((e) => e.textRun?.content || "")
            .join("")
        )
        .join("")
        .trim();
    };

    const category = getCellText(0);
    const arabic = getCellText(1);
    const transliteration = getCellText(2);
    const english = getCellText(3);

    if (arabic && transliteration && english) {
      entries.push({
        arabic,
        transliteration,
        english,
        category,
        subCategory: undefined,
        isExtra,
      });
    }
  }

  return entries;
}

function isExtraSection(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("extra") || lower.includes("bonus");
}

function isGrammarSection(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("key rule") ||
    lower.includes("grammar") ||
    lower.includes("rule") ||
    lower.includes("tip")
  );
}

export function parseDocument(doc: docs_v1.Schema$Document): SiteContent {
  const elements = doc.body?.content || [];
  const lessons: Lesson[] = [];
  let currentLesson: Lesson | null = null;
  let currentSectionName = "";
  let isInExtraSection = false;
  let isInGrammarSection = false;
  let grammarBuffer: string[] = [];

  function flushGrammar() {
    if (grammarBuffer.length > 0 && currentLesson) {
      currentLesson.grammarRules.push({
        title: currentSectionName || "Key Rules",
        content: grammarBuffer.join("\n"),
      });
      grammarBuffer = [];
    }
  }

  for (const el of elements) {
    const headingLevel = getHeadingLevel(el);
    const text = getTextFromElement(el);

    if (headingLevel === "HEADING_1" && text) {
      flushGrammar();
      const parsed = parseLessonHeading(text);
      if (parsed) {
        currentLesson = {
          id: `lesson-${parsed.number.replace(/\s+/g, "")}`,
          number: parsed.number,
          title: parsed.title,
          titleArabic: parsed.titleArabic,
          vocabulary: [],
          grammarRules: [],
          conversations: [],
          exercises: [],
          topicSlugs: [slugify(parsed.title)],
        };
        lessons.push(currentLesson);
        isInExtraSection = false;
        isInGrammarSection = false;
        currentSectionName = "";
      }
    } else if (
      (headingLevel === "HEADING_2" || headingLevel === "HEADING_3") &&
      text
    ) {
      flushGrammar();
      currentSectionName = text;
      isInExtraSection = isExtraSection(text);
      isInGrammarSection = isGrammarSection(text);
    } else if (el.table && currentLesson) {
      const vocab = parseTableToVocabulary(el.table, isInExtraSection);
      currentLesson.vocabulary.push(...vocab);
    } else if (isInGrammarSection && text && currentLesson) {
      grammarBuffer.push(text);
    }
  }

  flushGrammar();

  const topicMap = new Map<string, Topic>();

  for (const lesson of lessons) {
    for (const slug of lesson.topicSlugs) {
      if (!topicMap.has(slug)) {
        topicMap.set(slug, {
          slug,
          name: lesson.title,
          nameArabic: lesson.titleArabic,
          lessonIds: [],
        });
      }
      topicMap.get(slug)!.lessonIds.push(lesson.id);
    }

    const categories = new Set(
      lesson.vocabulary.map((v) => v.category).filter(Boolean)
    );
    for (const cat of categories) {
      const catSlug = slugify(cat);
      if (catSlug && !topicMap.has(catSlug)) {
        topicMap.set(catSlug, {
          slug: catSlug,
          name: cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase(),
          lessonIds: [lesson.id],
        });
      } else if (catSlug && topicMap.has(catSlug)) {
        const topic = topicMap.get(catSlug)!;
        if (!topic.lessonIds.includes(lesson.id)) {
          topic.lessonIds.push(lesson.id);
        }
      }
    }
  }

  return {
    lessons,
    topics: Array.from(topicMap.values()),
    lastFetched: new Date().toISOString(),
  };
}
