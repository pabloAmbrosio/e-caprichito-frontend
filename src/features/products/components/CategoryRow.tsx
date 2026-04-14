import { SectionHeader } from '@/shared/components/SectionHeader';
import { CategoryItem } from './CategoryItem';
import type { CategoryItemData } from './CategoryItem';

interface CategoryRowProps {
  categories: CategoryItemData[];
  size?: 'md' | 'lg';
  limit?: number;
}

export function CategoryRow({ categories, size = 'md', limit }: CategoryRowProps) {
  const items = limit ? categories.slice(0, limit) : categories;
  const gap = size === 'lg' ? 'gap-5' : 'gap-4';

  return (
    <section className="pt-7 pb-4 max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12">
      <SectionHeader title="Categorías Populares" viewAllHref="/categorias" />
      <div
        className={`flex ${gap} overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {items.map((cat) => (
          <CategoryItem key={cat.href} {...cat} size={size} />
        ))}
      </div>
    </section>
  );
}
