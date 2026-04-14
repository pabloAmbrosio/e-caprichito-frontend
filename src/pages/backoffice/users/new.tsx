import { useState } from 'react';
import { useRouter } from 'next/router';
import { BackofficeLayout } from '@/shared/layouts/BackofficeLayout';
import { ProtectedBackofficeRoute } from '@/features/auth/components/ProtectedBackofficeRoute';
import { useBackofficeUserDetail } from '@/features/users/hooks/useBackofficeUserDetail';
import type { AdminRole, CustomerRole } from '@/shared/types/enums';

const ADMIN_ROLES: AdminRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'SELLER'];
const CUSTOMER_ROLES: CustomerRole[] = ['MEMBER', 'VIP_FAN', 'VIP_LOVER', 'VIP_LEGEND'];
const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: 'Propietario', ADMIN: 'Admin', MANAGER: 'Gerente', SELLER: 'Vendedor', CUSTOMER: 'Cliente',
};
const CUSTOMER_ROLE_LABELS: Record<CustomerRole, string> = {
  MEMBER: 'Miembro', VIP_FAN: 'VIP Fan', VIP_LOVER: 'VIP Lover', VIP_LEGEND: 'VIP Legend',
};

function InputField({
  label, required, type = 'text', value, onChange, placeholder,
}: {
  label: string; required?: boolean; type?: string;
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-extrabold uppercase tracking-wide mb-1.5"
        style={{ color: 'var(--on-surface-muted)' }}>
        {label} {required && <span style={{ color: '#F0177A' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40 transition-all"
        style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
      />
    </div>
  );
}

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const { isSaving, error, createUser } = useBackofficeUserDetail();

  const [form, setForm] = useState({
    username: '',
    password: '',
    adminRole: 'ADMIN' as AdminRole,
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    customerRole: '' as CustomerRole | '',
  });
  const [validationError, setValidationError] = useState('');

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (form.username.trim().length < 3) {
      setValidationError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const id = await createUser({
        username: form.username.trim(),
        password: form.password,
        adminRole: form.adminRole,
        ...(form.email.trim() && { email: form.email.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.firstName.trim() && { firstName: form.firstName.trim() }),
        ...(form.lastName.trim() && { lastName: form.lastName.trim() }),
        ...(form.customerRole && { customerRole: form.customerRole }),
      });
      void router.push(`/backoffice/users/${id}`);
    } catch {
      // error shown from hook
    }
  };

  const displayError = validationError || error;

  return (
    <ProtectedBackofficeRoute>
      <BackofficeLayout
        title="Nuevo Usuario"
        breadcrumbs={[
          { label: 'Usuarios', href: '/backoffice/users' },
          { label: 'Nuevo' },
        ]}
      >
        <form onSubmit={(e) => { void handleSubmit(e); }} className="max-w-xl">
          <div className="rounded-2xl border p-6 flex flex-col gap-5" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>1</span>
              <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
                Credenciales
              </h2>
            </div>

            <InputField label="Username" required value={form.username} onChange={set('username')} placeholder="usuario123" />
            <InputField label="Contraseña" required type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--on-surface-muted)' }}>
                Rol administrativo <span style={{ color: '#F0177A' }}>*</span>
              </label>
              <select
                value={form.adminRole}
                onChange={(e) => { setForm((f) => ({ ...f, adminRole: e.target.value as AdminRole })); }}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
              >
                {ADMIN_ROLES.map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border p-6 flex flex-col gap-5 mt-5" style={{ borderColor: 'var(--stroke)', background: 'var(--surface)' }}>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #00C5D4, #F0177A)' }}>2</span>
              <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--on-surface-muted)' }}>
                Datos personales (opcionales)
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Nombre" value={form.firstName} onChange={set('firstName')} placeholder="Ana" />
              <InputField label="Apellido" value={form.lastName} onChange={set('lastName')} placeholder="García" />
            </div>
            <InputField label="Email" type="email" value={form.email} onChange={set('email')} placeholder="ana@ejemplo.com" />
            <InputField label="Teléfono" type="tel" value={form.phone} onChange={set('phone')} placeholder="+52 55 1234 5678" />

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--on-surface-muted)' }}>
                Nivel cliente (opcional)
              </label>
              <select
                value={form.customerRole}
                onChange={(e) => { setForm((f) => ({ ...f, customerRole: e.target.value as CustomerRole | '' })); }}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-turquoise/40"
                style={{ background: 'var(--surface-overlay)', borderColor: 'var(--stroke)', color: 'var(--on-surface)' }}
              >
                <option value="">Sin nivel asignado</option>
                {CUSTOMER_ROLES.map((r) => <option key={r} value={r}>{CUSTOMER_ROLE_LABELS[r]}</option>)}
              </select>
            </div>
          </div>

          {displayError && (
            <div className="p-4 rounded-xl border text-sm font-semibold mt-5"
              style={{ background: 'rgba(240,23,122,0.05)', borderColor: 'rgba(240,23,122,0.2)', color: '#F0177A' }}>
              {displayError}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={isSaving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}>
              {isSaving ? 'Creando…' : 'Crear usuario'}
            </button>
            <button type="button" onClick={() => { void router.push('/backoffice/users'); }}
              className="px-6 py-3 rounded-xl text-sm font-bold border transition-all hover:border-turquoise/40"
              style={{ borderColor: 'var(--stroke)', color: 'var(--on-surface-muted)' }}>
              Cancelar
            </button>
          </div>
        </form>
      </BackofficeLayout>
    </ProtectedBackofficeRoute>
  );
}
