const getColor = (p) => {
  if (p >= 80) return '#22c55e';
  if (p >= 50) return '#eab308';
  if (p >= 25) return '#f97316';
  return '#ef4444';
};

export default function ProgressBar({ progress = 0, onChange, editable = false }) {
  const color = getColor(progress);

  return (
    <div className="flex items-center gap-2 min-w-[130px]">
      <div className="flex-1 bg-gray-700/60 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
      {editable ? (
        <input
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) =>
            onChange?.(Math.min(100, Math.max(0, Number(e.target.value))))
          }
          onBlur={(e) =>
            onChange?.(Math.min(100, Math.max(0, Number(e.target.value))))
          }
          className="w-10 bg-transparent text-xs font-mono border-none outline-none text-right"
          style={{ color }}
        />
      ) : (
        <span className="text-xs font-mono w-8 text-right" style={{ color }}>
          {progress}%
        </span>
      )}
    </div>
  );
}
