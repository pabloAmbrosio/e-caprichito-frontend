import { ProductsSection } from '@/features/products/components/ProductsSection';
import type { ProductSectionData } from '@/features/products';

interface ProductsSectionListProps {
  sections: ProductSectionData[];
}

export function ProductsSectionList({ sections }: ProductsSectionListProps) {
  return (
    <>
      {sections.map((section) => (
        <ProductsSection
          key={section.viewAllHref}
          title={section.title}
          viewAllHref={section.viewAllHref}
          products={section.products}
        />
      ))}
    </>
  );
}
