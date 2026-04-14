import type { Category } from '../domain/types';
import type { CategoryItemData } from '../components/CategoryItem';

export function mapCategoriesToCategoryRow(categories: Category[]): CategoryItemData[] {
  return categories
    .filter((cat) => cat.parentId !== null && cat.isActive)
    .map((cat) => ({
      label: cat.name,
      href: `/category/${cat.slug}`,
      image: cat.image ?? undefined,
      fallbackInitial: cat.name.charAt(0).toUpperCase(),
    }));
}
