import { useState } from 'react';
import Link from 'next/link';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import type { ProductDetail as ProductDetailType, ProductVariant, ImageJson, DisplayPromotion } from '../../domain/types';

interface ProductDetailProps {
  product: ProductDetailType;
}

const BADGE_MAP: Record<string, { label: string; color: string }> = {
  'pieza-unica': { label: 'PIEZA ÚNICA', color: '#FF7A00' },
  'edicion-limitada': { label: 'ED. LIMITADA', color: '#F0177A' },
};

function derivePromoLabel(promo: DisplayPromotion): string | null {
  if (promo.display.badgeText) return promo.display.badgeText;
  if (promo.actionType === 'PERCENTAGE_DISCOUNT') {
    if (promo.discountPercentage != null) return `-${Math.round(promo.discountPercentage)}%`;
    if (promo.originalPriceInCents > 0) {
      const pct = Math.round((promo.discountAmountInCents / promo.originalPriceInCents) * 100);
      return pct > 0 ? `-${pct}%` : null;
    }
  }
  if (promo.actionType === 'BUY_X_GET_Y') {
    try {
      const { buyQuantity, getQuantity } = JSON.parse(promo.actionValue) as { buyQuantity: number; getQuantity: number };
      return `${buyQuantity}x${getQuantity}`;
    } catch {
      // fall through
    }
  }
  // Último recurso: nombre de la promo
  return promo.promotionName;
}

function deriveRibbonBadge(
  tags: string[],
  isFeatured: boolean,
  selectedVariantId: string,
  variantPromotions?: Record<string, DisplayPromotion[]>,
): { label: string; color: string } | null {
  const promo = variantPromotions?.[selectedVariantId]?.[0];
  if (promo) {
    const label = derivePromoLabel(promo);
    if (label) {
      return {
        label,
        color: promo.display.badgeColor ?? promo.display.colorPrimary ?? '#F0177A',
      };
    }
  }
  for (const [tag, config] of Object.entries(BADGE_MAP)) {
    if (tags.includes(tag)) return config;
  }
  if (isFeatured) return { label: 'DESTACADO', color: '#00C5D4' };
  return null;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-stroke" aria-hidden="true">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function Breadcrumb({ categorias }: { categorias: ProductDetailType['categorias'] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 lg:mb-8">
      <ol className="flex items-center gap-1.5 flex-wrap text-xs">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-on-surface-muted hover:text-turquoise transition-colors duration-150 font-semibold"
          >
            <HomeIcon />
            Inicio
          </Link>
        </li>
        {categorias.map((cat) => (
          <li key={cat.id} className="flex items-center gap-1.5">
            <ChevronRightIcon />
            <Link
              href={`/category/${cat.slug}`}
              className="text-on-surface-muted hover:text-turquoise transition-colors duration-150 font-semibold"
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart, addingId, successId } = useAddToCart();

  // Lifted state: both gallery and info panel react to the selected variant
  const defaultVariant: ProductVariant =
    product.variants.find((v) => v.inStock) ?? product.variants[0]!;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);

  const galleryImages: ImageJson[] = selectedVariant.images ?? [];
  const transitionName = `product-img-${product.id}`;
  const isAdding = addingId === product.id;
  const isSuccess = successId === product.id;

  // Derive ribbon badge for gallery (same logic as ProductInfo.deriveBadge)
  const ribbonBadge = deriveRibbonBadge(product.tags, product.isFeatured, selectedVariant.id, product.variantPromotions);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-6 lg:py-10">
      <Breadcrumb categorias={product.categorias} />

      <div className="lg:grid lg:grid-cols-2 lg:gap-10 xl:gap-14">
        {/* ── Left: Gallery (sticky on desktop) ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ProductGallery
            productId={product.id}
            images={galleryImages}
            title={product.title}
            transitionName={transitionName}
            ribbonBadge={ribbonBadge}
          />
        </div>

        {/* ── Right: Info panel ── */}
        <div className="mt-6 lg:mt-0">
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            onAddToCart={addToCart}
            isAdding={isAdding}
            isSuccess={isSuccess}
          />
        </div>
      </div>
    </div>
  );
}
