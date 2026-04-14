/** Shape returned by the backend in variant.images[] */
export interface ImageJson {
  imageUrl: string;
  thumbnailUrl: string;
  alt?: string;
  order: number;
}

/** Shape accepted by the backend when sending images (thumbnailUrl is auto-generated) */
export type ImageJsonInput = Omit<ImageJson, 'thumbnailUrl'>;
