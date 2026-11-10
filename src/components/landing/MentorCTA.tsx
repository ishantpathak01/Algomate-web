import Link from "next/link";

export default function MentorCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="rounded-3xl border border-brand/25 bg-card px-6 py-10 text-center sm:px-10 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-soft">Share what you know</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Interested in becoming a mentor?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
          Help aspiring developers grow by sharing your experience, reviewing their goals, and guiding their next steps.
          Create an account to get started with a mentor application.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup/mentor"
            className="rounded-xl bg-brand px-6 py-3 font-semibold transition hover:bg-[#8b6cff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Sign up to become a mentor
          </Link>
          <Link
            href="/login/mentor"
            className="rounded-xl border border-line bg-black/20 px-6 py-3 font-semibold transition hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
