"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const reasons = [
  "Daily Bhagavad Gita Study",
  "Discipline",
  "Career & Purpose",
  "Anxiety & Overthinking",
  "Relationships",
  "Self Growth",
  "Spiritual Learning",
  "Not Sure Yet"
];

const learningModes = ["Read sequentially", "Explore topics", "Ask questions", "Daily reflections", "Mixed mode"];

export function OnboardingForm() {
  const router = useRouter();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [learningMode, setLearningMode] = useState("Mixed mode");
  const [saving, setSaving] = useState(false);

  function toggleReason(reason: string) {
    setSelectedReasons((current) =>
      current.includes(reason) ? current.filter((item) => item !== reason) : [...current, reason]
    );
  }

  async function save() {
    setSaving(true);
    const preferences = { reasons: selectedReasons, learningMode };
    const response = await fetch("/api/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preferences)
    }).catch(() => null);
    if (response?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Why are you here?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {reasons.map((reason) => (
            <button
              key={reason}
              className={cn(
                "flex min-h-12 items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition hover:bg-muted",
                selectedReasons.includes(reason) && "border-primary bg-[#fff4c7]"
              )}
              onClick={() => toggleReason(reason)}
            >
              {reason}
              {selectedReasons.includes(reason) && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How would you like to learn?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {learningModes.map((mode) => (
            <button
              key={mode}
              className={cn(
                "rounded-full border border-border bg-card px-3 py-2 text-sm transition hover:bg-muted",
                learningMode === mode && "border-primary bg-primary text-primary-foreground"
              )}
              onClick={() => setLearningMode(mode)}
            >
              {mode}
            </button>
          ))}
        </CardContent>
      </Card>

      <Button size="lg" onClick={save} disabled={saving || selectedReasons.length === 0}>
        {saving ? "Saving..." : "Enter YUDHSVAH"}
      </Button>
    </div>
  );
}
