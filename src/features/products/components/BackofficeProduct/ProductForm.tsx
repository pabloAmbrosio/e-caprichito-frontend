import { useState, useEffect, useCallback } from 'react';
import { VariantFieldArray } from './VariantFieldArray';
import type { VariantFormData } from './VariantFieldArray';
import { useBackofficeCategories } from '../../hooks/useBackofficeCategories';
import { useBackofficeProductDetail } from '../../hooks/useBackofficeProductDetail';
import type { BackofficeProductDetail, InitializeProductInput, VariantInput } from '../../domain/types';
import type { ProductStatus } from '@/shared/types/enums';

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

const PRODUCT_TAGS = [
  'pieza-unica', 'edicion-limitada', 'nuevo', 'oferta', 'exclusivo', 'tendencia',
];

const STATUS_OPTIONS: { value: ProductStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Borrador', color: 'rgba(255,255,255,0.4)' },
  { value: 'PUBLISHED', label: 'Publicado', color: '#00C5D4' },
  { value: 'ARCHIVED', label: 'Archivado', color: '#FF7A00' },
];

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: BackofficeProductDetail;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

function variantsFromProduct(product: BackofficeProductDetail): VariantFormData[] {
  return product.variants.map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku,
    priceDisplay: String(v.priceInCents / 100),
    comparePriceDisplay: v.compareAtPriceInCents ? String(v.compareAtPriceInCents / 100) : '',
    details: Object.entries(v.details ?? {}).map(([key, value]) => ({ key, value: String(value) })),
  }));
}

function variantsToInput(variants: VariantFormData[]): VariantInput[] {
  return variants.map((v) => ({
    title: v.title.trim(),
    sku: v.sku.trim(),
    priceInCents: Math.round(parseFloat(v.priceDisplay || '0') * 100),
    compareAtPriceInCents: v.comparePriceDisplay ? Math.round(parseFloat(v.comparePriceDisplay) * 100) : undefined,
    details: Object.fromEntries(v.details.filter((d) => d.key.trim()).map((d) => [d.key.trim(), d.value.trim()])),
  }));
}

