export interface Address {
  id: string;
  label: string;
  formattedAddress: string;
  details: string | null;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  label: string;
  formattedAddress: string;
  details?: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  formattedAddress?: string;
  details?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}
