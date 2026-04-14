export type CategoryTypeFilter = 'parents' | 'children' | 'all';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  emoticon: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface CategoryListResponse {
  tree: CategoryTreeNode[];
  flat: Category[];
}
