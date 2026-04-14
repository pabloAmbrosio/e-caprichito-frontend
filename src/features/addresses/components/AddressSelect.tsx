import { useEffect, useState } from 'react';
import type { DeliveryType } from '@/shared/types/enums';
import { useAddressSelect } from '../hooks/useAddressSelect';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';

interface AddressSelectProps {
  onSelect: (addressId: string | null, deliveryFee: number, deliveryType: DeliveryType) => void;
}

export function AddressSelect({ onSelect }: AddressSelectProps) {
  const {
    addresses,
    isLoading,
    error,
    selectedId,
    setSelectedId,
    deliveryFee,
    resolvedDeliveryType,
    feeLoading,
    feeAvailable,
    addAddress,
  } = useAddressSelect();

  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  // Notify parent whenever fee/type resolves after selection
  useEffect(() => {
    if (selectedId && resolvedDeliveryType && !feeLoading) {
      onSelect(selectedId, deliveryFee, resolvedDeliveryType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryFee, resolvedDeliveryType, feeLoading, selectedId]);

  const handleAddAddress = async (payload: Parameters<typeof addAddress>[0]) => {
    setIsSaving(true);
    try {
      const created = await addAddress(payload);
      setShowForm(false);
      setSelectedId(created.id);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-2xl animate-pulse bg-surface-overlay" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-pink shrink-0" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-semibold text-pink">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Address cards */}
      {addresses.length > 0 && (
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Selecciona una dirección">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.id === selectedId}
              onSelect={() => handleSelect(addr.id)}
              deliveryFee={addr.id === selectedId && !feeLoading && feeAvailable ? deliveryFee : null}
            />
          ))}
        </div>
      )}

      {/* Fee loading */}
      {feeLoading && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-overlay border border-stroke">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-turquoise/20 border-t-turquoise animate-spin" aria-hidden="true" />
          <span className="text-xs font-semibold text-on-surface-muted">Calculando envío...</span>
        </div>
      )}

      {/* Not available warning */}
      {selectedId && !feeLoading && !feeAvailable && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow/5 border border-yellow/20">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow shrink-0 mt-0.5" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-semibold text-on-surface-muted">
            Esta dirección está fuera de nuestra zona de entrega. Por favor selecciona otra dirección.
          </p>
        </div>
      )}

      {/* Add new address */}
      {showForm ? (
        <div className="rounded-2xl border border-stroke bg-surface p-4">
          <h3 className="text-sm font-extrabold text-on-surface mb-4">Nueva dirección</h3>
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setShowForm(false)}
            isLoading={isSaving}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-stroke text-sm font-bold text-on-surface-muted hover:border-turquoise/30 hover:text-turquoise transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Agregar nueva dirección
        </button>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <p className="text-xs text-on-surface-muted text-center py-2">
          No tienes direcciones guardadas. Agrega una para continuar.
        </p>
      )}
    </div>
  );
}
