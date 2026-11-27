"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createContactRecord,
  normalizeScene,
  type Contact,
  type ContactDraft,
} from "@/lib/contacts";

const STORAGE_KEY = "judou.contacts.v1";

interface StoredContacts {
  contacts: Contact[];
  activeId: string | null;
}

function readStoredContacts(): StoredContacts {
  if (typeof window === "undefined") {
    return { contacts: [], activeId: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { contacts: [], activeId: null };
    }

    const parsed = JSON.parse(raw) as Partial<StoredContacts>;
    const contacts = Array.isArray(parsed.contacts)
      ? parsed.contacts.filter(
          (item): item is Contact =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.name === "string",
        )
          .map((item) => ({ ...item, scene: normalizeScene(item.scene) }))
      : [];
    const activeId = contacts.some((item) => item.id === parsed.activeId)
      ? (parsed.activeId ?? null)
      : null;

    return { contacts, activeId };
  } catch {
    return { contacts: [], activeId: null };
  }
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredContacts();
    setContacts(stored.contacts);
    setActiveId(stored.activeId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ contacts, activeId } satisfies StoredContacts),
    );
  }, [activeId, contacts, hydrated]);

  const activeContact = useMemo(
    () => contacts.find((contact) => contact.id === activeId) ?? null,
    [activeId, contacts],
  );

  function addContact(draft: ContactDraft): Contact {
    const contact = createContactRecord(draft);
    setContacts((current) => [...current, contact]);
    setActiveId(contact.id);
    return contact;
  }

  function updateContact(id: string, patch: Partial<ContactDraft>) {
    setContacts((current) =>
      current.map((contact) =>
        contact.id === id
          ? { ...contact, ...patch, updatedAt: Date.now() }
          : contact,
      ),
    );
  }

  function removeContact(id: string) {
    setContacts((current) => current.filter((contact) => contact.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  }

  function selectContact(id: string | null) {
    setActiveId(id);
  }

  return {
    contacts,
    activeId,
    activeContact,
    hydrated,
    addContact,
    updateContact,
    removeContact,
    selectContact,
  };
}
