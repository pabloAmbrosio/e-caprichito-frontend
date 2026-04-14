import type { DeliveryType } from '@/shared/types/enums';

export interface CalculateFeeResult {
  deliveryType: DeliveryType;
  fee: number;
  available: boolean;
  distanceKm?: number;
}
