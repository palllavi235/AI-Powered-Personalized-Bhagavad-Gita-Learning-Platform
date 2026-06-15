"use client";

import { useMemo, useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Commentary, Translation } from "@/lib/types";

type Props = {
  verseId: number;
  reference: string;
  translations: Translation[];
  commentaries: Commentary[];
};

const tabs = ["Translations", "Commentaries"] as const;
const languages = ["english", "hindi", "sanskrit", "all"];

export function VerseSourceTabs({ verseId, reference, translations, commentaries }: Props) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Translations");
  const [language, setLanguage] = useState("english");
  const [copied, setCopied] = useState(false);

  const filteredTranslations = useMemo(
    () => translations.filter((item) => language === "all" || item.lang === language),
    [language, translations]
  );
  const filteredCommentaries = useMemo(
    () => commentaries.filter((item) => language === "all" || item.lang === language),
    [commentaries, language]
  );

  async function share() {
    const url = `${window.location.origin}/verse/${verseId}`;
    if (navigator.share) {
      await navigator.share({ title: `Bhagavad Gita ${reference}`, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              className={`rounded-md px-3 py-2 text-sm font-medium ${tab === item ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <Button variant="secondary" onClick={share}>
          {copied ? <Copy className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied" : "Share"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {languages.map((item) => (
          <button
            key={item}
            className={`rounded-full border border-border px-3 py-1 text-xs uppercase ${language === item ? "bg-[#fff4c7] text-foreground" : "bg-card text-muted-foreground"}`}
            onClick={() => setLanguage(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Translations" && (
        <div className="space-y-3">
          {filteredTranslations.map((translation) => (
            <article key={translation.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{translation.authorName}</p>
                <Badge>{translation.lang}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{translation.description}</p>
            </article>
          ))}
        </div>
      )}

      {tab === "Commentaries" && (
        <div className="space-y-3">
          {filteredCommentaries.map((commentary) => (
            <details key={commentary.id} className="rounded-md border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                {commentary.authorName} <span className="ml-2 text-xs uppercase text-muted-foreground">{commentary.lang}</span>
              </summary>
              <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{commentary.description}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
