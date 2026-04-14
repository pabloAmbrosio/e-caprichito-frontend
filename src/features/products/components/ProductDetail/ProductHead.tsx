import Head from 'next/head';
import type { ProductDetail } from '../../domain/types';

interface ProductHeadProps {
  product: ProductDetail;
}

export function ProductHead({ product }: ProductHeadProps) {
  const ogImage = product.variants[0]?.images?.[0]?.imageUrl ?? '';
  const description = product.description.slice(0, 155);

  return (
    <Head>
      <title>{`${product.title} — La Central Caribeña`}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${product.title} — La Central Caribeña`} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="product" />
      <link rel="canonical" href={`/product/${product.slug}`} />
    </Head>
  );
}
