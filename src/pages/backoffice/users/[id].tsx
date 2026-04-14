import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeUserDetail } from '@/features/users/hooks/useBackofficeUserDetail';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { AdminRole, CustomerRole } from '@/shared/types/enums';

const ADMIN_ROLES: AdminRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'SELLER', 'CUSTOMER'];
const CUSTOMER_ROLES: CustomerRole[] = ['MEMBER', 'VIP_FAN', 'VIP_LOVER', 'VIP_LEGEND'];
const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: 'Propietario', ADMIN: 'Admin', MANAGER: 'Gerente', SELLER: 'Vendedor', CUSTOMER: 'Cliente',
};
const CUSTOMER_ROLE_LABELS: Record<CustomerRole, string> = {
  MEMBER: 'Miembro', VIP_FAN: 'VIP Fan', VIP_LOVER: 'VIP Lover', VIP_LEGEND: 'VIP Legend',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

export default function UsuarioDetallePage() {
  const router = useRouter();
  const { id } = router.query;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { user, isLoading, isSaving, error, fetchUser, updateUser, deleteUser, restoreUser } = useBackofficeUserDetail();

  const [form, setForm] = useState({
    email: '', phone: '', firstName: '', lastName: '',
    adminRole: '' as AdminRole | '',
    customerRole: '' as CustomerRole | '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !id || typeof id !== 'string') return;
    void fetchUser(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (!user) return;
    setForm({
      email: user.email ?? '',
      phone: user.phone ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      adminRole: user.adminRole,
      customerRole: user.customerRole ?? '',
    });
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUser(user.id, {
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        adminRole: form.adminRole || undefined,
        customerRole: form.customerRole || null,
      });
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); }, 2500);
    } catch {
      // error in hook
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteUser(user.id);
      setDeleteConfirm(false);
    } catch {
      // error in hook
    }
  };

  const handleRestore = async () => {
    if (!user) return;
    try {
      await restoreUser(user.id);
    } catch {
      // error in hook
    }
  };

  const initial = user?.username.charAt(0).toUpperCase() ?? '?';
  const isDeleted = !!user?.deletedAt;
  const isGoogleUser = !!user?.googleId;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title={user?.username ?? 'Usuario'}
        breadcrumbs={[
          { label: 'Usuarios', href: '/backoffice/users' },
          { label: user?.username ?? '…' },
        ]}
      >
        {isLoading ? (
          <div className="max-w-2xl flex flex-col gap-5">
            {[1,2].map((i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : error && !user ? (
          <div className="p-4 rounded-xl border text-sm font-semibold max-w-md"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        ) : user ? (
          <div className="max-w-2xl flex flex-col gap-5">

            {/* Header */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }} aria-hidden="true" />
              <div className="p-6 flex items-start gap-4">
                <span className="flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-extrabold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold" style={{ color: 'var(--on-surface)' }}>
                      {user.firstName || user.lastName
                        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                        : user.username}
                    </h2>
                    {isDeleted && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(240,23,122,0.12)', color: '#F0177A' }}>
                        Eliminado
                      </span>
                    )}
                    {isGoogleUser && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,214,0,0.12)', color: '#FFD600' }}>
                        Google
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--on-surface-muted)' }}>
                    @{user.username}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--on-surface-muted)' }}>
                    Registrado: {fmt(user.createdAt)}
                    {user.lastLoginAt && <> · Último acceso: {fmt(user.lastLoginAt)}</>}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 shrink-0">
                  {[
                    { label: 'Órdenes', value: user._count.orders, color: '#00C5D4' },
                    { label: 'Carritos', value: user._count.allCarts, color: '#FFD600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex flex-col items-center px-3 py-2 rounded-xl"
                      style={{ background: 'var(--surface-overlay)' }}>
                      <span className="text-xl font-extrabold" style={{ color }}>{value}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--on-surface-muted)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form editar */}
            <form onSubmit={(e) => { void handleSave(e); }}
              className="rounded-2xl border p-6 flex flex-col gap-4"
              style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>✎</span>
                <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
                  Editar información
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'firstName' as const, label: 'Nombre', placeholder: 'Ana' },
                  { key: 'lastName' as const, label: 'Apellido', placeholder: 'García' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                      style={{ color: 'var(--on-surface-muted)' }}>{label}</label>
                    <input type="text" value={form[key]}
                      onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); }}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                      style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }} />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>
                  Email {isGoogleUser && <span className="normal-case font-normal">(cuenta Google)</span>}
                </label>
                <input type="email" value={form.email}
                  onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); }}
                  readOnly={isGoogleUser}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{
                    background: isGoogleUser ? 'var(--surface-raised)' : 'var(--surface-overlay)',
                    borderColor: 'var(--stroke)', color: 'var(--on-surface)',
                    opacity: isGoogleUser ? 0.6 : 1,
                  }} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>Teléfono</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => { setForm((f) => ({ ...f, phone: e.target.value })); }}
                  placeholder="+52 55 1234 5678"
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
                  style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>Rol administrativo</label>
                  <select value={form.adminRole}
                    onChange={(e) => { setForm((f) => ({ ...f, adminRole: e.target.value as AdminRole })); }}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}>
                    {ADMIN_ROLES.map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--on-surface-muted)' }}>Nivel cliente</label>
                  <select value={form.customerRole}
                    onChange={(e) => { setForm((f) => ({ ...f, customerRole: e.target.value as CustomerRole | '' })); }}
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}>
                    <option value="">Sin nivel</option>
                    {CUSTOMER_ROLES.map((r) => <option key={r} value={r}>{CUSTOMER_ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl border text-sm font-semibold"
                  style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
                  {error}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 rounded-xl border text-sm font-semibold"
                  style={{ background: 'rgba(0,197,212,0.08)', borderColor: 'rgba(0,197,212,0.25)', color: '#00C5D4' }}>
                  ✓ Cambios guardados
                </div>
              )}

              <button type="submit" disabled={isSaving}
                className="py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}>
                {isSaving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>

            {/* Zona de peligro */}
            <div className="rounded-2xl border p-6" style={{ borderColor: 'rgba(240,23,122,0.2)', background: 'var(--surface)' }}>
              <h2 className="text-xs font-extrabold uppercase tracking-wider mb-4" style={{ color: '#F0177A' }}>
                Zona de peligro
              </h2>

              {isDeleted ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm" style={{ color: 'var(--on-surface-muted)' }}>
                    Este usuario fue eliminado el {fmt(user.deletedAt!)}.
                  </p>
                  <button onClick={() => { void handleRestore(); }} disabled={isSaving}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}>
                    {isSaving ? 'Restaurando…' : '↩ Restaurar usuario'}
                  </button>
                </div>
              ) : deleteConfirm ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>
                    ¿Eliminar a <strong>@{user.username}</strong>? Esta acción puede revertirse.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => { void handleDelete(); }} disabled={isSaving}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all"
                      style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}>
                      {isSaving ? 'Eliminando…' : 'Confirmar eliminación'}
                    </button>
                    <button onClick={() => { setDeleteConfirm(false); }}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold border hover:border-turquoise/40 transition-all"
                      style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setDeleteConfirm(true); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-pink/5"
                  style={{ borderColor: 'rgba(240,23,122,0.3)', color: '#F0177A' }}>
                  Eliminar usuario
                </button>
              )}
            </div>
          </div>
        ) : null}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
