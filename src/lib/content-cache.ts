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
