import { useState, useCallback } from 'react';
import { getPromotionSignature } from '../infrastructure/promotionApi/getPromotionSignature';
import { uploadToCloudinary } from '../infrastructure/promotionApi/uploadToCloudinary';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UseUploadPromotionImageReturn {
  file: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  error: string | null;
  selectFile: (file: File) => void;
  clearFile: () => void;
  /** Ejecuta firma + upload a Cloudinary. Retorna secure_url. */
  upload: () => Promise<string>;
  /** Inicializa con una URL existente (imagen ya subida). */
  setExistingUrl: (url: string) => void;
}

export function useUploadPromotionImage(): UseUploadPromotionImageReturn {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback(
    (f: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError('Solo se permiten imágenes JPG, PNG o WebP');
        return;
      }
      if (f.size > MAX_SIZE_BYTES) {
        setError('La imagen no puede pesar más de 10 MB');
        return;
      }

      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);

      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl],
  );

  const clearFile = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  const setExistingUrl = useCallback((url: string) => {
    setPreviewUrl(url);
    setFile(null);
    setError(null);
  }, []);

  const upload = useCallback(async (): Promise<string> => {
    if (!file) throw new Error('No hay archivo seleccionado');

    setIsUploading(true);
    setError(null);
    try {
      const signature = await getPromotionSignature();
      const result = await uploadToCloudinary(file, signature);
      return result.secure_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir la imagen';
      setError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  return { file, previewUrl, isUploading, error, selectFile, clearFile, upload, setExistingUrl };
}
