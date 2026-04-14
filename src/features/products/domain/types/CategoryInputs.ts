export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
  sortOrder?: number;
}
