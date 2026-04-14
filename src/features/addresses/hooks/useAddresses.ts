import { useState, useEffect, useCallback } from 'react';
import type { Address, CreateAddressPayload, UpdateAddressPayload } from '../domain/types/Address';
import * as api from '../infrastructure/addressApi';

const MAX_ADDRESSES = 10;

interface UseAddressesReturn {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  addAddress: (payload: CreateAddressPayload) => Promise<Address>;
  updateAddress: (id: string, payload: UpdateAddressPayload) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listAddresses();
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar direcciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = useCallback(async (payload: CreateAddressPayload): Promise<Address> => {
    if (addresses.length >= MAX_ADDRESSES) {
      throw new Error(`Maximo ${MAX_ADDRESSES} direcciones permitidas`);
    }
    const created = await api.createAddress(payload);
    setAddresses((prev) => {
      // If new address is default, clear default from others
      if (created.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), created];
      }
      return [...prev, created];
    });
    return created;
  }, [addresses.length]);

  const updateAddress = useCallback(async (id: string, payload: UpdateAddressPayload): Promise<Address> => {
    const updated = await api.updateAddress(id, payload);
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) return updated;
        // If updated address became default, clear default from others
        if (updated.isDefault) return { ...a, isDefault: false };
        return a;
      }),
    );
    return updated;
  }, []);

  const deleteAddr = useCallback(async (id: string): Promise<void> => {
    await api.deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress: deleteAddr,
    refresh: fetchAddresses,
  };
}
