# Quranic Arabic Learning Website — Design Spec

## Overview

A personal Arabic learning website for studying Quranic (Classical/Fusha) Arabic. Content is sourced from a single Google Doc that serves as the course companion, containing vocabulary tables, grammar rules, example conversations, and worksheets. The website auto-syncs with the doc every 4 hours and presents the content as an interactive, structured learning tool.

The site is for personal use initially, designed so it can be shared with classmates or made public later without a rebuild.

## Content Source

- **Single Google Doc** containing all lessons in order
- Doc ID: `1wqbU7rsLUm0wqCjQPS2PbtCTThZOxnE2CnClxa8DETc`
- The doc is actively updated as the course progresses
- All Arabic text includes full tashkeel (diacritics): fatha, kasra, damma, sukun, shadda, tanween, etc.
- Transliteration is provided in the doc alongside Arabic — the website must use the doc's transliteration exactly, never auto-generate

## Content Model

The parser extracts the following content types from the doc:

### Lessons

- Identified by headings (e.g., "Lesson 7 - 8: Getting to know each other")
- Each lesson has a number/range, English title, and Arabic title
- Lessons contain a mix of the content types below

### Vocabulary Entries

- Structured as tables with columns: Category, Arabic, Pronunciation, English
- Grouped by category (e.g., Greetings, Introductory Terms, Basic Responses)
- Categories may have sub-categories (e.g., Body Parts > Head, Upper Body, Core, Lower Body)
- Some entries are marked as "Extra Vocabulary" or "Bonus" — these are secondary content, still displayed but visually distinguished and collapsible

### Grammar Rules & Tips

- Key rules for forming numbers, masculine vs. feminine nouns, sentence structure, etc.
- Must be prominently displayed — not buried in prose
- Rendered as visually distinct "rule cards" within each lesson/topic

### Example Conversations

- Dialogues between speakers (e.g., two people introducing themselves)
- Displayed in a dialogue format with speaker labels

### Reference Tables

- Countries & nationalities, continents, compass directions, prepositions
- Larger, structured data sets that serve as lookup references

### Exercises

- Multiple choice, image matching, fill-in-the-blank, ordering/sequencing, conversation completion, labeling
- Each exercise has questions and correct answers
- Adapted from the doc's worksheets — handwriting practice sections become typing or recognition exercises on the web

## Data Flow

1. Every 4 hours, the server calls the Google Docs API and fetches the document
2. The parser processes the doc's structure:
   - **Headings** determine lesson boundaries and titles
   - **Tables** become vocabulary entries, grouped by category
   - **Distinct sections** become grammar rules, conversations, exercises
3. If content has changed, the parsed JSON cache is regenerated
4. The website serves pages from this cached JSON
5. A manual "Refresh" button on the site triggers an immediate re-fetch

The parser is convention-based, not hardcoded to specific lessons. It follows the doc's heading hierarchy and table structures, so new lessons with different topics and structures are picked up automatically.

## Site Structure & Navigation

### Primary: Topic-Based

Main menu organized by themes derived from the doc's content:

- Body Parts
- Numbers & Digits
- Time
- Days of the Week
- Islamic & Gregorian Months
- Getting to Know Each Other
- Countries & Nationalities
- Grammar & Key Rules
- (New topics appear automatically as they're added to the doc)

Each topic page contains its vocabulary, grammar rules/tips, example conversations, and exercises in one place.

### Secondary: Lesson Path

A "Lessons" section for linear progression (Lesson 1, 2, 3...) matching the course order. Links to the same content but presented sequentially.

### Standalone Pages

- **Vocabulary Bank** — searchable, filterable read-only list of all vocabulary across all lessons. Filterable by topic, searchable across Arabic, English, and transliteration
- **Grammar Reference** — all key rules and tips collected in one place, organized by topic
- **Home / Dashboard** — landing page showing topics, lesson list, and progress overview

## Exercise System

### Types (ordered from simplest to hardest)

**Beginner:**
- **Flashcards** — flip between Arabic and English/transliteration
- **Multiple choice** — select the correct Arabic/English from 3-4 options
- **Image matching** — show a picture, pick the correct Arabic word

**Intermediate:**
- **Fill in the blank** — type the Arabic or transliteration for a given word
- **Ordering/sequencing** — put items in correct order (months, numbers, etc.)
- **Conversation completion** — fill in missing parts of a dialogue

### Difficulty Progression

Within each topic, exercises are ordered from easiest to hardest. All types are available (no gating), but the sequence encourages starting simple.

### Feedback & Progress

- **Instant feedback** — when an answer is wrong, immediately show the correct answer with Arabic (full tashkeel), transliteration, and English meaning
- **Progress tracking per topic and per lesson** — completion percentage and accuracy stats
- Progress stored in browser localStorage (no login required)
- Progress data model designed so it can later migrate to a database when user accounts are added

## Visual Design

### Overall Feel

Modern and practical with subtle traditional touches. Warm neutral background, clean typography, with occasional calligraphic or geometric pattern accents inspired by Islamic art. Inviting enough to encourage daily return visits, not generic or sterile.

### Arabic Text Display

- Arabic rendered in Noto Naskh Arabic (Google Fonts) — excellent tashkeel/diacritics support
- Right-to-left alignment for Arabic text
- Vocabulary entries displayed consistently:
  - **Line 1:** Arabic with diacritics — largest, most prominent
  - **Line 2:** Transliteration — medium size, slightly muted
  - **Line 3:** English meaning — smaller

### Key Visual Elements

- **Rule cards** — grammar rules/tips in highlighted cards with subtle gold/amber border
- **Category headers** — clear visual separation between vocabulary groups
- **Extra vocabulary** — collapsible section with slightly muted styling
- **Conversations** — dialogue bubble or side-by-side speaker format
- **Exercises** — clean, uncluttered, with clear correct/incorrect feedback
- **Responsive** — works well on desktop and mobile for studying on the go

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Next.js | Handles both site rendering and API routes |
| Hosting | Vercel | Free tier, automatic deploys |
| Data source | Google Docs API | Fetches doc every 4 hours + manual refresh |
| Content cache | JSON files on server | Fast reads, no database needed |
| Progress storage | Browser localStorage | No auth needed for personal use |
| Styling | Tailwind CSS | Rapid styling with custom theme |
| Arabic font | Noto Naskh Arabic (Google Fonts) | Free, excellent diacritics support |

### Future-Proofing

- No database or auth now — added later when sharing publicly or adding user accounts
- Progress data model is structured so it can migrate from localStorage to a database
- Site architecture supports multiple users without a rebuild — just add auth layer and database

## Out of Scope (for now)

- User accounts / authentication
- Audio pronunciation
- Spaced repetition algorithm
- Mobile app (responsive web is sufficient)
- Multi-language support beyond Arabic/English
