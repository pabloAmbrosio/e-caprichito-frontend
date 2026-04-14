import { useState, useEffect, useCallback } from 'react';
import { useBackofficeCategories } from '../../hooks/useBackofficeCategories';
import type { Category, CreateCategoryInput } from '../../domain/types';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialData?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  isActive: boolean;
  sortOrder: string;
}

export function CategoryForm({ mode, initialData, onSuccess, onCancel }: CategoryFormProps) {
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } = useBackofficeCategories();

  const [form, setForm] = useState<FormState>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    parentId: initialData?.parentId ?? '',
    isActive: initialData?.isActive ?? true,
    sortOrder: String(initialData?.sortOrder ?? 0),
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && form.name) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, slugManuallyEdited]);

  const set = useCallback((field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) { setError('El nombre es requerido.'); return; }
    if (!form.slug.trim()) { setError('El slug es requerido.'); return; }

    setIsSaving(true);
    try {
      const input: CreateCategoryInput = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || undefined,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (mode === 'create') {
        await createCategory(input);
      } else if (initialData) {
        await updateCategory(initialData.id, { ...input, isActive: form.isActive });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la categoría.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    if (!initialData) return;
    setIsDeleting(true);
    try {
      await deleteCategory(initialData.id);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la categoría.');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Only root categories as parent options (excluding current category)
  const parentOptions = categories.filter((c) => !c.parentId && c.id !== initialData?.id);

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-2xl flex flex-col gap-6">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold"
          style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Section: Info básica */}
      <section
        className="rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
      >
        <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
          Información básica
        </h2>

        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-name" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
            Nombre <span className="text-pink">*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej: Mujer, Accesorios, Ropa..."
            className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0"
            style={{
              background: 'var(--surface-raised)',
              borderColor: 'var(--stroke)',
              color: 'var(--on-surface)',
            }}
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-slug" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
            Slug <span className="text-pink">*</span>
          </label>
          <input
            id="cat-slug"
            type="text"
            value={form.slug}
            onChange={(e) => { setSlugManuallyEdited(true); set('slug', e.target.value); }}
            placeholder="generado-automaticamente"
            className="w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all duration-150 outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0"
            style={{
              background: 'var(--surface-raised)',
              borderColor: 'var(--stroke)',
              color: 'var(--on-surface)',
            }}
          />
          <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
            URL: /category/<strong>{form.slug || '...'}</strong>
          </p>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-desc" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
            Descripción
          </label>
          <textarea
            id="cat-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Descripción opcional de la categoría..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0 resize-none"
            style={{
              background: 'var(--surface-raised)',
              borderColor: 'var(--stroke)',
              color: 'var(--on-surface)',
            }}
          />
        </div>
      </section>

      {/* Section: Configuración */}
      <section
        className="rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}
      >
        <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
          Configuración
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Categoría padre */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-parent" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
              Categoría padre
            </label>
            <select
              id="cat-parent"
              value={form.parentId}
              onChange={(e) => set('parentId', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0 cursor-pointer"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--stroke)',
                color: 'var(--on-surface)',
              }}
            >
              <option value="">Ninguna (categoría raíz)</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
              {form.parentId ? 'Esta será una subcategoría.' : 'Esta será una categoría raíz.'}
            </p>
          </div>

          {/* Orden */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cat-order" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
              Orden de visualización
            </label>
            <input
              id="cat-order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set('sortOrder', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 outline-none focus:ring-2 focus:ring-turquoise focus:ring-offset-0"
              style={{
                background: 'var(--surface-raised)',
                borderColor: 'var(--stroke)',
                color: 'var(--on-surface)',
              }}
            />
          </div>
        </div>

        {/* Estado (solo en edición) */}
        {mode === 'edit' && (
          <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'var(--surface-overlay)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Categoría activa</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--on-surface-muted)' }}>
                Las categorías inactivas no aparecen en la tienda.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set('isActive', !form.isActive)}
              className={[
                'relative w-11 h-6 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 shrink-0',
                form.isActive ? 'bg-turquoise' : 'bg-on-surface-muted/30',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                  form.isActive ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,197,212,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Guardando...
            </>
          ) : (
            mode === 'create' ? 'Crear categoría' : 'Guardar cambios'
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2"
          style={{ color: 'var(--on-surface-muted)' }}
        >
          Cancelar
        </button>

        {/* Eliminar (solo en edición) */}
        {mode === 'edit' && (
          <div className="ml-auto flex items-center gap-2">
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-pink/10 text-pink hover:bg-pink/20 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Confirmar eliminación'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-surface-overlay"
                  style={{ color: 'var(--on-surface-muted)' }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-pink/70 hover:bg-pink/10 hover:text-pink transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Eliminar categoría
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
