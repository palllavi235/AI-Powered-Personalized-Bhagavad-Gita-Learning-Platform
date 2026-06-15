import { LocalLibrary } from "@/components/local-library";

export default function ProgressPage() {
  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Reading history</p>
        <h1 className="mt-2 text-4xl font-semibold">Reading Progress</h1>
      </div>
      <LocalLibrary type="progress" />
    </div>
  );
}
