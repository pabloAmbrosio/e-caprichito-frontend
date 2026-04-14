import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ProofUploadZoneProps {
  file: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  error: string | null;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
  bankReference: string;
  onBankReferenceChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ProofUploadZone({
  file,
  previewUrl,
  isUploading,
  error,
  onSelectFile,
  onClearFile,
  bankReference,
  onBankReferenceChange,
  onSubmit,
  isSubmitting,
}: ProofUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onSelectFile(droppedFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onSelectFile(selected);
    // Reset para permitir re-seleccionar el mismo archivo
    if (inputRef.current) inputRef.current.value = '';
  };

  const openFilePicker = () => inputRef.current?.click();

  const busy = isUploading || isSubmitting;

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Seleccionar comprobante de pago"
        tabIndex={-1}
      />

      {/* Drop zone / Preview */}
      {!file ? (
        /* ── Empty state: drop zone ── */
        <button
          type="button"
          onClick={openFilePicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 outline-none',
            'focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2',
            isDragging
              ? 'border-turquoise bg-turquoise/5'
              : 'border-stroke hover:border-turquoise/40 hover:bg-surface-overlay/50',
          ].join(' ')}
        >
          {/* Cloud upload icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-8 h-8 text-on-surface-muted/40"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
            />
          </svg>
          <span className="text-sm font-bold text-on-surface-muted">
            {isDragging ? 'Suelta la imagen aquí' : 'Arrastra tu comprobante aquí'}
          </span>
          <span className="text-xs text-on-surface-muted/60">o haz click para seleccionar</span>
          <span id="proof-restrictions" className="text-xs text-on-surface-muted/40 mt-1">
            JPG, PNG o WebP · Max 10 MB
          </span>
        </button>
      ) : (
        /* ── Preview state ── */
        <div className="rounded-xl border border-stroke overflow-hidden">
          {/* Image preview */}
          <div className="relative bg-surface-overlay flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl ?? ''}
              alt="Preview del comprobante"
              className="max-h-48 w-full object-contain"
            />
            {/* Uploading overlay */}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/70 backdrop-blur-[2px]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border-2 border-turquoise/30 border-t-turquoise animate-spin"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-bold text-on-surface">Subiendo...</span>
                </div>
              </div>
            )}
          </div>
          {/* File info bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-stroke">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate">{file.name}</p>
              <p className="text-xs text-on-surface-muted">{formatFileSize(file.size)}</p>
            </div>
            {!busy && (
              <>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="shrink-0 text-xs font-bold text-turquoise hover:text-turquoise-dark transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 rounded px-1.5 py-0.5"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={onClearFile}
                  aria-label="Eliminar imagen seleccionada"
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-on-surface-muted hover:text-pink hover:bg-pink/10 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-pink"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bank reference input */}
      <div>
        <label htmlFor="bank-ref-upload" className="block text-xs font-bold text-on-surface-muted mb-1.5">
          Referencia bancaria (opcional)
        </label>
        <input
          id="bank-ref-upload"
          type="text"
          value={bankReference}
          onChange={(e) => onBankReferenceChange(e.target.value)}
          placeholder="Ej. 123456789"
          className="w-full px-4 py-3 rounded-xl text-sm font-medium text-on-surface bg-surface border border-stroke focus:ring-2 focus:ring-turquoise focus:border-transparent outline-none transition-shadow duration-150 placeholder:text-on-surface-muted/40"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl bg-pink/5 dark:bg-pink/10 border border-pink/20 dark:border-pink/30"
          role="alert"
          aria-live="polite"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-pink shrink-0" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-semibold text-pink">{error}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!file || busy}
        className="w-full py-3.5 rounded-xl text-sm font-extrabold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0.25rem_1rem_rgba(240,23,122,0.4)] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-none"
        style={{ background: 'linear-gradient(135deg, #F0177A, #C0005A)' }}
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden="true"
            />
            Subiendo...
          </span>
        ) : (
          'Enviar comprobante'
        )}
      </button>
    </div>
  );
}
