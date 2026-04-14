interface Props {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}

export function CarritosSearchBar({ value, onChange, onSearch }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex gap-2 flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Buscar por usuario o producto…"
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
          style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
        />
        <button
          onClick={onSearch}
          className="px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)', color: '#fff' }}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
