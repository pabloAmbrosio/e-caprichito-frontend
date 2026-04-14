import Link from 'next/link';
import type { CategoryPageInfo, ParentCategoryInfo } from '../../application/getCategoryPageData';

interface CategoryPageHeaderProps {
  category: CategoryPageInfo;
  total: number;
  parentCategory?: ParentCategoryInfo | null;
}

export function CategoryPageHeader({ category, total, parentCategory }: CategoryPageHeaderProps) {
  return (
    <div className="mb-6">
      {parentCategory && (
        <Link
          href={`/category/${parentCategory.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted font-bold hover:text-turquoise transition-colors duration-200 mb-3"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          {parentCategory.emoticon && (
            <span aria-hidden="true">{parentCategory.emoticon}</span>
          )}
          {parentCategory.name}
        </Link>
      )}

      <div className="flex items-center gap-3">
        <div
          className="w-1 h-8 rounded-full shrink-0"
          style={{ background: 'linear-gradient(180deg, #00C5D4, #F0177A)' }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-2.5">
          {category.emoticon && (
            <span className="text-3xl" aria-hidden="true">
              {category.emoticon}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-black text-on-surface">
            {category.name}
          </h1>
        </div>
      </div>

      {category.description && (
        <p className="text-sm text-on-surface-muted mt-2 max-w-2xl ml-4">
          {category.description}
        </p>
      )}

      <p className="text-sm text-on-surface-muted mt-2 ml-4">
        {total} producto{total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
