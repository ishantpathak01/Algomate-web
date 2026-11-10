import type { MentorProfile } from "@/types/mentor";

export default function MentorCard({ mentor }: { mentor: MentorProfile }) {
  return (
    <article className="rounded-2xl border border-line bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-emerald-300">{mentor.approvalStatus}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{mentor.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {mentor.skills.map((skill) => (
          <li key={skill} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            {skill}
          </li>
        ))}
      </ul>
    </article>
  );
}
