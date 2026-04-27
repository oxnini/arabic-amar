# Quranic Arabic Learning Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js website that auto-syncs with a Google Doc every 4 hours and presents Quranic Arabic lessons as interactive, structured learning content with exercises and progress tracking.

**Architecture:** Next.js app with API routes that fetch and parse a Google Doc into structured JSON. The parsed content is cached on the server filesystem. The frontend renders lessons, vocabulary, grammar, and interactive exercises. Progress is tracked in browser localStorage.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Google Docs API (googleapis npm package), Noto Naskh Arabic font, Vercel for hosting.

---

## File Structure

```
quranic-arabic-learning/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts, nav, theme
│   │   ├── page.tsx                # Home/dashboard page
│   │   ├── globals.css             # Global styles + Tailwind
│   │   ├── topics/
│   │   │   ├── page.tsx            # Topics listing page
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Individual topic page
│   │   ├── lessons/
│   │   │   ├── page.tsx            # Lessons listing page
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Individual lesson page
│   │   ├── vocabulary/
│   │   │   └── page.tsx            # Vocabulary bank page
│   │   ├── grammar/
│   │   │   └── page.tsx            # Grammar reference page
│   │   ├── exercises/
│   │   │   └── [topicSlug]/
│   │   │       └── page.tsx        # Exercises for a topic
│   │   └── api/
│   │       └── refresh/
│   │           └── route.ts        # Manual refresh endpoint
│   ├── lib/
│   │   ├── google-docs.ts          # Google Docs API client + fetcher
│   │   ├── parser.ts               # Doc content parser (headings, tables, sections)
│   │   ├── content-cache.ts        # JSON cache read/write
│   │   └── types.ts                # TypeScript types for content model
│   ├── components/
│   │   ├── nav.tsx                  # Main navigation bar
│   │   ├── vocabulary-card.tsx      # Single vocab entry (Arabic/translit/English)
│   │   ├── vocabulary-table.tsx     # Table of vocab entries with category headers
│   │   ├── rule-card.tsx            # Grammar rule/tip card
│   │   ├── conversation-display.tsx # Dialogue format display
│   │   ├── exercise-flashcard.tsx   # Flashcard exercise component
│   │   ├── exercise-multiple-choice.tsx  # Multiple choice exercise
│   │   ├── exercise-fill-blank.tsx  # Fill in the blank exercise
│   │   ├── exercise-ordering.tsx    # Ordering/sequencing exercise
│   │   ├── exercise-feedback.tsx    # Correct/incorrect feedback overlay
│   │   ├── progress-bar.tsx         # Progress indicator
│   │   ├── search-filter.tsx        # Search + filter for vocabulary bank
│   │   └── refresh-button.tsx       # Manual refresh trigger
│   └── hooks/
│       └── use-progress.ts         # localStorage progress hook
├── content/                         # Cached parsed JSON (gitignored)
│   └── content.json
├── tests/
│   ├── lib/
│   │   ├── parser.test.ts          # Parser unit tests
│   │   ├── content-cache.test.ts   # Cache read/write tests
│   │   └── google-docs.test.ts     # Google Docs fetcher tests
│   ├── components/
│   │   ├── vocabulary-card.test.tsx # Vocab card render tests
│   │   ├── exercise-flashcard.test.tsx
│   │   ├── exercise-multiple-choice.test.tsx
│   │   └── exercise-feedback.test.tsx
│   └── hooks/
│       └── use-progress.test.ts    # Progress hook tests
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local                       # Google API credentials (gitignored)
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.env.local`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Expected: Project scaffolded with `src/` directory, App Router, Tailwind configured.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npm install googleapis
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `tests/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to package.json**

Add to `scripts` in `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Create `.env.local`**

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DOC_ID=1wqbU7rsLUm0wqCjQPS2PbtCTThZOxnE2CnClxa8DETc
```

- [ ] **Step 6: Update `.gitignore`**

Add these lines to the existing `.gitignore`:

```
.env.local
content/
```

- [ ] **Step 7: Add Noto Naskh Arabic font to layout**

Edit `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Quranic Arabic Learning",
  description: "Interactive Quranic Arabic learning companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Verify the app runs**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npm run dev
```

Open `http://localhost:3000` — should see the default Next.js page.

- [ ] **Step 9: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Vitest, and Arabic font"
```

---

## Task 2: TypeScript Types for Content Model

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Define all content types**

Create `src/lib/types.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/lib/types.ts
git commit -m "feat: define TypeScript types for content model"
```

---

## Task 3: Google Docs API Client

**Files:**
- Create: `src/lib/google-docs.ts`, `tests/lib/google-docs.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/google-docs.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { fetchDocContent } from "@/lib/google-docs";

vi.mock("googleapis", () => ({
  google: {
    docs: vi.fn(() => ({
      documents: {
        get: vi.fn().mockResolvedValue({
          data: {
            title: "Test Doc",
            body: {
              content: [
                {
                  paragraph: {
                    elements: [
                      { textRun: { content: "Hello World" } },
                    ],
                  },
                },
              ],
            },
          },
        }),
      },
    })),
    auth: {
      GoogleAuth: vi.fn().mockImplementation(() => ({
        getClient: vi.fn().mockResolvedValue({}),
      })),
    },
  },
}));

