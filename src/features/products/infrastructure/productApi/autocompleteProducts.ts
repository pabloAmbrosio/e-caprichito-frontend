import type { AutocompleteSuggestion } from '../../domain/types/AutocompleteSuggestion';
import { BASE_URL } from '@/shared/utils/apiConfig';

export async function autocompleteProducts(
  query: string,
  limit = 6,
  offset = 0,
): Promise<AutocompleteSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({ q: trimmed, limit: String(limit), offset: String(offset) });
  const response = await fetch(`${BASE_URL}/api/products/autocomplete?${params}`, {
    credentials: 'include',
  });

  if (!response.ok) return [];

  const json = (await response.json()) as {
    data: { items: AutocompleteSuggestion[] };
  };

  return json.data.items;
}
