"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Something went wrong.</h1>
        <p className="mt-2 text-sm text-muted">The page couldn’t be loaded. Please try again.</p>
        <button onClick={reset} className="mt-5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold">
          Try again
        </button>
      </div>
    </main>
  );
}
