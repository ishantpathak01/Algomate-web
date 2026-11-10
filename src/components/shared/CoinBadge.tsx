export default function CoinBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm font-medium text-amber-200">
      <span aria-hidden>◈</span>
      {amount.toLocaleString()} coins
    </span>
  );
}
