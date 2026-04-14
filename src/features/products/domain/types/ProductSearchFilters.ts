export interface SortOption {
  field: 'category' | 'title' | 'createdAt' | 'random' | 'price' | 'sales' | 'likes';
  direction: 'asc' | 'desc';
}

export interface ProductSearchFilters {
  categoryIds?: string[];
  title?: string;
  tags?: string[];
  isFeatured?: boolean;
  minPriceInCents?: number;
  maxPriceInCents?: number;
  createdFrom?: string;
  createdTo?: string;
  sort?: SortOption[];
  limit?: number;
  offset?: number;
  randomSeed?: number;
  includeSales?: boolean;
  includeLikes?: boolean;
}