describe("fetchDocContent", () => {
  it("returns the document data from Google Docs API", async () => {
    const doc = await fetchDocContent();
    expect(doc).toBeDefined();
    expect(doc.title).toBe("Test Doc");
    expect(doc.body.content).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/lib/google-docs.test.ts
```

Expected: FAIL — `fetchDocContent` not found.

- [ ] **Step 3: Write the implementation**

Create `src/lib/google-docs.ts`:

```typescript
import { google } from "googleapis";

const DOC_ID = process.env.GOOGLE_DOC_ID!;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/documents.readonly"],
  });
}

export async function fetchDocContent() {
  const auth = getAuth();
  const docs = google.docs({ version: "v1", auth });
  const response = await docs.documents.get({ documentId: DOC_ID });
  return response.data;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/lib/google-docs.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/lib/google-docs.ts tests/lib/google-docs.test.ts
git commit -m "feat: add Google Docs API client for fetching document content"
```

---

## Task 4: Document Parser

**Files:**
- Create: `src/lib/parser.ts`, `tests/lib/parser.test.ts`

This is the core logic — it converts raw Google Docs API response into our `SiteContent` type.

- [ ] **Step 1: Write failing tests for heading extraction**

Create `tests/lib/parser.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseDocument } from "@/lib/parser";
import type { docs_v1 } from "googleapis";

function makeTextElement(text: string): docs_v1.Schema$StructuralElement {
  return {
    paragraph: {
      elements: [{ textRun: { content: text } }],
    },
  };
}

function makeHeading(
  text: string,
  level: "HEADING_1" | "HEADING_2" | "HEADING_3"
): docs_v1.Schema$StructuralElement {
  return {
    paragraph: {
      paragraphStyle: { namedStyleType: level },
      elements: [{ textRun: { content: text } }],
    },
  };
}

function makeTable(
  rows: string[][]
): docs_v1.Schema$StructuralElement {
  return {
    table: {
      tableRows: rows.map((cells) => ({
        tableCells: cells.map((text) => ({
          content: [
            {
              paragraph: {
                elements: [{ textRun: { content: text } }],
              },
            },
          ],
        })),
      })),
    },
  };
}

function makeDoc(
  content: docs_v1.Schema$StructuralElement[]
): docs_v1.Schema$Document {
  return {
    title: "Test Doc",
    body: { content },
  };
}

describe("parseDocument", () => {
  it("extracts lessons from headings", () => {
    const doc = makeDoc([
      makeHeading("Lesson 1 - 2: Body Parts – أَجْزَاءُ الْجِسْمِ", "HEADING_1"),
      makeTextElement("Some content\n"),
    ]);

    const result = parseDocument(doc);
    expect(result.lessons).toHaveLength(1);
    expect(result.lessons[0].number).toBe("1 - 2");
    expect(result.lessons[0].title).toBe("Body Parts");
    expect(result.lessons[0].titleArabic).toBe("أَجْزَاءُ الْجِسْمِ");
  });

  it("extracts vocabulary from tables", () => {
    const doc = makeDoc([
      makeHeading("Lesson 1: Numbers", "HEADING_1"),
      makeHeading("1.1 Vocabulary", "HEADING_2"),
      makeTable([
        ["Category", "Arabic", "Pronunciation", "English"],
        ["NUMBERS", "وَاحِد", "wāḥid", "one"],
        ["NUMBERS", "اِثْنَان", "ithnān", "two"],
      ]),
    ]);

    const result = parseDocument(doc);
    expect(result.lessons[0].vocabulary).toHaveLength(2);
    expect(result.lessons[0].vocabulary[0]).toEqual({
      arabic: "وَاحِد",
      transliteration: "wāḥid",
      english: "one",
      category: "NUMBERS",
      subCategory: undefined,
      isExtra: false,
    });
  });

  it("marks extra/bonus vocabulary", () => {
    const doc = makeDoc([
      makeHeading("Lesson 1: Test", "HEADING_1"),
      makeHeading("Extra Vocabulary", "HEADING_2"),
      makeTable([
        ["Category", "Arabic", "Pronunciation", "English"],
        ["BONUS", "كَلِمَة", "kalima", "word"],
      ]),
    ]);

    const result = parseDocument(doc);
    expect(result.lessons[0].vocabulary[0].isExtra).toBe(true);
  });

  it("extracts grammar rules from content sections", () => {
    const doc = makeDoc([
      makeHeading("Lesson 1: Test", "HEADING_1"),
      makeHeading("Key Rules", "HEADING_2"),
      makeTextElement("Rule: Arabic numbers follow special agreement rules.\n"),
      makeTextElement("The masculine form is used with feminine nouns.\n"),
    ]);

    const result = parseDocument(doc);
    expect(result.lessons[0].grammarRules).toHaveLength(1);
    expect(result.lessons[0].grammarRules[0].content).toContain(
      "Arabic numbers follow special agreement rules"
    );
  });

  it("generates topics from lesson categories", () => {
    const doc = makeDoc([
      makeHeading("Lesson 1: Numbers", "HEADING_1"),
      makeHeading("1.1 Vocabulary", "HEADING_2"),
      makeTable([
        ["Category", "Arabic", "Pronunciation", "English"],
        ["NUMBERS", "وَاحِد", "wāḥid", "one"],
      ]),
    ]);

    const result = parseDocument(doc);
    expect(result.topics.length).toBeGreaterThanOrEqual(1);
    expect(result.topics.find((t) => t.name === "Numbers")).toBeDefined();
  });

  it("generates a topic slug from lesson title", () => {
    const doc = makeDoc([
      makeHeading("Lesson 7 - 8: Getting to know each other", "HEADING_1"),
      makeTextElement("Content\n"),
    ]);

    const result = parseDocument(doc);
    expect(result.lessons[0].topicSlugs).toContain(
      "getting-to-know-each-other"
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/lib/parser.test.ts
```

Expected: FAIL — `parseDocument` not found.

- [ ] **Step 3: Implement the parser**

Create `src/lib/parser.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/lib/parser.test.ts
```

Expected: PASS (all 6 tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/lib/parser.ts tests/lib/parser.test.ts
git commit -m "feat: implement Google Doc parser for lessons, vocabulary, grammar"
```

---

## Task 5: Content Cache

**Files:**
- Create: `src/lib/content-cache.ts`, `tests/lib/content-cache.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/content-cache.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readCache, writeCache, isCacheStale } from "@/lib/content-cache";
import fs from "fs/promises";

vi.mock("fs/promises");

const mockContent = {
  lessons: [],
  topics: [],
  lastFetched: new Date().toISOString(),
};

describe("content-cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writeCache writes JSON to the content directory", async () => {
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue();

    await writeCache(mockContent);

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining("content.json"),
      JSON.stringify(mockContent, null, 2)
    );
  });

  it("readCache returns parsed JSON when file exists", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify(mockContent)
    );

    const result = await readCache();
    expect(result).toEqual(mockContent);
  });

  it("readCache returns null when file does not exist", async () => {
    vi.mocked(fs.readFile).mockRejectedValue(
      new Error("ENOENT: no such file")
    );

    const result = await readCache();
    expect(result).toBeNull();
  });

  it("isCacheStale returns true when cache is older than 4 hours", () => {
    const fiveHoursAgo = new Date(
      Date.now() - 5 * 60 * 60 * 1000
    ).toISOString();
    expect(isCacheStale(fiveHoursAgo)).toBe(true);
  });

  it("isCacheStale returns false when cache is fresh", () => {
    const oneHourAgo = new Date(
      Date.now() - 1 * 60 * 60 * 1000
    ).toISOString();
    expect(isCacheStale(oneHourAgo)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/lib/content-cache.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the cache**

Create `src/lib/content-cache.ts`:

```typescript
import fs from "fs/promises";
import path from "path";
import type { SiteContent } from "./types";

const CACHE_DIR = path.join(process.cwd(), "content");
const CACHE_FILE = path.join(CACHE_DIR, "content.json");
const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000; // 4 hours

export async function writeCache(content: SiteContent): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(content, null, 2));
}

export async function readCache(): Promise<SiteContent | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as SiteContent;
  } catch {
    return null;
  }
}

export function isCacheStale(lastFetched: string): boolean {
  const fetchedAt = new Date(lastFetched).getTime();
  return Date.now() - fetchedAt > STALE_THRESHOLD_MS;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/lib/content-cache.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/lib/content-cache.ts tests/lib/content-cache.test.ts
git commit -m "feat: add content cache layer for parsed JSON"
```

---

## Task 6: Content Loading (Fetch + Parse + Cache Orchestration)

**Files:**
- Modify: `src/lib/content-cache.ts` (add `getContent` function)

- [ ] **Step 1: Add `getContent` to content-cache.ts**

Append to `src/lib/content-cache.ts`:

```typescript
import { fetchDocContent } from "./google-docs";
import { parseDocument } from "./parser";

export async function getContent(): Promise<SiteContent> {
  const cached = await readCache();

  if (cached && !isCacheStale(cached.lastFetched)) {
    return cached;
  }

  try {
    const doc = await fetchDocContent();
    const content = parseDocument(doc);
    await writeCache(content);
    return content;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

export async function refreshContent(): Promise<SiteContent> {
  const doc = await fetchDocContent();
  const content = parseDocument(doc);
  await writeCache(content);
  return content;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/lib/content-cache.ts
git commit -m "feat: add content loading orchestration with stale-cache fallback"
```

---

## Task 7: API Route — Manual Refresh

**Files:**
- Create: `src/app/api/refresh/route.ts`

- [ ] **Step 1: Create the refresh API route**

Create `src/app/api/refresh/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { refreshContent } from "@/lib/content-cache";

export async function POST() {
  try {
    const content = await refreshContent();
    return NextResponse.json({
      success: true,
      lastFetched: content.lastFetched,
      lessonCount: content.lessons.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to refresh content" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/app/api/refresh/route.ts
git commit -m "feat: add manual refresh API endpoint"
```

---

## Task 8: Core UI Components

**Files:**
- Create: `src/components/nav.tsx`, `src/components/vocabulary-card.tsx`, `src/components/vocabulary-table.tsx`, `src/components/rule-card.tsx`, `src/components/conversation-display.tsx`, `src/components/refresh-button.tsx`, `src/components/progress-bar.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Write failing test for VocabularyCard**

Create `tests/components/vocabulary-card.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VocabularyCard } from "@/components/vocabulary-card";

describe("VocabularyCard", () => {
  it("renders Arabic, transliteration, and English", () => {
    render(
      <VocabularyCard
        arabic="السَّلَامُ عَلَيْكُمْ"
        transliteration="as-salāmu ʿalaykum"
        english="peace be upon you"
      />
    );

    expect(screen.getByText("السَّلَامُ عَلَيْكُمْ")).toBeInTheDocument();
    expect(screen.getByText("as-salāmu ʿalaykum")).toBeInTheDocument();
    expect(screen.getByText("peace be upon you")).toBeInTheDocument();
  });

  it("displays Arabic text in right-to-left direction", () => {
    render(
      <VocabularyCard
        arabic="وَاحِد"
        transliteration="wāḥid"
        english="one"
      />
    );

    const arabicEl = screen.getByText("وَاحِد");
    expect(arabicEl).toHaveAttribute("dir", "rtl");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/components/vocabulary-card.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Implement VocabularyCard**

Create `src/components/vocabulary-card.tsx`:

```tsx
interface VocabularyCardProps {
  arabic: string;
  transliteration: string;
  english: string;
  isExtra?: boolean;
}

export function VocabularyCard({
  arabic,
  transliteration,
  english,
  isExtra,
}: VocabularyCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
        isExtra
          ? "border-stone-200 bg-stone-50 opacity-80"
          : "border-stone-200 bg-white"
      }`}
    >
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic text-2xl font-semibold leading-relaxed text-stone-900"
      >
        {arabic}
      </p>
      <p className="mt-1 text-sm text-amber-700">{transliteration}</p>
      <p className="mt-0.5 text-sm text-stone-500">{english}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/components/vocabulary-card.test.tsx
```

Expected: PASS

- [ ] **Step 5: Add Arabic font utility class to globals.css**

Edit `src/app/globals.css` — add after the Tailwind directives:

```css
.font-arabic {
  font-family: "Noto Naskh Arabic", serif;
}
```

- [ ] **Step 6: Implement VocabularyTable**

Create `src/components/vocabulary-table.tsx`:

```tsx
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
```

- [ ] **Step 7: Implement RuleCard**

Create `src/components/rule-card.tsx`:

```tsx
import type { GrammarRule } from "@/lib/types";

interface RuleCardProps {
  rule: GrammarRule;
}

export function RuleCard({ rule }: RuleCardProps) {
  return (
    <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
      <h4 className="font-semibold text-amber-900">{rule.title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-amber-800 whitespace-pre-line">
        {rule.content}
      </p>
      {rule.examples && rule.examples.length > 0 && (
        <ul className="mt-2 space-y-1">
          {rule.examples.map((ex, i) => (
            <li
              key={i}
              dir="rtl"
              lang="ar"
              className="font-arabic text-base text-amber-900"
            >
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Implement ConversationDisplay**

Create `src/components/conversation-display.tsx`:

```tsx
import type { Conversation } from "@/lib/types";

interface ConversationDisplayProps {
  conversation: Conversation;
}

export function ConversationDisplay({
  conversation,
}: ConversationDisplayProps) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h4 className="mb-3 font-semibold text-stone-700">
        {conversation.title}
      </h4>
      <div className="space-y-3">
        {conversation.lines.map((line, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 ${
              i % 2 === 0
                ? "ml-0 mr-12 bg-stone-100"
                : "ml-12 mr-0 bg-amber-50"
            }`}
          >
            <p className="text-xs font-medium text-stone-400">
              {line.speaker}
            </p>
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-lg leading-relaxed text-stone-900"
            >
              {line.arabic}
            </p>
            <p className="text-sm text-amber-700">{line.transliteration}</p>
            <p className="text-sm text-stone-500">{line.english}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Implement Navigation**

Create `src/components/nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/topics", label: "Topics" },
  { href: "/lessons", label: "Lessons" },
  { href: "/vocabulary", label: "Vocabulary Bank" },
  { href: "/grammar", label: "Grammar" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-arabic text-xl font-bold text-stone-800"
        >
          القرآن
          <span className="ml-2 font-sans text-sm font-normal text-stone-500">
            Quranic Arabic
          </span>
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-amber-100 text-amber-900"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 10: Implement RefreshButton**

Create `src/components/refresh-button.tsx`:

```tsx
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
```

- [ ] **Step 11: Implement ProgressBar**

Create `src/components/progress-bar.tsx`:

```tsx
interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
}

export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="text-stone-400">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 12: Update layout to include Nav**

Edit `src/app/layout.tsx` — update the body content:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Quranic Arabic Learning",
  description: "Interactive Quranic Arabic learning companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-stone-50 font-sans antialiased`}
      >
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 13: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/components/ tests/components/ src/app/layout.tsx src/app/globals.css
git commit -m "feat: add core UI components — vocab cards, rule cards, nav, conversation display"
```

---

## Task 9: Progress Tracking Hook

**Files:**
- Create: `src/hooks/use-progress.ts`, `tests/hooks/use-progress.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/hooks/use-progress.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProgress } from "@/hooks/use-progress";

const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockLocalStorage).forEach(
    (key) => delete mockLocalStorage[key]
  );
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
    },
    writable: true,
  });
});

describe("useProgress", () => {
  it("starts with empty progress", () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.getTopicProgress("numbers")).toEqual({
      correct: 0,
      total: 0,
    });
  });

  it("records a correct answer", () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.recordAnswer("numbers", "q1", true);
    });

    expect(result.current.getTopicProgress("numbers")).toEqual({
      correct: 1,
      total: 1,
    });
  });

  it("records an incorrect answer", () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.recordAnswer("numbers", "q1", false);
    });

    expect(result.current.getTopicProgress("numbers")).toEqual({
      correct: 0,
      total: 1,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/hooks/use-progress.test.ts
```

Expected: FAIL

- [ ] **Step 3: Implement the hook**

Create `src/hooks/use-progress.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/hooks/use-progress.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/hooks/use-progress.ts tests/hooks/use-progress.test.ts
git commit -m "feat: add localStorage progress tracking hook"
```

---

## Task 10: Exercise Components

**Files:**
- Create: `src/components/exercise-feedback.tsx`, `src/components/exercise-flashcard.tsx`, `src/components/exercise-multiple-choice.tsx`, `src/components/exercise-fill-blank.tsx`, `src/components/exercise-ordering.tsx`
- Create: `tests/components/exercise-flashcard.test.tsx`, `tests/components/exercise-multiple-choice.test.tsx`, `tests/components/exercise-feedback.test.tsx`

- [ ] **Step 1: Write failing test for ExerciseFeedback**

Create `tests/components/exercise-feedback.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExerciseFeedback } from "@/components/exercise-feedback";

describe("ExerciseFeedback", () => {
  it("shows correct message when answer is right", () => {
    render(
      <ExerciseFeedback
        isCorrect={true}
        correctAnswer="وَاحِد"
        transliteration="wāḥid"
        english="one"
      />
    );
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  it("shows the correct answer when wrong", () => {
    render(
      <ExerciseFeedback
        isCorrect={false}
        correctAnswer="وَاحِد"
        transliteration="wāḥid"
        english="one"
      />
    );
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
    expect(screen.getByText("وَاحِد")).toBeInTheDocument();
    expect(screen.getByText("wāḥid")).toBeInTheDocument();
    expect(screen.getByText("one")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/components/exercise-feedback.test.tsx
```

- [ ] **Step 3: Implement ExerciseFeedback**

Create `src/components/exercise-feedback.tsx`:

```tsx
interface ExerciseFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  transliteration: string;
  english: string;
  onNext: () => void;
}

export function ExerciseFeedback({
  isCorrect,
  correctAnswer,
  transliteration,
  english,
  onNext,
}: ExerciseFeedbackProps) {
  return (
    <div
      className={`mt-4 rounded-lg p-4 ${
        isCorrect
          ? "border border-green-200 bg-green-50"
          : "border border-red-200 bg-red-50"
      }`}
    >
      <p
        className={`font-semibold ${
          isCorrect ? "text-green-800" : "text-red-800"
        }`}
      >
        {isCorrect ? "Correct!" : "Incorrect"}
      </p>
      {!isCorrect && (
        <div className="mt-2">
          <p className="text-sm text-red-700">The correct answer is:</p>
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic mt-1 text-xl text-stone-900"
          >
            {correctAnswer}
          </p>
          <p className="text-sm text-amber-700">{transliteration}</p>
          <p className="text-sm text-stone-500">{english}</p>
        </div>
      )}
      <button
        onClick={onNext}
        className="mt-3 rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700"
      >
        Next
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npx vitest run tests/components/exercise-feedback.test.tsx
```

Expected: PASS

- [ ] **Step 5: Implement ExerciseFlashcard**

Create `src/components/exercise-flashcard.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseFlashcardProps {
  entries: VocabularyEntry[];
}

export function ExerciseFlashcard({ entries }: ExerciseFlashcardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (entries.length === 0) return null;
  const entry = entries[index];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sm text-stone-400">
        {index + 1} / {entries.length}
      </div>
      <button
        onClick={() => setFlipped(!flipped)}
        className="flex h-48 w-72 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        {flipped ? (
          <div className="text-center">
            <p className="text-lg font-medium text-stone-800">
              {entry.english}
            </p>
            <p className="mt-1 text-sm text-amber-700">
              {entry.transliteration}
            </p>
          </div>
        ) : (
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-3xl font-semibold text-stone-900"
          >
            {entry.arabic}
          </p>
        )}
      </button>
      <p className="mt-2 text-xs text-stone-400">Click to flip</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            setFlipped(false);
            setIndex(Math.max(0, index - 1));
          }}
          disabled={index === 0}
          className="rounded-md bg-stone-100 px-4 py-1.5 text-sm text-stone-600 hover:bg-stone-200 disabled:opacity-30"
        >
          Previous
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setIndex(Math.min(entries.length - 1, index + 1));
          }}
          disabled={index === entries.length - 1}
          className="rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Implement ExerciseMultipleChoice**

Create `src/components/exercise-multiple-choice.tsx`:

```tsx
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

export function ExerciseMultipleChoice({
  entries,
  onAnswer,
}: ExerciseMultipleChoiceProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [question, setQuestion] = useState(() =>
    generateQuestion(entries, 0)
  );

  if (entries.length < 4) {
    return (
      <p className="text-sm text-stone-400">
        Need at least 4 vocabulary entries for multiple choice.
      </p>
    );
  }

  const answered = selected !== null;

  function handleSelect(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
    const isCorrect = question.options[optionIndex].isCorrect;
    onAnswer?.(
      `mc-${index}-${question.correctArabic}`,
      isCorrect
    );
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
      <p className="mb-1 text-sm text-stone-400">
        {index + 1} / {entries.length}
      </p>
      <p className="mb-4 text-lg font-medium text-stone-800">
        Which is the Arabic for &ldquo;{question.prompt}&rdquo;?
      </p>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={answered}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              answered && opt.isCorrect
                ? "border-green-300 bg-green-50"
                : answered && i === selected && !opt.isCorrect
                  ? "border-red-300 bg-red-50"
                  : "border-stone-200 bg-white hover:border-amber-300"
            }`}
          >
            <span
              dir="rtl"
              lang="ar"
              className="font-arabic text-lg"
            >
              {opt.arabic}
            </span>
            <span className="ml-3 text-sm text-stone-400">
              {opt.transliteration}
            </span>
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
```

- [ ] **Step 7: Implement ExerciseFillBlank**

Create `src/components/exercise-fill-blank.tsx`:

```tsx
"use client";

import { useState } from "react";
import { ExerciseFeedback } from "./exercise-feedback";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseFillBlankProps {
  entries: VocabularyEntry[];
  onAnswer?: (questionId: string, correct: boolean) => void;
}

export function ExerciseFillBlank({
  entries,
  onAnswer,
}: ExerciseFillBlankProps) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (entries.length === 0) return null;
  const entry = entries[index];

  const isCorrect =
    input.trim().toLowerCase() === entry.transliteration.toLowerCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSubmitted(true);
    onAnswer?.(`fb-${index}-${entry.arabic}`, isCorrect);
  }

  function handleNext() {
    const nextIndex = (index + 1) % entries.length;
    setIndex(nextIndex);
    setInput("");
    setSubmitted(false);
  }

  return (
    <div className="max-w-md">
      <p className="mb-1 text-sm text-stone-400">
        {index + 1} / {entries.length}
      </p>
      <p className="mb-2 text-lg font-medium text-stone-800">
        Type the transliteration for:
      </p>
      <p
        dir="rtl"
        lang="ar"
        className="font-arabic mb-4 text-3xl font-semibold text-stone-900"
      >
        {entry.arabic}
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          placeholder="Type transliteration..."
          className="w-full rounded-lg border border-stone-200 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        {!submitted && (
          <button
            type="submit"
            className="mt-2 rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700"
          >
            Check
          </button>
        )}
      </form>
      {submitted && (
        <ExerciseFeedback
          isCorrect={isCorrect}
          correctAnswer={entry.arabic}
          transliteration={entry.transliteration}
          english={entry.english}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 8: Implement ExerciseOrdering**

Create `src/components/exercise-ordering.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { VocabularyEntry } from "@/lib/types";

interface ExerciseOrderingProps {
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

export function ExerciseOrdering({
  entries,
  onAnswer,
}: ExerciseOrderingProps) {
  const [items, setItems] = useState(() =>
    shuffleArray(entries.map((e, i) => ({ ...e, correctIndex: i })))
  );
  const [checked, setChecked] = useState(false);

  const isCorrect = items.every(
    (item, i) => item.correctIndex === i
  );

  function moveItem(from: number, to: number) {
    if (checked || to < 0 || to >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setItems(updated);
  }

  function handleCheck() {
    setChecked(true);
    onAnswer?.("ordering", isCorrect);
  }

  return (
    <div className="max-w-md">
      <p className="mb-4 text-lg font-medium text-stone-800">
        Put these in the correct order:
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.arabic}
            className={`flex items-center gap-2 rounded-lg border p-3 ${
              checked
                ? item.correctIndex === i
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
                : "border-stone-200 bg-white"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveItem(i, i - 1)}
                disabled={checked || i === 0}
                className="text-xs text-stone-400 hover:text-stone-600 disabled:opacity-20"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(i, i + 1)}
                disabled={checked || i === items.length - 1}
                className="text-xs text-stone-400 hover:text-stone-600 disabled:opacity-20"
              >
                ▼
              </button>
            </div>
            <span
              dir="rtl"
              lang="ar"
              className="font-arabic text-lg"
            >
              {item.arabic}
            </span>
            <span className="text-sm text-stone-400">
              {item.transliteration}
            </span>
          </div>
        ))}
      </div>
      {!checked && (
        <button
          onClick={handleCheck}
          className="mt-4 rounded-md bg-stone-800 px-4 py-1.5 text-sm text-white hover:bg-stone-700"
        >
          Check Order
        </button>
      )}
      {checked && (
        <p
          className={`mt-4 font-semibold ${
            isCorrect ? "text-green-700" : "text-red-700"
          }`}
        >
          {isCorrect
            ? "Correct!"
            : "Not quite — try to memorize the correct order."}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/components/exercise-*.tsx tests/components/
git commit -m "feat: add exercise components — flashcard, multiple choice, fill-blank, ordering"
```

---

## Task 11: Search & Filter Component

**Files:**
- Create: `src/components/search-filter.tsx`

- [ ] **Step 1: Implement search/filter for vocabulary bank**

Create `src/components/search-filter.tsx`:

```tsx
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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Arabic, transliteration, or English..."
          className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="rounded-lg border border-stone-200 px-4 py-2 text-stone-800"
        >
          <option value="all">All Topics</option>
          {topics.map((t) => (
            <option key={t.slug} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <p className="mb-4 text-sm text-stone-400">
        {filtered.length} entries
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry, i) => (
          <VocabularyCard
            key={`${entry.arabic}-${i}`}
            arabic={entry.arabic}
            transliteration={entry.transliteration}
            english={entry.english}
            isExtra={entry.isExtra}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/components/search-filter.tsx
git commit -m "feat: add searchable, filterable vocabulary bank component"
```

---

## Task 12: Page Routes

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/topics/page.tsx`, `src/app/topics/[slug]/page.tsx`, `src/app/lessons/page.tsx`, `src/app/lessons/[id]/page.tsx`, `src/app/vocabulary/page.tsx`, `src/app/grammar/page.tsx`, `src/app/exercises/[topicSlug]/page.tsx`

- [ ] **Step 1: Implement Home/Dashboard page**

Edit `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { getContent } from "@/lib/content-cache";
import { RefreshButton } from "@/components/refresh-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let content;
  try {
    content = await getContent();
  } catch {
    return (
      <div className="text-center">
        <h1 className="font-arabic text-4xl font-bold text-stone-800">
          بِسْمِ اللَّهِ
        </h1>
        <p className="mt-2 text-stone-500">
          Welcome to Quranic Arabic Learning
        </p>
        <p className="mt-4 text-sm text-stone-400">
          Content not yet loaded. Configure your Google API credentials in
          .env.local and refresh.
        </p>
        <div className="mt-4">
          <RefreshButton />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="font-arabic text-4xl font-bold text-stone-800">
          بِسْمِ اللَّهِ
        </h1>
        <p className="mt-2 text-stone-500">
          Quranic Arabic Learning Companion
        </p>
        <div className="mt-3 flex justify-center">
          <RefreshButton />
        </div>
        <p className="mt-2 text-xs text-stone-400">
          Last updated:{" "}
          {new Date(content.lastFetched).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-700">
            Topics
          </h2>
          <div className="space-y-2">
            {content.topics.slice(0, 8).map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="block rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-amber-300"
              >
                <span className="font-medium text-stone-800">
                  {topic.name}
                </span>
                {topic.nameArabic && (
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-arabic ml-2 text-stone-400"
                  >
                    {topic.nameArabic}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-700">
            Lessons
          </h2>
          <div className="space-y-2">
            {content.lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="block rounded-lg border border-stone-200 bg-white p-3 transition-colors hover:border-amber-300"
              >
                <span className="text-sm text-stone-400">
                  Lesson {lesson.number}
                </span>
                <span className="ml-2 font-medium text-stone-800">
                  {lesson.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement Topics listing page**

Create `src/app/topics/page.tsx`:

```tsx
import Link from "next/link";
import { getContent } from "@/lib/content-cache";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  const content = await getContent();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Topics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <h2 className="font-semibold text-stone-800">{topic.name}</h2>
            {topic.nameArabic && (
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic mt-1 text-lg text-stone-500"
              >
                {topic.nameArabic}
              </p>
            )}
            <p className="mt-2 text-xs text-stone-400">
              {topic.lessonIds.length} lesson
              {topic.lessonIds.length !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement individual Topic page**

Create `src/app/topics/[slug]/page.tsx`:

```tsx
import Link from "next/link";
import { getContent } from "@/lib/content-cache";
import { VocabularyTable } from "@/components/vocabulary-table";
import { RuleCard } from "@/components/rule-card";
import { ConversationDisplay } from "@/components/conversation-display";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getContent();
  const topic = content.topics.find((t) => t.slug === slug);

  if (!topic) notFound();

  const lessons = content.lessons.filter((l) =>
    topic.lessonIds.includes(l.id)
  );

  const allVocabulary = lessons.flatMap((l) => l.vocabulary);
  const allRules = lessons.flatMap((l) => l.grammarRules);
  const allConversations = lessons.flatMap((l) => l.conversations);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">{topic.name}</h1>
        {topic.nameArabic && (
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic mt-1 text-xl text-stone-500"
          >
            {topic.nameArabic}
          </p>
        )}
      </div>

      {allVocabulary.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Vocabulary
          </h2>
          <VocabularyTable entries={allVocabulary} />
        </section>
      )}

      {allRules.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Key Rules & Tips
          </h2>
          <div className="space-y-3">
            {allRules.map((rule, i) => (
              <RuleCard key={i} rule={rule} />
            ))}
          </div>
        </section>
      )}

      {allConversations.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Conversations
          </h2>
          <div className="space-y-4">
            {allConversations.map((conv, i) => (
              <ConversationDisplay key={i} conversation={conv} />
            ))}
          </div>
        </section>
      )}

      {allVocabulary.length >= 4 && (
        <section>
          <Link
            href={`/exercises/${slug}`}
            className="inline-block rounded-lg bg-amber-100 px-6 py-3 font-medium text-amber-900 transition-colors hover:bg-amber-200"
          >
            Practice Exercises
          </Link>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Implement Lessons listing page**

Create `src/app/lessons/page.tsx`:

```tsx
import Link from "next/link";
import { getContent } from "@/lib/content-cache";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const content = await getContent();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Lessons</h1>
      <div className="space-y-3">
        {content.lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className="block rounded-lg border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <span className="text-sm font-medium text-amber-700">
              Lesson {lesson.number}
            </span>
            <h2 className="mt-1 text-lg font-semibold text-stone-800">
              {lesson.title}
            </h2>
            {lesson.titleArabic && (
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic mt-1 text-stone-500"
              >
                {lesson.titleArabic}
              </p>
            )}
            <p className="mt-2 text-xs text-stone-400">
              {lesson.vocabulary.length} vocabulary entries
              {lesson.grammarRules.length > 0 &&
                ` · ${lesson.grammarRules.length} rules`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement individual Lesson page**

Create `src/app/lessons/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { getContent } from "@/lib/content-cache";
import { VocabularyTable } from "@/components/vocabulary-table";
import { RuleCard } from "@/components/rule-card";
import { ConversationDisplay } from "@/components/conversation-display";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = await getContent();
  const lesson = content.lessons.find((l) => l.id === id);

  if (!lesson) notFound();

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-medium text-amber-700">
          Lesson {lesson.number}
        </p>
        <h1 className="text-2xl font-bold text-stone-800">
          {lesson.title}
        </h1>
        {lesson.titleArabic && (
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic mt-1 text-xl text-stone-500"
          >
            {lesson.titleArabic}
          </p>
        )}
      </div>

      {lesson.vocabulary.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Vocabulary
          </h2>
          <VocabularyTable entries={lesson.vocabulary} />
        </section>
      )}

      {lesson.grammarRules.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Key Rules & Tips
          </h2>
          <div className="space-y-3">
            {lesson.grammarRules.map((rule, i) => (
              <RuleCard key={i} rule={rule} />
            ))}
          </div>
        </section>
      )}

      {lesson.conversations.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-stone-700">
            Conversations
          </h2>
          <div className="space-y-4">
            {lesson.conversations.map((conv, i) => (
              <ConversationDisplay key={i} conversation={conv} />
            ))}
          </div>
        </section>
      )}

      {lesson.vocabulary.length >= 4 && (
        <section>
          <Link
            href={`/exercises/${lesson.topicSlugs[0]}`}
            className="inline-block rounded-lg bg-amber-100 px-6 py-3 font-medium text-amber-900 transition-colors hover:bg-amber-200"
          >
            Practice Exercises
          </Link>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Implement Vocabulary Bank page**

Create `src/app/vocabulary/page.tsx`:

```tsx
import { getContent } from "@/lib/content-cache";
import { SearchFilter } from "@/components/search-filter";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const content = await getContent();
  const allEntries = content.lessons.flatMap((l) => l.vocabulary);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">
        Vocabulary Bank
      </h1>
      <SearchFilter entries={allEntries} topics={content.topics} />
    </div>
  );
}
```

- [ ] **Step 7: Implement Grammar Reference page**

Create `src/app/grammar/page.tsx`:

```tsx
import { getContent } from "@/lib/content-cache";
import { RuleCard } from "@/components/rule-card";

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const content = await getContent();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">
        Grammar & Key Rules
      </h1>
      <div className="space-y-6">
        {content.lessons
          .filter((l) => l.grammarRules.length > 0)
          .map((lesson) => (
            <section key={lesson.id}>
              <h2 className="mb-3 text-lg font-semibold text-stone-700">
                Lesson {lesson.number}: {lesson.title}
              </h2>
              <div className="space-y-3">
                {lesson.grammarRules.map((rule, i) => (
                  <RuleCard key={i} rule={rule} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Implement Exercises page**

Create `src/app/exercises/[topicSlug]/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { ExerciseFlashcard } from "@/components/exercise-flashcard";
import { ExerciseMultipleChoice } from "@/components/exercise-multiple-choice";
import { ExerciseFillBlank } from "@/components/exercise-fill-blank";
import { ExerciseOrdering } from "@/components/exercise-ordering";
import { ProgressBar } from "@/components/progress-bar";
import { useProgress } from "@/hooks/use-progress";
import type { VocabularyEntry } from "@/lib/types";

type ExerciseType = "flashcard" | "multiple-choice" | "fill-blank" | "ordering";

export default function ExercisesPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const [topicSlug, setTopicSlug] = useState("");
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [activeType, setActiveType] = useState<ExerciseType>("flashcard");
  const [loading, setLoading] = useState(true);
  const { recordAnswer, getTopicProgress } = useProgress();

  useEffect(() => {
    params.then(({ topicSlug: slug }) => {
      setTopicSlug(slug);
      fetch(`/api/refresh`)
        .then(() => fetch("/api/content"))
        .catch(() => {});
    });
  }, [params]);

  useEffect(() => {
    if (!topicSlug) return;
    // Fetch content from a simple API or use cached data
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

  if (loading) {
    return <p className="text-stone-400">Loading exercises...</p>;
  }

  if (entries.length < 4) {
    return (
      <p className="text-stone-400">
        Not enough vocabulary entries for exercises (need at least 4).
      </p>
    );
  }

  const progress = getTopicProgress(topicSlug);

  const exerciseTypes: { key: ExerciseType; label: string }[] = [
    { key: "flashcard", label: "Flashcards" },
    { key: "multiple-choice", label: "Multiple Choice" },
    { key: "fill-blank", label: "Fill in the Blank" },
    { key: "ordering", label: "Ordering" },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-stone-800">
        Practice: {topicSlug.replace(/-/g, " ")}
      </h1>

      {progress.total > 0 && (
        <div className="mb-6 max-w-xs">
          <ProgressBar
            label="Accuracy"
            value={progress.correct}
            max={progress.total}
          />
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {exerciseTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setActiveType(type.key)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              activeType === type.key
                ? "bg-amber-100 text-amber-900"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {activeType === "flashcard" && (
        <ExerciseFlashcard entries={entries} />
      )}
      {activeType === "multiple-choice" && (
        <ExerciseMultipleChoice
          entries={entries}
          onAnswer={(qid, correct) =>
            recordAnswer(topicSlug, qid, correct)
          }
        />
      )}
      {activeType === "fill-blank" && (
        <ExerciseFillBlank
          entries={entries}
          onAnswer={(qid, correct) =>
            recordAnswer(topicSlug, qid, correct)
          }
        />
      )}
      {activeType === "ordering" && (
        <ExerciseOrdering
          entries={entries}
          onAnswer={(qid, correct) =>
            recordAnswer(topicSlug, qid, correct)
          }
        />
      )}
    </div>
  );
}
```

- [ ] **Step 9: Add topic-vocab API route for exercises page**

Create `src/app/api/topic-vocab/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getContent } from "@/lib/content-cache";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ entries: [] });
  }

  try {
    const content = await getContent();
    const topic = content.topics.find((t) => t.slug === slug);
    if (!topic) {
      return NextResponse.json({ entries: [] });
    }

    const lessons = content.lessons.filter((l) =>
      topic.lessonIds.includes(l.id)
    );
    const entries = lessons.flatMap((l) =>
      l.vocabulary.filter((v) => !v.isExtra)
    );

    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] });
  }
}
```

- [ ] **Step 10: Verify the app builds**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npm run build
```

Note: The build may show warnings about missing Google API credentials — this is expected. The app handles this gracefully by showing the "Content not yet loaded" state.

- [ ] **Step 11: Commit**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add src/app/
git commit -m "feat: add all page routes — home, topics, lessons, vocabulary, grammar, exercises"
```

---

## Task 13: Google Service Account Setup & First Sync

**Files:**
- Modify: `.env.local`

This task requires manual steps in the Google Cloud Console.

- [ ] **Step 1: Create Google Cloud project and enable Docs API**

1. Go to https://console.cloud.google.com/
2. Create a new project (or use an existing one)
3. Enable the "Google Docs API" from the APIs & Services library
4. Go to "Credentials" > "Create Credentials" > "Service Account"
5. Give it a name like "quranic-arabic-reader"
6. Download the JSON key file

- [ ] **Step 2: Share the Google Doc with the service account**

1. Copy the `client_email` from the downloaded JSON key (looks like `name@project.iam.gserviceaccount.com`)
2. Open your Google Doc
3. Click "Share" and add the service account email as a Viewer

- [ ] **Step 3: Update `.env.local` with credentials**

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DOC_ID=1wqbU7rsLUm0wqCjQPS2PbtCTThZOxnE2CnClxa8DETc
```

- [ ] **Step 4: Test the sync locally**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npm run dev
```

Open `http://localhost:3000` and click "Refresh Content". Verify that lessons appear.

- [ ] **Step 5: Run all tests**

```bash
cd /Users/nievesyang/quranic-arabic-learning
npm test
```

Expected: All tests pass.

---

## Task 14: Vercel Deployment

**Files:**
- None (deployment configuration)

- [ ] **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 2: Link and deploy**

```bash
cd /Users/nievesyang/quranic-arabic-learning
vercel
```

Follow the prompts to link to your Vercel account.

- [ ] **Step 3: Set environment variables on Vercel**

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_DOC_ID
```

- [ ] **Step 4: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 5: Set up Vercel Cron for 4-hour refresh**

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/refresh",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

Update `src/app/api/refresh/route.ts` to accept GET for cron:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { refreshContent } from "@/lib/content-cache";

async function handleRefresh() {
  try {
    const content = await refreshContent();
    return NextResponse.json({
      success: true,
      lastFetched: content.lastFetched,
      lessonCount: content.lessons.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to refresh content" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return handleRefresh();
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handleRefresh();
}
```

- [ ] **Step 6: Add CRON_SECRET to Vercel**

```bash
vercel env add CRON_SECRET
```

Generate a random string for the secret.

- [ ] **Step 7: Commit and deploy**

```bash
cd /Users/nievesyang/quranic-arabic-learning
git add vercel.json src/app/api/refresh/route.ts
git commit -m "feat: add Vercel cron job for 4-hour content refresh"
vercel --prod
```

- [ ] **Step 8: Verify deployed site works**

Open the Vercel URL and verify:
1. Home page loads with lessons
2. Topics and lessons navigation works
3. Vocabulary bank search works
4. Exercises work with instant feedback
5. Refresh button triggers a re-sync
