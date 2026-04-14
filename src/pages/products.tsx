import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { ProductsPage } from '@/features/products/components/ProductsPage';
import { StaleDataBanner } from '@/shared/components/StaleDataBanner';
import { getProductsPageData, type ProductsPageData } from '@/features/products/application/getProductsPageData';
import { withStaticPropsLogging } from '@/shared/utils';
import { useDataFreshness } from '@/shared/hooks/useDataFreshness';

const PRODUCTS_STALE_AFTER_MS = 10 * 60 * 1000; // 10 minutos

export default function ProductsRoute({
  navCategories,
  categoryTree,
  initialProducts,
  initialTotal,
  generatedAt,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const freshness = useDataFreshness({
    generatedAt,
    staleAfterMs: PRODUCTS_STALE_AFTER_MS,
  });

  return (
    <TiendaLayout categoryLinks={navCategories}>
      {freshness === 'stale' && <StaleDataBanner generatedAt={generatedAt} />}
      <ProductsPage
        initialProducts={initialProducts}
        initialTotal={initialTotal}
        categoryTree={categoryTree}
      />
    </TiendaLayout>
  );
}

export const getStaticProps: GetStaticProps<ProductsPageData> = () =>
  withStaticPropsLogging('ProductsRoute', async () => ({
    props: await getProductsPageData(),
    revalidate: 60,
  }));
