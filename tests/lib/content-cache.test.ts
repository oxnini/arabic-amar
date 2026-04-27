import { describe, it, expect, vi, beforeEach } from "vitest";
import { readCache, writeCache, isCacheStale } from "@/lib/content-cache";
import fs from "fs/promises";

vi.mock("fs/promises", () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
  },
}));

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
