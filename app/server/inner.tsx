export default function Home() {
  return (
    <div className="flex flex-col gap-4 rounded-md bg-slate-200 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-100">
      <p className="text-base font-semibold">Convex server demo is disabled</p>
      <p>
        This route is reserved for future experiments that require additional
        Convex functions. Remove this page or replace it with your own content
        once you are ready to expose server-rendered data.
      </p>
    </div>
  );
}
