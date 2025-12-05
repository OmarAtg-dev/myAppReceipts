import Home from "./inner";

export default function ServerPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-center text-4xl font-bold">Convex + Next.js</h1>
      <p className="text-center text-base text-slate-600 dark:text-slate-300">
        Server-driven data demos have been temporarily disabled until the
        required Convex functions are implemented.
      </p>
      <Home />
    </main>
  );
}
