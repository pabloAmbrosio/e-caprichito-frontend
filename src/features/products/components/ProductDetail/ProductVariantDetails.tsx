import { useState } from 'react';
import type { ProductVariant } from '../../domain/types';

interface ProductVariantDetailsProps {
  variant: ProductVariant;
  description: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function ProductVariantDetails({ variant, description }: ProductVariantDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const detailEntries = Object.entries(variant.details).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );

  return (
    <div className="space-y-3">
      {/* Mini-grid — always visible */}
      {detailEntries.length > 0 && (
        <div className="rounded-xl border border-stroke bg-surface-overlay overflow-hidden">
          {detailEntries.map(([key, value], i) => (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-2.5 ${
                i < detailEntries.length - 1 ? 'border-b border-stroke/60' : ''
              }`}
            >
              <span className="text-xs font-semibold text-on-surface-muted capitalize min-w-[5rem] shrink-0">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-bold text-on-surface">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Accordion — description */}
      {description && (
        <div className="rounded-xl border border-stroke overflow-hidden">
          <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 text-left bg-surface hover:bg-surface-overlay transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-turquoise"
            aria-expanded={isOpen}
          >
            <span className="text-sm font-bold text-on-surface">Descripción</span>
            <ChevronIcon open={isOpen} />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="px-4 py-3 text-sm text-on-surface-muted leading-relaxed border-t border-stroke/60">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
