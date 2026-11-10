import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-medium text-brand-soft">404 · NOT FOUND</p>
        <h1 className="mt-3 text-3xl font-semibold">That page isn’t here.</h1>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold">
          Back to AlgoMate
        </Link>
      </div>
    </main>
  );
}
