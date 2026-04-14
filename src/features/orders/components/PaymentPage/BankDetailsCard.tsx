import { useState } from 'react';
import type { PaymentInfoBankDetails } from '../../domain/types';

interface BankDetailsCardProps {
  bankDetails: PaymentInfoBankDetails;
  concepto: string;
  total: number;
}

function formatPrice(value: number): string {
  return (value / 100).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="inline-flex items-center gap-1 text-xs font-bold text-turquoise hover:text-turquoise-dark transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-turquoise rounded"
      aria-label={`Copiar ${label}`}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10.5 3a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v6.5a.75.75 0 0 1-.75.75h-7a.75.75 0 0 1-.75-.75v-10A.75.75 0 0 1 3.5 2.5h6.25a.75.75 0 0 1 .75.5ZM4.25 4v8.5h5.5V6.75H9a.75.75 0 0 1-.75-.75V4H4.25Z" />
            <path d="M13.25 1.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-7.5H6a.75.75 0 0 1 0-1.5h6.5a.75.75 0 0 1 .75.25Z" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

export function BankDetailsCard({ bankDetails, concepto, total }: BankDetailsCardProps) {
  return (
    <div className="bg-surface rounded-2xl border border-stroke overflow-hidden">
      {/* Brand gradient stripe */}
      <div
        aria-hidden="true"
        className="h-[0.1875rem]"
        style={{ background: 'linear-gradient(90deg, #00C5D4, #F0177A, #FF7A00)' }}
      />

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: 'linear-gradient(180deg, #00C5D4, #009BAB)' }}
            aria-hidden="true"
          />
          <h3 className="text-sm font-extrabold text-on-surface">Datos para transferencia o depósito</h3>
        </div>

        {/* Instruction banner */}
        <div className="p-3.5 rounded-xl bg-turquoise/5 dark:bg-turquoise/10 border border-turquoise/20 dark:border-turquoise/30">
          <p className="text-sm font-bold text-on-surface leading-relaxed">
            Transfiere exactamente{' '}
            <span className="text-turquoise font-black">{formatPrice(total)}</span>
            {' '}con el concepto:{' '}
            <span className="text-turquoise font-black">{concepto}</span>
          </p>
        </div>

        {/* Bank details */}
        <div className="flex flex-col gap-3">
          <DetailRow label="Banco" value={bankDetails.bankName} />
          <DetailRow label="Titular" value={bankDetails.accountHolder} />
          <DetailRow label="CLABE" value={bankDetails.clabe} copyable />
          <DetailRow label="No. de cuenta" value={bankDetails.accountNumber} copyable />
          <DetailRow label="Concepto" value={concepto} copyable />
          <DetailRow label="Monto" value={formatPrice(total)} copyable copyValue={String(total / 100)} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable,
  copyValue,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copyValue?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-stroke/50 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-on-surface-muted">{label}</p>
        <p className="text-sm font-bold text-on-surface break-all">{value}</p>
      </div>
      {copyable && (
        <div className="shrink-0">
          <CopyButton value={copyValue ?? value} label={label} />
        </div>
      )}
    </div>
  );
}
