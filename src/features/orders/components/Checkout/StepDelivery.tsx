import type { DeliveryType } from '@/shared/types/enums';
import { DeliveryOption } from './DeliveryOption';
import { AddressSelect } from '@/features/addresses';

interface StepDeliveryProps {
  isPickup: boolean;
  onPickupChange: (isPickup: boolean) => void;
  onAddressSelect: (addressId: string | null, fee: number, deliveryType: DeliveryType) => void;
  canContinue: boolean;
  onContinue: () => void;
}

export function StepDelivery({
  isPickup,
  onPickupChange,
  onAddressSelect,
  canContinue,
  onContinue,
}: StepDeliveryProps) {
  return (
    <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-stroke flex items-center gap-2">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
          aria-hidden="true"
        />
        <h2 className="text-sm font-extrabold text-on-surface">
          ¿Cómo quieres recibir tu pedido?
        </h2>
      </div>

      <div className="p-5 flex flex-col gap-3">
        {/* Delivery option — backend decides HOME_DELIVERY vs SHIPPING by distance */}
        <DeliveryOption
          selected={!isPickup}
          onClick={() => onPickupChange(false)}
          icon="🚚"
          label="Envío a domicilio"
        >
          <AddressSelect onSelect={onAddressSelect} />
        </DeliveryOption>

        {/* Pickup option */}
        <DeliveryOption
          selected={isPickup}
          onClick={() => onPickupChange(true)}
          icon="🏪"
          label="Recoger en tienda"
          badge="GRATIS"
        >
          <div className="flex flex-col gap-2 text-xs text-on-surface-muted font-medium leading-relaxed">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Sabancuy, Campeche</span>
            </div>
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-turquoise shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Lun – Sáb &middot; 10:00am – 7:00pm</span>
            </div>
          </div>
        </DeliveryOption>

        {/* Continue button */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full mt-2 py-3.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_1rem_rgba(0,197,212,0.4)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none disabled:opacity-40 disabled:pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
