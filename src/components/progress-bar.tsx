interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
}

export function ProgressBar({ label, value, max }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="text-stone-400">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
