export default function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = pct >= 85;

  return (
    <div className="border border-white/10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-paper-dim text-sm">{label}</p>
        <p className="font-mono text-xs text-paper-faint">
          {used} / {limit}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: nearLimit ? "#C1502E" : "#4FA8A3" }}
        />
      </div>
    </div>
  );
}
