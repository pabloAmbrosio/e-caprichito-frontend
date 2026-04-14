import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeUsers } from '@/features/users/hooks/useBackofficeUsers';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { AdminRole, CustomerRole } from '@/shared/types/enums';

const LIMIT = 20;

const ADMIN_ROLE_CONFIG: Record<AdminRole, { label: string; bg: string; color: string }> = {
  OWNER:    { label: 'Propietario',   bg: 'rgba(255,214,0,0.12)',  color: '#FFD600' },
  ADMIN:    { label: 'Admin',         bg: 'rgba(0,197,212,0.12)',   color: '#00C5D4' },
  MANAGER:  { label: 'Gerente',       bg: 'rgba(255,122,0,0.12)',   color: '#FF7A00' },
  SELLER:   { label: 'Vendedor',      bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' },
  CUSTOMER: { label: 'Cliente',       bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' },
};

const CUSTOMER_ROLE_CONFIG: Record<CustomerRole, { label: string; color: string }> = {
  MEMBER:     { label: 'Miembro',    color: 'rgba(255,255,255,0.4)' },
  VIP_FAN:    { label: 'VIP Fan',    color: '#00C5D4' },
  VIP_LOVER:  { label: 'VIP Lover',  color: '#F0177A' },
  VIP_LEGEND: { label: 'VIP Legend', color: '#FFD600' },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'short' });
}

const ADMIN_ROLES: AdminRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'SELLER', 'CUSTOMER'];
const CUSTOMER_ROLES: CustomerRole[] = ['MEMBER', 'VIP_FAN', 'VIP_LOVER', 'VIP_LEGEND'];
const HEADERS = ['Usuario', 'Contacto', 'Rol Admin', 'Rol Cliente', 'Último acceso', ''];

export default function UsuariosPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { users, isLoading, error, fetchUsers } = useBackofficeUsers();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<AdminRole | ''>('');
  const [customerRoleFilter, setCustomerRoleFilter] = useState<CustomerRole | ''>('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const load = useCallback((p: number, s: string, ar: typeof adminRoleFilter, cr: typeof customerRoleFilter, del: boolean) => {
    void fetchUsers({
      page: p, limit: LIMIT,
      ...(s && { search: s }),
      ...(ar && { adminRole: ar }),
      ...(cr && { customerRole: cr }),
      includeDeleted: del,
    });
  }, [fetchUsers]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAuthenticated) load(1, '', '', '', false); }, [isAuthenticated]);

  const handleSearch = () => {
    setSearchVal(searchInput);
    setPage(1);
    load(1, searchInput, adminRoleFilter, customerRoleFilter, includeDeleted);
  };

  const applyFilter = (ar: typeof adminRoleFilter, cr: typeof customerRoleFilter, del: boolean) => {
    setAdminRoleFilter(ar);
    setCustomerRoleFilter(cr);
    setIncludeDeleted(del);
    setPage(1);
    load(1, searchVal, ar, cr, del);
  };

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout title="Usuarios" breadcrumbs={[{ label: 'Usuarios' }]}>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar usuario, email, teléfono…"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
              style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
            />
            <button onClick={handleSearch}
              className="px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)', color: '#fff' }}>
              Buscar
            </button>
          </div>
          <select
            value={adminRoleFilter}
            onChange={(e) => { applyFilter(e.target.value as AdminRole | '', customerRoleFilter, includeDeleted); }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40"
            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}>
            <option value="">Todos los roles</option>
            {ADMIN_ROLES.map((r) => <option key={r} value={r}>{ADMIN_ROLE_CONFIG[r].label}</option>)}
          </select>
          <select
            value={customerRoleFilter}
            onChange={(e) => { applyFilter(adminRoleFilter, e.target.value as CustomerRole | '', includeDeleted); }}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:ring-2 focus:ring-turquoise/40"
            style={{ background: 'var(--surface)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}>
            <option value="">Nivel cliente</option>
            {CUSTOMER_ROLES.map((r) => <option key={r} value={r}>{CUSTOMER_ROLE_CONFIG[r].label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none"
            style={{ color: 'var(--on-surface-muted)' }}>
            <input type="checkbox" checked={includeDeleted}
              onChange={(e) => { applyFilter(adminRoleFilter, customerRoleFilter, e.target.checked); }}
              className="rounded accent-[#F0177A]" />
            Incluir eliminados
          </label>
          <Link href="/backoffice/users/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo usuario
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl border text-sm font-semibold mb-6"
            style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
          {isLoading ? (
            <div className="flex flex-col gap-3 p-6">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--on-surface-muted)', opacity: 0.4 }} aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="text-sm font-semibold" style={{ color: 'var(--on-surface-muted)' }}>No hay usuarios</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--stroke)' }}>
                  {HEADERS.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider"
                      style={{ color: 'var(--on-surface-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isDeleted = !!user.deletedAt;
                  const arCfg = ADMIN_ROLE_CONFIG[user.adminRole] ?? ADMIN_ROLE_CONFIG.CUSTOMER;
                  const crCfg = user.customerRole ? CUSTOMER_ROLE_CONFIG[user.customerRole] : null;
                  const initial = user.username.charAt(0).toUpperCase();
                  return (
                    <tr key={user.id}
                      className="border-b last:border-0 transition-colors duration-150 hover:bg-[rgba(0,197,212,0.02)]"
                      style={{
                        borderColor: 'var(--stroke)',
                        background: isDeleted ? 'rgba(240,23,122,0.025)' : undefined,
                        opacity: isDeleted ? 0.6 : 1,
                      }}>
                      {/* Avatar + username */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold text-white shrink-0"
                            style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>
                            {initial}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold truncate" style={{ color: 'var(--on-surface)' }}>{user.username}</p>
                            {isDeleted && (
                              <p className="text-xs font-semibold" style={{ color: '#F0177A' }}>Eliminado {fmt(user.deletedAt!)}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Contacto */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                          {user.email && <span className="truncate max-w-[160px]">{user.email}</span>}
                          {user.phone && <span>{user.phone}</span>}
                          {!user.email && !user.phone && <span>—</span>}
                        </div>
                      </td>
                      {/* Admin role */}
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: arCfg.bg, color: arCfg.color }}>
                          {arCfg.label}
                        </span>
                      </td>
                      {/* Customer role */}
                      <td className="px-4 py-3">
                        {crCfg ? (
                          <span className="text-xs font-bold" style={{ color: crCfg.color }}>{crCfg.label}</span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--on-surface-muted)' }}>—</span>
                        )}
                      </td>
                      {/* Último acceso */}
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--on-surface-muted)' }}>
                        {user.lastLoginAt ? fmt(user.lastLoginAt) : '—'}
                      </td>
                      {/* Acción */}
                      <td className="px-4 py-3">
                        <Link href={`/backoffice/users/${user.id}`}
                          className="text-xs font-bold hover:text-turquoise transition-colors"
                          style={{ color: 'var(--on-surface-muted)' }}>
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginación */}
        {!isLoading && users.length === LIMIT && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => { const next = page + 1; setPage(next); load(next, searchVal, adminRoleFilter, customerRoleFilter, includeDeleted); }}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:border-turquoise/40"
              style={{ borderColor: 'var(--stroke)', background: 'var(--surface)', color: 'var(--on-surface-muted)' }}>
              Siguiente →
            </button>
          </div>
        )}
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
