import { useState } from 'react';
import type { CreateAddressPayload } from '../domain/types/Address';
import { AddressAutocomplete } from './AddressAutocomplete';
import type { AddressAutocompleteValue } from './AddressAutocomplete';

interface AddressFormProps {
  onSubmit: (payload: CreateAddressPayload) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValues?: Partial<CreateAddressPayload>;
}

export function AddressForm({ onSubmit, onCancel, isLoading, initialValues }: AddressFormProps) {
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [autocompleteValue, setAutocompleteValue] = useState<AddressAutocompleteValue>({
    formattedAddress: initialValues?.formattedAddress ?? '',
    details: initialValues?.details ?? '',
    lat: initialValues?.lat ?? 0,
    lng: initialValues?.lng ?? 0,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!autocompleteValue.formattedAddress.trim()) {
      setError('Busca y selecciona una dirección');
      return;
    }
    if (autocompleteValue.lat === 0 && autocompleteValue.lng === 0) {
      setError('Selecciona una ubicación en el mapa');
      return;
    }

    try {
      await onSubmit({
        label: label.trim() || 'Mi dirección',
        formattedAddress: autocompleteValue.formattedAddress,
        details: autocompleteValue.details || undefined,
        lat: autocompleteValue.lat,
        lng: autocompleteValue.lng,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar dirección');
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      {/* Autocomplete + Map */}
      <AddressAutocomplete
        value={autocompleteValue}
        onChange={setAutocompleteValue}
        idPrefix="address-form"
      />

      {/* Optional label — secondary field */}
      <div>
        <label
          htmlFor="address-label"
          className="block text-[0.6875rem] font-semibold text-on-surface-muted/60 mb-1"
        >
          ¿Cómo quieres guardar esta dirección?
        </label>
        <input
          id="address-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej: Casa, Oficina..."
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg border border-stroke bg-surface text-xs text-on-surface font-medium placeholder:text-on-surface-muted/30 transition-all duration-200 outline-none focus:ring-2 focus:ring-turquoise focus:border-turquoise"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-pink shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-pink">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 disabled:opacity-60 hover:scale-[1.02] hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.35)] transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          {isLoading ? 'Guardando...' : 'Guardar dirección'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-muted border border-stroke hover:bg-surface-overlay transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
