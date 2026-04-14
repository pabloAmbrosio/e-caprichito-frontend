import { useState, useEffect, useRef, useCallback } from 'react';
import type { AutocompleteSuggestion } from '../domain/types/AutocompleteSuggestion';
import { autocompleteProducts } from '../infrastructure/productApi/autocompleteProducts';

const DEBOUNCE_MS = 280;
const MIN_CHARS = 2;
const PAGE_SIZE = 6;

interface UseSearchAutocompleteReturn {
  query: string;
  setQuery: (value: string) => void;
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  clear: () => void;
}

export function useSearchAutocomplete(): UseSearchAutocompleteReturn {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_CHARS) {
      setSuggestions([]);
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    setIsLoading(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const items = await autocompleteProducts(trimmed, PAGE_SIZE);
        if (!controller.signal.aborted) {
          setSuggestions(items);
          setHasMore(items.length >= PAGE_SIZE);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [query]);

  const loadMore = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const items = await autocompleteProducts(trimmed, PAGE_SIZE, suggestions.length);
      setSuggestions((prev) => [...prev, ...items]);
      setHasMore(items.length >= PAGE_SIZE);
    } catch {
      // silently fail — user can retry by scrolling again
    } finally {
      setIsLoadingMore(false);
    }
  }, [query, suggestions.length, isLoadingMore, hasMore]);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setHasMore(false);
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  return { query, setQuery, suggestions, isLoading, isLoadingMore, hasMore, loadMore, clear };
}
