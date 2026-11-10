import type { StudentDashboardData } from "@/features/users/types/dashboard";

function getPoints(scores: number[]) {
  const width = 620;
  const height = 190;
  const insetX = 12;
  const insetY = 14;
  const step = scores.length > 1 ? (width - insetX * 2) / (scores.length - 1) : 0;
  return scores.map((score, index) => ({
    x: insetX + index * step,
    y: height - insetY - (Math.max(0, Math.min(100, score)) / 100) * (height - insetY * 2),
  }));
}

export default function PerformanceChart({ data }: { data: StudentDashboardData["performance"] }) {
  const points = getPoints(data.map((point) => point.score));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length
    ? `${points[0].x},190 ${line} ${points.at(-1)?.x},190`
    : "";

  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm shadow-black/20 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Performance overview</h2>
          <p className="mt-1 text-xs text-muted">Contest scores over your recent activity.</p>
        </div>
        <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300">
          Score trend
        </span>
      </div>
      {data.length === 0 ? (
        <p className="mt-6 rounded-xl bg-white/[0.03] p-5 text-center text-sm text-muted">
          Your score trend will appear after your first contest.
        </p>
      ) : (
        <>
          <div className="mt-5 overflow-hidden">
            <svg viewBox="0 0 620 205" role="img" aria-label="Line chart showing contest scores over time" className="h-[180px] w-full overflow-visible">
              {[0, 1, 2, 3].map((lineIndex) => {
                const y = 14 + lineIndex * 54;
                return (
                  <g key={lineIndex}>
                    <line x1="12" y1={y} x2="608" y2={y} stroke="#292936" strokeDasharray="4 5" />
                    <text x="0" y={y + 4} fontSize="10" fill="#8e8ea0">{100 - lineIndex * 30}</text>
                  </g>
                );
              })}
              <defs>
                <linearGradient id="performance-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={area} fill="url(#performance-fill)" />
              <polyline points={line} fill="none" stroke="#7c5cf5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => (
                <g key={`${data[index].label}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="5" fill="#0c0c11" stroke="#a08bff" strokeWidth="3" />
                  <text x={point.x} y="204" textAnchor="middle" fontSize="10" fill="#8e8ea0">{data[index].label}</text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-line pt-4">
            <p className="text-xs text-muted">Average score <span className="ml-1 font-semibold text-white">{Math.round(data.reduce((sum, point) => sum + point.score, 0) / data.length)}%</span></p>
            <p className="text-xs text-muted">Contests <span className="ml-1 font-semibold text-white">{data.length}</span></p>
          </div>
        </>
      )}
    </section>
  );
}
