"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-slate-700">An unexpected error occurred. Please try again.</p>
      <button onClick={reset} className="mt-4 rounded bg-brand-700 px-4 py-2 text-white">Try again</button>
    </div>
  );
}
