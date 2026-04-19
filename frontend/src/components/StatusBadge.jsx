export default function StatusBadge({ status }) {
  if (!status) return <span className="text-gray-600 text-xs">—</span>;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: `${status.color}20`,
        color: status.color,
        border: `1px solid ${status.color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: status.color }}
      />
      {status.name}
    </span>
  );
}
