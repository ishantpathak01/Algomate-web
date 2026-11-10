import SectionTitle from "@/components/ui/SectionTitle";

const topics = [
  "Arrays", "Strings", "Hashing", "Linked Lists", "Stacks & Queues", "Recursion", "Binary Search",
  "Trees", "Heaps", "Graphs", "Dynamic Programming", "Greedy", "Backtracking", "Tries", "Bit Manipulation", "SQL",
];

export default function Topics() {
  return (
    <section id="topics" className="mx-auto max-w-4xl px-5 py-12">
      <SectionTitle title="Practice Every Topic" accent="Interviews Ask About" sub="Contest problems and concept guides cover the full DSA syllabus." />
      <ul className="flex flex-wrap justify-center gap-2.5">
        {topics.map((t) => (
          <li key={t} className="rounded-full border border-line bg-card px-4 py-2 text-sm text-muted transition hover:border-brand hover:text-white">{t}</li>
        ))}
      </ul>
    </section>
  );
}
