import { LocalLibrary } from "@/components/local-library";

export default function BookmarksPage() {
  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Personal library</p>
        <h1 className="mt-2 text-4xl font-semibold">Bookmarks</h1>
      </div>
      <LocalLibrary type="bookmarks" />
    </div>
  );
}
