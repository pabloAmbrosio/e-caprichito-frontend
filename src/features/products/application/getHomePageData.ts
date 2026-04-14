import { createProductApi } from '../infrastructure/productApi';
import { mapCategoriesToNavLinks } from './mapCategoriesToNavLinks';
import { mapProductsToHeroSlides } from './mapProductsToHeroSlides';
import { mapCategoriesToCategoryRow } from './mapCategoriesToCategoryRow';
import { mapProductsToCardData, type ProductCardData } from './mapProductsToCardData';
import type { CategoryItemData } from '../components/CategoryItem';
import { createPromotionApi, mapBannersToPromoCards } from '@/features/promotions';
import type { HeroBannerSlide, HeroPromoCardData } from '@/shared/components/HeroGrid';
import type { CategoryLink } from '@/shared/components/Navbar';

export interface ProductSectionData {
  title: string;
  viewAllHref: string;
  products: ProductCardData[];
}

export interface HomePageData {
  navCategories: CategoryLink[];
  subcategories: CategoryItemData[];
  heroSlides: HeroBannerSlide[];
  heroPromoCards: HeroPromoCardData[];
  productSections: ProductSectionData[];
  generatedAt: number
}

export async function getHomePageData(): Promise<HomePageData> {
  let navCategories: CategoryLink[] = [];
  let subcategories: CategoryItemData[] = [];
  let heroSlides: HeroBannerSlide[] = [];
  let heroPromoCards: HeroPromoCardData[] = [];
  let productSections: ProductSectionData[] = [];

  const productApi = createProductApi();
  const promotionApi = createPromotionApi();

  // Phase 1: Get all categories (tree for navbar, flat for subcategory lookup)
  const { tree, flat } = await productApi.getCategories();

  navCategories = mapCategoriesToNavLinks(tree);
  subcategories = mapCategoriesToCategoryRow(flat);

  // Find "dama-ropa" subcategory for hero carousel
  const mujerCategory = flat.find((cat) => cat.slug === 'dama-ropa');

  // Phase 2: Build section definitions
  const sectionDefs = [
    // Fixed section: featured products
    {
      title: 'Destacados',
      viewAllHref: '/productos?featured=true',
      filters: { isFeatured: true, limit: 10, includeLikes: true },
    },
    // Dynamic sections: one per root category
    ...tree.map((cat) => ({
      title: `${cat.emoticon ?? '📦'} ${cat.name}`,
      viewAllHref: `/category/${cat.slug}`,
      filters: { categoryIds: [cat.id], limit: 10 },
    })),
  ];

  // Phase 3: Fetch everything in parallel
  const [heroProductsResult, bannersResult, ...sectionResults] = await Promise.allSettled([
    mujerCategory
      ? productApi.list({
          isFeatured: true,
          categoryIds: [mujerCategory.id],
          sort: [{ field: 'createdAt', direction: 'desc' }],
          limit: 10,
        })
      : Promise.resolve({ items: [], total: 0 }),
    promotionApi.getBanners(),
    ...sectionDefs.map((def) => productApi.list(def.filters)),
  ]);

  // Hero slides
  if (heroProductsResult.status === 'fulfilled') {
    heroSlides = mapProductsToHeroSlides(heroProductsResult.value.items);
  }

  // Promo cards
  if (bannersResult.status === 'fulfilled') {
    heroPromoCards = mapBannersToPromoCards(bannersResult.value);
  }

  // Product sections — deduplicate across sections
  const heroIds = new Set(heroSlides.map((s) => s.productId));
  const seenIds = new Set<string>(heroIds);
  productSections = sectionDefs
    .map((def, i) => {
      const result = sectionResults[i];
      if (result?.status !== 'fulfilled' || result.value.items.length === 0) return null;
      const products = mapProductsToCardData(result.value.items).filter((p) => {
        if (seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });
      if (products.length === 0) return null;
      return { title: def.title, viewAllHref: def.viewAllHref, products };
    })
    .filter((s): s is ProductSectionData => s !== null);

  return {
    navCategories,
    subcategories,
    heroSlides,
    heroPromoCards,
    productSections,
    generatedAt : Date.now()
  };
}
