interface CheckoutProgressProps {
  currentStep: 1 | 2;
}

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8" aria-label="Progreso del checkout">
      {/* Step 1 */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 text-white"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          {currentStep > 1 ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4" aria-hidden="true">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            '1'
          )}
        </div>
        <span className="text-xs font-bold text-turquoise">Entrega</span>
      </div>

      {/* Connector */}
      <div
        className={`w-20 sm:w-32 h-0.5 mx-3 mb-5 rounded-full transition-colors duration-300 ${
          currentStep > 1 ? 'bg-turquoise' : 'bg-stroke'
        }`}
      />

      {/* Step 2 */}
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold transition-all duration-300 ${
            currentStep >= 2
              ? 'text-white'
              : 'text-on-surface-muted border-2 border-stroke bg-surface'
          }`}
          style={currentStep >= 2 ? { background: 'linear-gradient(135deg, #00C5D4, #009BAB)' } : undefined}
        >
          2
        </div>
        <span className={`text-xs font-bold transition-colors duration-300 ${currentStep >= 2 ? 'text-turquoise' : 'text-on-surface-muted'}`}>
          Confirmar
        </span>
      </div>
    </div>
  );
}
