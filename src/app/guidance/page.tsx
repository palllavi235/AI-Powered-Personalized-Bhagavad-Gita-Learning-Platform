import { GuidanceChat } from "@/components/guidance-chat";

export default function GuidancePage() {
  return (
    <div className="container-page py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm text-muted-foreground">Seeker mode</p>
        <h1 className="mt-2 text-4xl font-semibold">Seek Guidance</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          Ask in your own words. The response is generated only from retrieved verses, translations, and commentaries in your dataset.
        </p>
      </div>
      <GuidanceChat />
    </div>
  );
}
