import { useState } from 'react';
import { AccountLayout } from '@/shared/layouts/AccountLayout';
import { ProtectedRoute } from '@/features/auth';
import { useAddresses, AddressCard, AddressForm } from '@/features/addresses';
import type { Address } from '@/features/addresses';

export default function AddressesPage() {
  const { addresses, isLoading, error, addAddress, updateAddress, deleteAddress } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const editingAddress = editingId ? addresses.find((a) => a.id === editingId) : null;

  const handleAdd = async (payload: Parameters<typeof addAddress>[0]) => {
    setIsSaving(true);
    try {
      await addAddress(payload);
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (payload: Parameters<typeof updateAddress>[1]) => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateAddress(editingId, payload);
      setEditingId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await deleteAddress(id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar dirección');
    }
  };

  return (
    <ProtectedRoute>
      <AccountLayout title="Mis Direcciones">
        {/* Error alerts */}
        {(error || deleteError) && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30 text-pink text-sm font-semibold mb-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error ?? deleteError}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse bg-surface-overlay border border-stroke" />
            ))}
          </div>
        )}

        {/* Address list */}
        {!isLoading && addresses.length > 0 && !editingId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {addresses.map((addr: Address) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => setEditingId(addr.id)}
                onDelete={() => void handleDelete(addr.id)}
              />
            ))}
          </div>
        )}

        {/* Edit form */}
        {editingAddress && (
          <div className="rounded-2xl border border-stroke bg-surface p-5 mb-4">
            <h3 className="text-sm font-extrabold text-on-surface mb-4">Editar dirección</h3>
            <AddressForm
              onSubmit={handleEdit}
              onCancel={() => setEditingId(null)}
              isLoading={isSaving}
              initialValues={{
                label: editingAddress.label,
                formattedAddress: editingAddress.formattedAddress,
                details: editingAddress.details ?? undefined,
                lat: editingAddress.lat,
                lng: editingAddress.lng,
              }}
            />
          </div>
        )}

        {/* Add new form */}
        {showForm && !editingId && (
          <div className="rounded-2xl border border-stroke bg-surface p-5 mb-4">
            <h3 className="text-sm font-extrabold text-on-surface mb-4">Nueva dirección</h3>
            <AddressForm
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
              isLoading={isSaving}
            />
          </div>
        )}

        {/* Add button */}
        {!isLoading && !showForm && !editingId && addresses.length < 10 && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-stroke text-sm font-bold text-on-surface-muted hover:border-turquoise/30 hover:text-turquoise transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Agregar dirección
          </button>
        )}

        {/* Empty state */}
        {!isLoading && addresses.length === 0 && !showForm && (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block" aria-hidden="true">📍</span>
            <h2 className="text-lg font-extrabold text-on-surface mb-2">Sin direcciones</h2>
            <p className="text-sm text-on-surface-muted mb-6">
              Agrega tus direcciones para agilizar tus compras.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.02] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
              style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
            >
              Agregar mi primera dirección
            </button>
          </div>
        )}

        {/* Max limit */}
        {!isLoading && addresses.length >= 10 && !showForm && (
          <p className="text-xs text-on-surface-muted text-center mt-2">
            Has alcanzado el maximo de 10 direcciones.
          </p>
        )}
      </AccountLayout>
    </ProtectedRoute>
  );
}
