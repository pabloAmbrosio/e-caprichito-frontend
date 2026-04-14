export type {
  ManualTransferProofData,
  Payment,
  BackofficePayment,
} from './domain/types';

export type { PaymentRepository } from './domain/PaymentRepository';

export { createPaymentApi } from './infrastructure/paymentApi';
export { connectPaymentSocket, disconnectPaymentSocket } from './infrastructure/paymentSocket';
export { connectStaffSocket, disconnectStaffSocket } from './infrastructure/staffSocket';
export type { PaymentProofNotification, OrderCreatedNotification } from './infrastructure/staffSocket';

export { useMyPayments } from './hooks/useMyPayments';
export { useUploadProof } from './hooks/useUploadProof';
export { useStaffSocket } from './hooks/useStaffSocket';
export { usePaymentProofListener } from './hooks/usePaymentProofListener';
export { useOnPaymentProof } from './hooks/useOnPaymentProof';
export { useOrderCreatedListener } from './hooks/useOrderCreatedListener';
export { useOnOrderCreated } from './hooks/useOnOrderCreated';
export { ProofUploadZone } from './components/ProofUploadZone';
