const OPTIONS = [
  { label: '3+ días', value: 3 },
  { label: '7+ días', value: 7 },
  { label: '14+ días', value: 14 },
  { label: '30+ días', value: 30 },
];

interface Props {
  value: number;
  onChange: (days: number) => void;
}

export function InactiveDaysFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-sm font-semibold self-center" style={{ color: 'var(--on-surface-muted)' }}>
        Inactivos:
      </span>
      {OPTIONS.map(({ label, value: optValue }) => (
        <button
          key={optValue}
          onClick={() => { onChange(optValue); }}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
          style={{
            background: value === optValue ? 'rgba(240,23,122,0.1)' : 'var(--surface)',
            borderColor: value === optValue ? 'rgba(240,23,122,0.4)' : 'var(--stroke)',
            color: value === optValue ? '#F0177A' : 'var(--on-surface-muted)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
