import { SectionHeader } from '@/shared/components/SectionHeader';
import { ProductCard } from './ProductCard';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import type { ProductCardData } from '../application/mapProductsToCardData';

interface ProductsSectionProps {
  title: string;
  viewAllHref: string;
  products: ProductCardData[];
}

export function ProductsSection({ title, viewAllHref, products }: ProductsSectionProps) {
  const { addToCart, addingId, successId } = useAddToCart();

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-6 lg:py-8">
      <SectionHeader title={title} viewAllHref={viewAllHref} />

      {/* Mobile/Tablet: horizontal scroll — Desktop: grid */}
      <div className="lg:hidden -mx-4 md:-mx-8 px-4 md:px-8">
        <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[10rem] sm:w-[12rem] flex-shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onAddToCart={addToCart}
                isAdding={addingId === product.id}
                isSuccess={successId === product.id}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-4">
        {products.slice(0, 10).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            isAdding={addingId === product.id}
            isSuccess={successId === product.id}
          />
        ))}
      </div>
    </section>
  );
}
