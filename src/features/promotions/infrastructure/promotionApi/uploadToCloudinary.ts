import type { CloudinarySignature } from './getPromotionSignature';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export async function uploadToCloudinary(
  file: File,
  params: CloudinarySignature,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', params.signature);
  formData.append('timestamp', String(params.timestamp));
  formData.append('api_key', params.apiKey);
  formData.append('folder', params.folder);
  if (params.transformation) {
    formData.append('transformation', params.transformation);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    const message =
      (errorBody as { error?: { message?: string } } | null)?.error?.message ??
      `Error al subir imagen (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}
