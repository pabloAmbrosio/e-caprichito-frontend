import type { Address, CreateAddressPayload, UpdateAddressPayload } from '../domain/types/Address';
import { BASE_URL } from '@/shared/utils/apiConfig';
import { authFetch } from '@/features/auth';
import { handleApiResponse } from '@/shared/utils/apiError';

export async function listAddresses(): Promise<Address[]> {
  const response = await authFetch(`${BASE_URL}/api/addresses`);
  return handleApiResponse(response);
}

export async function createAddress(payload: CreateAddressPayload): Promise<Address> {
  const response = await authFetch(`${BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleApiResponse(response);
}

export async function updateAddress(addressId: string, payload: UpdateAddressPayload): Promise<Address> {
  const response = await authFetch(`${BASE_URL}/api/addresses/${addressId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleApiResponse(response);
}

export async function deleteAddress(addressId: string): Promise<void> {
  const response = await authFetch(`${BASE_URL}/api/addresses/${addressId}`, {
    method: 'DELETE',
  });
  await handleApiResponse(response);
}
