"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verseRef } from "@/lib/utils";
import type { GuidanceAnswer } from "@/lib/types";

const examples = [
  "I am afraid of failure.",
  "I feel lost.",
  "I cannot stay disciplined.",
  "I keep comparing myself to others.",
  "I cannot control my mind.",
  "I am grieving a loss."
];

export function GuidanceChat() {
  const [question, setQuestion] = useState("I am afraid of failure.");
  const [answer, setAnswer] = useState<GuidanceAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(nextQuestion = question) {
    if (!nextQuestion.trim()) return;
    setLoading(true);
    setError("");
    setAnswer(null);
    try {
      const response = await fetch("/api/guidance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: nextQuestion })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Guidance failed.");
      setAnswer(data);
    } catch (event) {
      setError(event instanceof Error ? event.message : "Guidance failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Ask about an inner battle</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
          <Button className="mt-3 w-full" onClick={() => ask()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowUp className="h-4 w-4" aria-hidden="true" />}
            Retrieve guidance
          </Button>
          <div className="mt-5 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
                onClick={() => {
                  setQuestion(example);
                  void ask(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-md border border-border bg-[#fff4c7] p-4 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mb-2 h-5 w-5 text-accent" aria-hidden="true" />
            YUDHSVAH does not invent teachings. If a reliable source match is not found, it will say so.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {!answer && !loading && (
          <Card>
            <CardContent className="pt-5">
              <p className="leading-7 text-muted-foreground">Your answer will appear here with retrieved verses, translations, commentaries, and source attribution.</p>
            </CardContent>
          </Card>
        )}
        {loading && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-5 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Searching the dataset for source-backed guidance...
            </CardContent>
          </Card>
        )}
        {answer && (
          <>
            {answer.safetyNote && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{answer.safetyNote}</div>}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {answer.themes.map((theme) => (
                    <Badge key={theme}>{theme}</Badge>
                  ))}
                </div>
                <CardTitle>Grounded answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <ResponseSection title="Understanding the Concern" text={answer.sections.understanding} />
                <ResponseSection title="What the Gita Suggests" text={answer.sections.gitaSuggestion} />
                <ResponseSection title="Explanation in plain modern language" text={answer.sections.plainExplanation} />
                <ResponseSection title="Practical Reflection" text={answer.sections.practicalReflection} />
              </CardContent>
            </Card>
            <div className="grid gap-3">
              {answer.sources.map((source) => (
                <Card key={source.verse.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>Bhagavad Gita {verseRef(source.verse.chapter_number, source.verse.verse_number)}</Badge>
                      <Badge>{source.retrievalMode}</Badge>
                      <Badge>score {Math.round(source.score)}</Badge>
                    </div>
                    <CardTitle className="text-base">
                      <Link href={`/verse/${source.verse.id}`} className="hover:underline">
                        {source.chapter?.name_translation ?? "Source verse"}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-6 text-muted-foreground">{source.translations[0]?.description ?? source.verse.transliteration}</p>
                    <details className="rounded-md border border-border bg-card p-3">
                      <summary className="cursor-pointer text-sm font-medium">View source details</summary>
                      <div className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                        <p>{source.reason}</p>
                        {source.commentaries.map((commentary) => (
                          <p key={commentary.id}>
                            <span className="font-medium text-foreground">{commentary.authorName}:</span> {commentary.description}
                          </p>
                        ))}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResponseSection({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
    </section>
  );
}
