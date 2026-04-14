import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { ProductDetail } from '@/features/products/components/ProductDetail';
import { ProductsSection } from '@/features/products/components/ProductsSection';
import {
  getProductPageData,
  ProductHead,
  type ProductPageData,
} from '@/features/products';
import { isApiNotFound, withStaticPropsLogging } from '@/shared/utils';

export default function ProductPage({
  product,
  recommended,
  navCategories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const categorySlug = product.categorias[0]?.slug ?? '';

  return (
    <TiendaLayout categoryLinks={navCategories} showTopbar={false}>
      <ProductHead product={product} />

      <ProductDetail key={product.id} product={product} />

      {recommended.length > 0 && (
        <div className="border-t border-stroke/40 mt-4">
          <ProductsSection
            title="También te puede gustar"
            viewAllHref={`/category/${categorySlug}`}
            products={recommended}
          />
        </div>
      )}
    </TiendaLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<ProductPageData> = ({ params }) =>
  withStaticPropsLogging<ProductPageData>('ProductPage', async () => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return { notFound: true };

    try {
      const data = await getProductPageData(slug);
      return { props: data, revalidate: 60 };
    } catch (error) {
      if (isApiNotFound(error)) return { notFound: true };
      throw error;
    }
  });
