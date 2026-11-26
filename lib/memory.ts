export interface MemoryEntry {
  contactId: string;
  kind: "reply";
  summary: string;
  createdAt: number;
}

const STORAGE_KEY = "judou.memory.v1";
const MAX_PER_CONTACT = 5;
const MAX_TOTAL = 40;

function readAll(): MemoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is MemoryEntry =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as MemoryEntry).contactId === "string" &&
        typeof (item as MemoryEntry).summary === "string" &&
        typeof (item as MemoryEntry).createdAt === "number",
    );
  } catch {
    return [];
  }
}

export function getContactMemory(contactId: string): MemoryEntry[] {
  return readAll()
    .filter((item) => item.contactId === contactId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_PER_CONTACT);
}

export function appendMemory(entry: MemoryEntry): MemoryEntry[] {
  const all = readAll().filter((item) => item.contactId !== entry.contactId);
  const current = getContactMemory(entry.contactId);
  const next = [entry, ...current].slice(0, MAX_PER_CONTACT);
  const merged = [...all, ...next]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_TOTAL);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  return next;
}

export function formatMemory(entries: MemoryEntry[]): string {
  return entries
    .map(
      (item) =>
        `- ${item.kind === "reply" ? "上次回复" : "上次主动开口"}：${item.summary}`,
    )
    .join("\n");
}
