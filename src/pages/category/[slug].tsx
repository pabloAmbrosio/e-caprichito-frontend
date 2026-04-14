import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { CategoryPage } from '@/features/products/components/CategoryPage';
import { StaleDataBanner } from '@/shared/components/StaleDataBanner';
import { getCategoryPageData, type CategoryPageData } from '@/features/products';
import { isApiNotFound, withStaticPropsLogging } from '@/shared/utils';
import { useDataFreshness } from '@/shared/hooks/useDataFreshness';

const CATEGORY_STALE_AFTER_MS = 10 * 60 * 1000; // 10 minutos

export default function CategorySlugPage({
  navCategories,
  category,
  subcategories,
  initialProducts,
  initialTotal,
  categoryIds,
  initialSubcategoryId,
  parentCategory,
  generatedAt,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const freshness = useDataFreshness({
    generatedAt,
    staleAfterMs: CATEGORY_STALE_AFTER_MS,
  });

  return (
    <TiendaLayout categoryLinks={navCategories}>
      {freshness === 'stale' && <StaleDataBanner generatedAt={generatedAt} />}
      <CategoryPage
        category={category}
        subcategories={subcategories}
        initialProducts={initialProducts}
        initialTotal={initialTotal}
        categoryIds={categoryIds}
        initialSubcategoryId={initialSubcategoryId}
        parentCategory={parentCategory}
      />
    </TiendaLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<CategoryPageData> = ({ params }) =>
  withStaticPropsLogging<CategoryPageData>('CategorySlugPage', async () => {
    const slug = params?.slug;
    if (typeof slug !== 'string') return { notFound: true };

    try {
      const data = await getCategoryPageData(slug);
      return { props: data, revalidate: 60 };
    } catch (error) {
      if (isApiNotFound(error)) return { notFound: true };
      throw error;
    }
  });
