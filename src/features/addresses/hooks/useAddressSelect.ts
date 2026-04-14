import { useState, useEffect, useCallback } from 'react';
import type { DeliveryType } from '@/shared/types/enums';
import type { CalculateFeeResult } from '@/features/orders';
import { createOrderApi } from '@/features/orders';
import { useAddresses } from './useAddresses';

const orderApi = createOrderApi();

interface UseAddressSelectReturn {
  addresses: ReturnType<typeof useAddresses>['addresses'];
  isLoading: boolean;
  error: string | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  deliveryFee: number;
  resolvedDeliveryType: DeliveryType | null;
  feeLoading: boolean;
  feeAvailable: boolean;
  addAddress: ReturnType<typeof useAddresses>['addAddress'];
  refresh: ReturnType<typeof useAddresses>['refresh'];
}

export function useAddressSelect(): UseAddressSelectReturn {
  const { addresses, isLoading, error, addAddress, refresh } = useAddresses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feeResult, setFeeResult] = useState<CalculateFeeResult | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);

  // Auto-select default address when addresses load
  useEffect(() => {
    if (!selectedId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      setSelectedId(defaultAddr?.id ?? addresses[0]?.id ?? null);
    }
  }, [addresses, selectedId]);

  const calculateFee = useCallback(async () => {
    if (!selectedId) {
      setFeeResult(null);
      return;
    }
    setFeeLoading(true);
    try {
      const result = await orderApi.calculateDeliveryFee(selectedId);
      setFeeResult(result);
    } catch {
      setFeeResult(null);
    } finally {
      setFeeLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    void calculateFee();
  }, [calculateFee]);

  return {
    addresses,
    isLoading,
    error,
    selectedId,
    setSelectedId,
    deliveryFee: feeResult?.fee ?? 0,
    resolvedDeliveryType: feeResult?.deliveryType ?? null,
    feeLoading,
    feeAvailable: feeResult?.available ?? true,
    addAddress,
    refresh,
  };
}
