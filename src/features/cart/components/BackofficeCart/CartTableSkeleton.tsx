export function CartTableSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
      ))}
    </div>
  );
}
