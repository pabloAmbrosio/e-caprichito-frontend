export type CartTab = 'activos' | 'abandonados';

interface Props {
  tab: CartTab;
  onChange: (tab: CartTab) => void;
}

export function CarritosTabBar({ tab, onChange }: Props) {
  return (
    <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--stroke)' }}>
      {(['activos', 'abandonados'] as CartTab[]).map((t) => (
        <button
          key={t}
          onClick={() => { onChange(t); }}
          className={[
            'px-5 py-2.5 text-sm font-bold capitalize transition-all border-b-2 -mb-px',
            tab === t
              ? 'border-turquoise text-turquoise'
              : 'border-transparent hover:text-turquoise/70',
          ].join(' ')}
          style={{ color: tab === t ? '#00C5D4' : 'var(--on-surface-muted)' }}
        >
          {t === 'activos' ? 'Carritos activos' : 'Abandonados'}
        </button>
      ))}
    </div>
  );
}
