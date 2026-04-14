import { useState } from 'react';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficePromotionDetail } from '@/features/promotions/hooks/useBackofficePromotionDetail';
import { useUploadPromotionImage } from '@/features/promotions/hooks/useUploadPromotionImage';

interface FormState {
  name: string;
  description: string;
  couponCode: string;
  startsAt: string;
  endsAt: string;
  priority: string;
  maxUsesPerUser: string;
  isActive: boolean;
  stackable: boolean;
  colorPrimary: string;
  colorSecondary: string;
  badgeText: string;
  badgeColor: string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NuevaPromocionPage() {
  const router = useRouter();
  const { isSaving, error, createPromotion } = useBackofficePromotionDetail();
  const imageUpload = useUploadPromotionImage();

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    couponCode: '',
    startsAt: todayISO(),
    endsAt: '',
    priority: '0',
    maxUsesPerUser: '',
    isActive: true,
    stackable: false,
    colorPrimary: '#00C5D4',
    colorSecondary: '#009BAB',
    badgeText: '',
    badgeColor: '#F0177A',
  });

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl: string | undefined;
      if (imageUpload.file) {
        imageUrl = await imageUpload.upload();
      }

      const result = await createPromotion({
        name: form.name.trim(),
        startsAt: new Date(form.startsAt).toISOString(),
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(form.couponCode.trim() && { couponCode: form.couponCode.trim().toUpperCase() }),
        ...(form.endsAt && { endsAt: new Date(form.endsAt).toISOString() }),
        priority: parseInt(form.priority, 10) || 0,
        ...(form.maxUsesPerUser && { maxUsesPerUser: parseInt(form.maxUsesPerUser, 10) }),
        isActive: form.isActive,
        stackable: form.stackable,
        colorPrimary: form.colorPrimary || undefined,
        colorSecondary: form.colorSecondary || undefined,
        ...(form.badgeText.trim() && { badgeText: form.badgeText.trim() }),
        ...(form.badgeColor && { badgeColor: form.badgeColor }),
        ...(imageUrl && { imageUrl }),
      });
      void router.replace(`/backoffice/promotions/${result.id}`);
    } catch {
      // error shown in UI
    }
  };

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Nueva Promoción"
        breadcrumbs={[
          { label: 'Promociones', href: '/backoffice/promotions' },
          { label: 'Nueva' },
        ]}
      >
        <form onSubmit={(e) => { void handleSubmit(e); }} className="max-w-2xl flex flex-col gap-5">

          {/* Visibility guide */}
          <div className="rounded-2xl border p-5 flex gap-3.5"
            style={{ borderColor: 'rgba(0,197,212,0.2)', background: 'rgba(0,197,212,0.05)' }}>
            <div className="shrink-0 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" stroke="#00C5D4" strokeWidth="1.5" />
                <path d="M10 9v4M10 6.5v.01" stroke="#00C5D4" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-2 text-xs leading-relaxed" style={{ color: 'var(--on-surface-muted)' }}>
              <p className="font-bold text-sm" style={{ color: '#00C5D4' }}>
                ¿Cómo aparece una promoción en la tienda?
              </p>
              <p>
                El sistema clasifica automáticamente cada promoción según su configuración:
              </p>
              <ul className="flex flex-col gap-1.5 ml-1">
                <li>
                  <span className="font-bold" style={{ color: 'var(--on-surface)' }}>Banner de producto</span> (hero de la home)
                  — necesita al menos una <strong>condición</strong> de tipo Categoría, Producto o Tag, y al menos una <strong>acción</strong> (descuento %, 2x1, etc.)
                </li>
                <li>
                  <span className="font-bold" style={{ color: 'var(--on-surface)' }}>Banner de carrito</span> (mini banners)
                  — promos sin condiciones de producto (ej. solo mínimo de carrito) y <strong>sin cupón</strong>
                </li>
                <li>
                  <span className="font-bold" style={{ color: 'var(--on-surface)' }}>Cupón</span> (sección de cupones)
                  — cualquier promo que tenga un <strong>código de cupón</strong>
                </li>
              </ul>
              <p>
                La promo también debe estar <strong style={{ color: 'var(--on-surface)' }}>activa</strong>, dentro de sus fechas de vigencia,
                y ser <strong style={{ color: 'var(--on-surface)' }}>apilable</strong> para aparecer como banner.
              </p>
            </div>
          </div>

          {/* Info básica */}
          <div className="rounded-2xl border p-6 flex flex-col gap-4"
            style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>1</span>
              <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
                Información básica
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                Nombre <span style={{ color: '#F0177A' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => { set('name', e.target.value); }}
                placeholder="Ej. Black Friday 2026"
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => { set('description', e.target.value); }}
                rows={3}
                placeholder="Descripción interna o pública de la promoción…"
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all resize-none"
                style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                Código de cupón
              </label>
              <input
                type="text"
                value={form.couponCode}
                onChange={(e) => { set('couponCode', e.target.value.toUpperCase()); }}
                placeholder="VERANO2026 (dejar vacío si no requiere cupón)"
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all font-mono"
                style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
              />
            </div>
          </div>

          {/* Vigencia + configuración */}
          <div className="rounded-2xl border p-6 flex flex-col gap-4"
            style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>2</span>
              <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
                Vigencia y configuración
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Inicio <span style={{ color: '#F0177A' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.startsAt}
                  onChange={(e) => { set('startsAt', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Fin (opcional)
                </label>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => { set('endsAt', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Prioridad
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.priority}
                  onChange={(e) => { set('priority', e.target.value); }}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>Mayor número = mayor prioridad</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Máx. usos por usuario
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUsesPerUser}
                  onChange={(e) => { set('maxUsesPerUser', e.target.value); }}
                  placeholder="Sin límite"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => { set('isActive', !form.isActive); }}
                  className="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer"
                  style={{ background: form.isActive ? '#00C5D4' : 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: form.isActive ? 'translateX(1.25rem)' : 'translateX(0)' }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>Activa</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => { set('stackable', !form.stackable); }}
                  className="relative w-10 h-5.5 rounded-full transition-colors cursor-pointer"
                  style={{ background: form.stackable ? '#00C5D4' : 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: form.stackable ? 'translateX(1.25rem)' : 'translateX(0)' }}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
                  Apilable <span className="text-xs font-normal" style={{ color: 'var(--on-surface-muted)' }}>(combinable con otras promos)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Visual (opcional) */}
          <div className="rounded-2xl border p-6 flex flex-col gap-4"
            style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>3</span>
              <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
                Visual <span className="normal-case font-normal">(para banners públicos)</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Color primario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.colorPrimary}
                    onChange={(e) => { set('colorPrimary', e.target.value); }}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface-overlay)' }}
                  />
                  <input
                    type="text"
                    value={form.colorPrimary}
                    onChange={(e) => { set('colorPrimary', e.target.value); }}
                    placeholder="#00C5D4"
                    className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 font-mono"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Color secundario
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.colorSecondary}
                    onChange={(e) => { set('colorSecondary', e.target.value); }}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface-overlay)' }}
                  />
                  <input
                    type="text"
                    value={form.colorSecondary}
                    onChange={(e) => { set('colorSecondary', e.target.value); }}
                    placeholder="#009BAB"
                    className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 font-mono"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Texto del badge
                </label>
                <input
                  type="text"
                  value={form.badgeText}
                  onChange={(e) => { set('badgeText', e.target.value); }}
                  placeholder="Ej. OFERTA"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Color del badge
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.badgeColor}
                    onChange={(e) => { set('badgeColor', e.target.value); }}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                    style={{ borderColor: 'var(--stroke)', background: 'var(--surface-overlay)' }}
                  />
                  <input
                    type="text"
                    value={form.badgeColor}
                    onChange={(e) => { set('badgeColor', e.target.value); }}
                    placeholder="#F0177A"
                    className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 font-mono"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
                  />
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                Imagen del banner <span className="normal-case font-normal">(1600×900 recomendado)</span>
              </label>
              {imageUpload.previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--stroke)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUpload.previewUrl}
                    alt="Preview banner"
                    className="w-full h-40 object-cover"
                  />
                  {imageUpload.isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => { imageUpload.clearFile(); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors"
                    style={{ background: 'rgba(240,23,122,0.85)' }}
                    title="Eliminar imagen"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 cursor-pointer transition-colors hover:border-turquoise/40"
                  style={{ borderColor: 'var(--stroke)', background: 'var(--surface-overlay)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: 'var(--on-surface-muted)' }}>
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>
                    Arrastra o haz clic para subir
                  </span>
                  <span className="text-[0.65rem]" style={{ color: 'var(--on-surface-muted)' }}>
                    JPG, PNG o WebP — máx. 10 MB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) imageUpload.selectFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              {imageUpload.error && (
                <p className="text-xs font-semibold mt-1.5" style={{ color: '#F0177A' }}>
                  {imageUpload.error}
                </p>
              )}
            </div>

            {/* Preview */}
            {(form.badgeText || form.name) && (
              <div className="mt-1">
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--on-surface-muted)' }}>
                  Vista previa del banner
                </p>
                <div
                  className="rounded-xl overflow-hidden relative"
                  style={{
                    background: imageUpload.previewUrl
                      ? undefined
                      : `linear-gradient(135deg, ${form.colorPrimary}, ${form.colorSecondary})`,
                  }}
                >
                  {imageUpload.previewUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUpload.previewUrl}
                        alt=""
                        className="w-full h-28 object-cover"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                    </>
                  )}
                  <div className={imageUpload.previewUrl ? 'absolute bottom-0 left-0 right-0 p-4' : 'p-4'}>
                    {form.badgeText && (
                      <span
                        className="inline-block text-xs font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1"
                        style={{ background: form.badgeColor, color: '#fff' }}
                      >
                        {form.badgeText}
                      </span>
                    )}
                    <p className="font-['Pacifico'] text-white text-lg leading-tight drop-shadow">{form.name || 'Nombre de la promoción'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl border text-sm font-semibold"
              style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pb-8">
            <button
              type="submit"
              disabled={isSaving || imageUpload.isUploading || !form.name.trim()}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
            >
              {imageUpload.isUploading ? 'Subiendo imagen…' : isSaving ? 'Creando…' : 'Crear promoción'}
            </button>
            <button
              type="button"
              onClick={() => { void router.back(); }}
              className="px-5 py-3.5 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
              style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
