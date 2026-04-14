import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { TiendaLayout } from '@/shared/layouts/TiendaLayout';
import { HeroGrid } from '@/shared/components/HeroGrid';
import { CategoryRow } from '@/features/products/components/CategoryRow';
import { ProductsSectionList } from '@/shared/components/ProductsSectionList';
import { StaleDataBanner } from '@/shared/components/StaleDataBanner';
import { getHomePageData, type HomePageData } from '@/features/products';
import { withStaticPropsLogging } from '@/shared/utils';
import { useDataFreshness } from '@/shared/hooks/useDataFreshness';

const HOME_STALE_AFTER_MS = 10 * 60 * 1000; // 10 minutos

export default function HomePage({
  navCategories,
  subcategories,
  heroSlides,
  heroPromoCards,
  productSections,
  generatedAt,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const freshness = useDataFreshness({
    generatedAt,
    staleAfterMs: HOME_STALE_AFTER_MS,
  });

  return (
    <TiendaLayout categoryLinks={navCategories}>
      {freshness === 'stale' && <StaleDataBanner generatedAt={generatedAt} />}
      <HeroGrid slides={heroSlides} promoCards={heroPromoCards} />
      <CategoryRow categories={subcategories} size="lg" />
      <ProductsSectionList sections={productSections} />
    </TiendaLayout>
  );
}

export const getStaticProps: GetStaticProps<HomePageData> = () =>
  withStaticPropsLogging('HomePage', async () => ({
    
    props: await getHomePageData(),
    revalidate: 60,
  }));
