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
