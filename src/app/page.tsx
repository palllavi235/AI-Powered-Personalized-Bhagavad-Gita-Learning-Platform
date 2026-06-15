import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { icon: BookOpen, title: "Deep reading", text: "Browse chapters, verses, translations, word meanings, and commentaries from your dataset." },
  { icon: Brain, title: "Guidance retrieval", text: "Ask about fear, discipline, purpose, comparison, or failure and receive cited source matches." },
  { icon: ShieldCheck, title: "No invented teachings", text: "Every answer is limited to retrieved verses, translations, and commentaries." }
];

export default function LandingPage() {
  return (
    <div>
      <section className="container-page grid min-h-[calc(100vh-64px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="mr-2 h-4 w-4 text-accent" aria-hidden="true" />
            Wisdom for the battle inside
          </div>
          <h1 className="text-5xl font-semibold leading-tight tracking-normal text-foreground md:text-7xl">
            YUDHSVAH
          </h1>
          <p className="mt-3 text-2xl font-medium text-muted-foreground">Fight Within</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Every person is carrying an inner battle. YUDHSVAH helps readers and seekers explore authentic Bhagavad Gita wisdom with calm design, careful retrieval, and visible sources.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="lg">
                Enter Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/guidance">
              <Button size="lg" variant="secondary">Seek Guidance</Button>
            </Link>
          </div>
        </div>
        <div className="surface rounded-lg p-6">
          <div className="rounded-md border border-border bg-[#fff4c7] p-5">
            <p className="text-sm font-medium text-muted-foreground">Example seeker question</p>
            <p className="mt-4 text-3xl font-semibold leading-snug">“I am afraid of failure.”</p>
          </div>
          <div className="mt-5 grid gap-3">
            {["Detect the theme", "Retrieve verses", "Attach translations", "Explain with citations"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[#fff8df]/70 py-16">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold">Reader Journey</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Study by chapter, move verse by verse, compare translations, read commentaries, bookmark what matters, and keep notes as your understanding deepens.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold">Seeker Journey</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Share an internal challenge in plain language. The system retrieves relevant sources and gives a grounded explanation with clear attribution.
          </p>
        </div>
      </section>
    </div>
  );
}
