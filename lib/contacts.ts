import type { Gender, Scene } from "@/lib/types";

export interface Contact {
  id: string;
  name: string;
  gender: Gender;
  scene: Scene;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type ContactDraft = Omit<Contact, "id" | "createdAt" | "updatedAt">;

export const EMPTY_CONTACT_DRAFT: ContactDraft = {
  name: "",
  gender: "unknown",
  scene: "flirt",
  notes: "",
};

export function getContactLabel(contact: Contact): string {
  return contact.name.trim() || "未命名对象";
}

export function createContactRecord(draft: ContactDraft): Contact {
  const now = Date.now();
  return {
    ...draft,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `contact-${now}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
}
