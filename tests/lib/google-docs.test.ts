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
      GoogleAuth: vi.fn().mockImplementation(function () {
        return { getClient: vi.fn().mockResolvedValue({}) };
      }),
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
