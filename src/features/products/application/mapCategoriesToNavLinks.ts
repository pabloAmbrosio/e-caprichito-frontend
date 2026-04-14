import type { Category } from '../domain/types';
import type { CategoryLink } from '@/shared/components/Navbar';

export function mapCategoriesToNavLinks(categories: Category[]): CategoryLink[] {
  return categories.map((cat) => ({
    href: `/category/${cat.slug}`,
    label: cat.name,
    emoji: cat.emoticon ?? '📦',
  }));
}
