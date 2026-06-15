"use client";

import { useEffect, useState } from "react";
import { Bookmark, Highlighter, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const highlightKey = "yudhsvah.highlights";

function readNumberArray(key: string) {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as number[];
  } catch {
    return [];
  }
}

function writeNumberArray(key: string, values: number[]) {
  localStorage.setItem(key, JSON.stringify([...new Set(values)]));
}

export function VerseActions({ verseId }: { verseId: number }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setHighlighted(readNumberArray(highlightKey).includes(verseId));
    fetch("/api/bookmarks")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setBookmarked(Boolean(data?.bookmarks?.includes(verseId))))
      .catch(() => undefined);
    fetch(`/api/notes?verseId=${verseId}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setNote(data?.notes?.[0]?.note ?? ""))
      .catch(() => undefined);
    fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verseId })
    }).catch(() => undefined);
  }, [verseId]);

  async function toggleBookmark() {
    setBookmarked(!bookmarked);
    const response = await fetch("/api/bookmarks", {
      method: bookmarked ? "DELETE" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verseId })
    }).catch(() => null);
    if (!response?.ok) {
      setBookmarked(bookmarked);
      setMessage("Login is required to save bookmarks.");
    }
  }

  function toggleHighlight() {
    const current = readNumberArray(highlightKey);
    writeNumberArray(highlightKey, highlighted ? current.filter((id) => id !== verseId) : [...current, verseId]);
    setHighlighted(!highlighted);
  }

  async function saveNote() {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verseId, note })
    }).catch(() => null);
    if (!response?.ok) {
      setMessage("Login is required to save notes.");
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={bookmarked ? "primary" : "secondary"} onClick={toggleBookmark}>
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        <Button variant={highlighted ? "primary" : "secondary"} onClick={toggleHighlight}>
          <Highlighter className="h-4 w-4" aria-hidden="true" />
          {highlighted ? "Highlighted" : "Highlight"}
        </Button>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="note">Personal note</label>
        <Textarea id="note" className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Write a reflection for this verse." />
        <Button className="mt-3" variant="secondary" onClick={saveNote}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saved ? "Saved" : "Save note"}
        </Button>
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
