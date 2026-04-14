interface Props {
  error: string | null;
  isDeleting: boolean;
  deleteConfirm: boolean;
  onShowConfirm: () => void;
  onHideConfirm: () => void;
  onDelete: () => void;
}

export function CartDangerZone({ error, isDeleting, deleteConfirm, onShowConfirm, onHideConfirm, onDelete }: Props) {
  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: 'rgba(240,23,122,0.2)', background: 'var(--surface)' }}>
      <h2 className="text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: '#F0177A' }}>
        Zona de peligro
      </h2>

      {error && (
        <div
          className="p-3 rounded-xl border text-sm font-semibold mb-4"
          style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}
        >
          {error}
        </div>
      )}

      {deleteConfirm ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
            ¿Eliminar este carrito? Esta acción no puede revertirse.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
            >
              {isDeleting ? 'Eliminando…' : 'Confirmar eliminación'}
            </button>
            <button
              onClick={onHideConfirm}
              className="px-4 py-2.5 rounded-xl text-sm font-bold border hover:border-turquoise/40 transition-all"
              style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>
            Eliminar este carrito y todos sus items permanentemente.
          </p>
          <button
            onClick={onShowConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-pink/5 shrink-0 ml-4"
            style={{ borderColor: 'rgba(240,23,122,0.3)', color: '#F0177A' }}
          >
            Eliminar carrito
          </button>
        </div>
      )}
    </div>
  );
}