export function ProductForm({ mode, initialData, onSuccess, onCancel }: ProductFormProps) {
  const { categories, fetchCategories } = useBackofficeCategories();
  const { createProduct, updateProduct, updateStatus, deleteVariant, isSaving, error: apiError } = useBackofficeProductDetail();

  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugManual, setSlugManual] = useState(mode === 'edit');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [variants, setVariants] = useState<VariantFormData[]>(
    initialData ? variantsFromProduct(initialData) : [{ title: '', sku: '', priceDisplay: '', comparePriceDisplay: '', details: [] }]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const addTag = useCallback((tag: string) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  }, [tags]);

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleDeleteExistingVariant = async (variantId: string) => {
    if (!initialData) return;
    await deleteVariant(initialData.id, variantId);
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'El título es requerido.';
    if (!description.trim()) return 'La descripción es requerida.';
    if (!slug.trim()) return 'El slug es requerido.';
    if (!categoryId) return 'Selecciona una categoría.';
    if (variants.length === 0) return 'Agrega al menos una variante.';
    for (const [i, v] of variants.entries()) {
      if (!v.title.trim()) return `La variante ${i + 1} necesita un título.`;
      if (!v.sku.trim()) return `La variante ${i + 1} necesita un SKU.`;
      if (!v.priceDisplay || parseFloat(v.priceDisplay) <= 0) return `La variante ${i + 1} necesita un precio mayor a 0.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      const input: InitializeProductInput = {
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
        categoryId,
        tags,
        isFeatured,
        variants: variantsToInput(variants),
      };

      if (mode === 'create') {
        const product = await createProduct(input);
        onSuccess(product.id);
      } else if (initialData) {
        const product = await updateProduct(initialData.id, {
          title: input.title,
          description: input.description,
          slug: input.slug,
          categoryId: input.categoryId,
          tags: input.tags,
          isFeatured: input.isFeatured,
        });
        onSuccess(product.id);
      }
    } catch {
      setError(apiError ?? 'Error al guardar el producto.');
    }
  };

  const handleStatusChange = async (status: ProductStatus) => {
    if (!initialData) return;
    setError(null);
    try {
      await updateStatus(initialData.id, status);
    } catch {
      setError(apiError ?? 'Error al cambiar el estado.');
    }
  };

  const displayError = error ?? apiError;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6 max-w-3xl">
      {/* Error */}
      {displayError && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold"
          style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {displayError}
        </div>
      )}

      {/* Status changer (edit only) */}
      {mode === 'edit' && initialData && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
          <p className="text-sm font-bold mr-2" style={{ color: 'var(--on-surface)' }}>Estado:</p>
          {STATUS_OPTIONS.map((opt) => {
            const isCurrent = initialData.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => void handleStatusChange(opt.value)}
                disabled={isCurrent || isSaving}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise',
                  isCurrent ? 'cursor-default' : 'hover:scale-[1.02] cursor-pointer',
                ].join(' ')}
                style={{
                  background: isCurrent ? `${opt.color}20` : 'var(--surface-overlay)',
                  color: isCurrent ? opt.color : 'var(--on-surface-muted)',
                  border: `1px solid ${isCurrent ? `${opt.color}40` : 'var(--stroke)'}`,
                }}
              >
                {isCurrent && <span className="mr-1">✓</span>}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Section 1: Info básica */}
      <section className="rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}>1</span>
          <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Información básica</h2>
        </div>

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prod-title" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
            Título <span className="text-pink">*</span>
          </label>
          <input
            id="prod-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Vestido Floral Caribeño"
            className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all"
            style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="prod-desc" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
            Descripción <span className="text-pink">*</span>
          </label>
          <textarea
            id="prod-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del producto..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all resize-none"
            style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prod-slug" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
              Slug <span className="text-pink">*</span>
            </label>
            <input
              id="prod-slug"
              type="text"
              value={slug}
              onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
              placeholder="generado-automaticamente"
              className="w-full px-4 py-3 rounded-xl border text-sm font-mono outline-none focus:ring-2 focus:ring-turquoise transition-all"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
            />
            <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>/product/<strong>{slug || '...'}</strong></p>
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prod-cat" className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>
              Categoría <span className="text-pink">*</span>
            </label>
            <select
              id="prod-cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none focus:ring-2 focus:ring-turquoise transition-all cursor-pointer"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `  └ ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Tags</label>
          <div
            className="flex flex-wrap gap-1.5 p-2 rounded-xl border min-h-[3rem] cursor-text"
            style={{ background: 'var(--surface-raised)', borderColor: 'var(--stroke)' }}
            onClick={() => document.getElementById('tag-input')?.focus()}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: 'rgba(0,197,212,0.1)', color: '#00C5D4' }}
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-pink transition-colors" aria-label={`Eliminar tag ${tag}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </span>
            ))}
            <input
              id="tag-input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? 'Escribe un tag y presiona Enter...' : ''}
              className="flex-1 min-w-24 bg-transparent text-sm outline-none py-0.5 px-1 font-medium"
              style={{ color: 'var(--on-surface)' }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_TAGS.filter((t) => !tags.includes(t)).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors hover:bg-turquoise/10 hover:text-turquoise border"
                style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        {/* Destacado */}
        <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'var(--surface-overlay)' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--on-surface)' }}>Producto destacado</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--on-surface-muted)' }}>Aparece en la sección hero de la página principal.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isFeatured}
            onClick={() => setIsFeatured((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 shrink-0 ${isFeatured ? 'bg-turquoise' : ''}`}
            style={{ background: isFeatured ? '#00C5D4' : 'rgba(var(--on-surface-muted-rgb, 85,85,119),0.3)' }}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Section 2: Variantes */}
      <section className="rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--surface)', borderColor: 'var(--stroke)' }}>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}>2</span>
          <h2 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>Variantes</h2>
        </div>
        <p className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>
          Cada producto debe tener al menos una variante (talla, color, modelo, etc.).
        </p>
        <VariantFieldArray
          variants={variants}
          onChange={setVariants}
          onDeleteExisting={mode === 'edit' ? handleDeleteExistingVariant : undefined}
        />
      </section>

      {/* Section 3: Imágenes — TODO */}
      <section className="rounded-2xl border p-5 flex items-start gap-4" style={{ background: 'rgba(255,214,0,0.04)', borderColor: 'rgba(255,214,0,0.3)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,214,0,0.15)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-extrabold" style={{ color: '#FFD600' }}>TODO: Image Upload</p>
          <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>
            La carga de imágenes está pendiente de implementación en el backend. Se habilitará en la próxima iteración.
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap pb-8">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(240,23,122,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50 focus-visible:ring-offset-2"
          style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Guardando...
            </>
          ) : (
            mode === 'create' ? 'Crear producto' : 'Guardar cambios'
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
      </div>
    </form>
  );
}
