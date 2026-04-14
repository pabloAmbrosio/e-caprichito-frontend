import type { PaymentRepository } from '../../domain/PaymentRepository';
import { createPayment } from './createPayment';
import { uploadProof } from './uploadProof';
import { getPaymentById } from './getPaymentById';
import { listPayments } from './listPayments';
import { backofficeListPayments } from './backofficeListPayments';
import { backofficeGetPaymentById } from './backofficeGetPaymentById';
import { backofficeReviewPayment } from './backofficeReviewPayment';

// Payment flow (MANUAL_TRANSFER):
// 1. POST /api/payments          -> status: PENDING
// 2. PATCH /api/payments/:id/proof -> status: AWAITING_REVIEW
// 3. PATCH /backoffice/.../review  -> APPROVED or REJECTED
//    - APPROVED: Order -> CONFIRMED, physical stock decremented
//    - REJECTED: reserved stock released, Order stays PENDING
//
// When a payment is approved, the backend emits a WebSocket event 'pago:confirmado'
// with the orderId. See paymentSocket.ts for the socket connection.

// Cloudinary upload (standalone — not part of PaymentRepository)
export { getUploadSignature, type CloudinarySignature } from './getUploadSignature';
export { uploadToCloudinary, type CloudinaryUploadResult } from './uploadToCloudinary';

export function createPaymentApi(): PaymentRepository {
  return {
    create: createPayment,
    uploadProof,
    getById: getPaymentById,
    list: listPayments,
    backofficeList: backofficeListPayments,
    backofficeGetById: backofficeGetPaymentById,
    backofficeReview: backofficeReviewPayment,
  };
}
