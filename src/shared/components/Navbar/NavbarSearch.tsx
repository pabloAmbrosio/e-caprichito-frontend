import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSearchAutocomplete } from '@/features/products/hooks/useSearchAutocomplete';

interface NavbarSearchProps {
  placeholder: string;
  buttonLabel: string;
}

export function NavbarSearch({ placeholder, buttonLabel }: NavbarSearchProps) {
  const router = useRouter();
  const { query, setQuery, suggestions, isLoading, isLoadingMore, hasMore, loadMore, clear } = useSearchAutocomplete();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const showDropdown = isOpen && query.trim().length >= 2;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
      clear();
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events, clear]);

  // Reset active index only on new searches (not loadMore appends)
  const prevQueryRef = useRef(query);
  useEffect(() => {
    if (prevQueryRef.current !== query) {
      setActiveIndex(-1);
      prevQueryRef.current = query;
    }
  }, [query, suggestions]);

  // Load more on scroll to bottom
  useEffect(() => {
    const listbox = listboxRef.current;
    if (!listbox || !hasMore) return;

    function handleScroll() {
      if (!listbox) return;
      const { scrollTop, scrollHeight, clientHeight } = listbox;
      if (scrollHeight - scrollTop - clientHeight < 40) {
        loadMore();
      }
    }

    listbox.addEventListener('scroll', handleScroll, { passive: true });
    return () => listbox.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore]);

  const navigateToProduct = useCallback(
    (slug: string) => {
      setIsOpen(false);
      clear();
      void router.push(`/product/${slug}`);
    },
    [router, clear],
  );

  function handleInputChange(value: string) {
    setQuery(value);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) {
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          navigateToProduct(suggestions[activeIndex].slug);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    const option = listboxRef.current.children[activeIndex] as HTMLElement | undefined;
    option?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const hasResults = suggestions.length > 0;
  const noResults = !isLoading && !hasResults && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="group hidden lg:flex flex-1 relative">
      <search
        role="search"
        className="flex flex-1 items-center bg-surface border-2 border-stroke rounded-full px-3 py-2 gap-2 transition-all duration-200 hover:border-turquoise/50 focus-within:border-turquoise focus-within:shadow-[0_0_0_0.25rem_rgba(0,197,212,0.12)]"
      >
        <label htmlFor="navbar-search" className="sr-only">Buscar productos</label>

        {/* Search icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="w-4 h-4 text-on-surface-muted group-focus-within:text-turquoise transition-colors duration-200 shrink-0 ml-1"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          id="navbar-search"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-listbox"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          aria-autocomplete="list"
          className="border-none bg-transparent outline-none font-nunito text-sm font-semibold flex-1 text-on-surface placeholder:text-on-surface-muted/60"
        />

        {/* Clear button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => { clear(); inputRef.current?.focus(); }}
            aria-label="Limpiar búsqueda"
            className="shrink-0 min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center rounded-full text-on-surface-muted/60 hover:text-pink hover:bg-pink/8 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
              navigateToProduct(suggestions[activeIndex].slug);
            } else if (suggestions.length > 0 && suggestions[0]) {
              navigateToProduct(suggestions[0].slug);
            }
          }}
          className="shrink-0 border-none rounded-full text-white text-xs font-nunito font-extrabold px-4 py-1.5 cursor-pointer transition-all duration-200 hover:shadow-[0_0.25rem_0.75rem_rgba(0,197,212,0.4)] hover:scale-[1.03] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 outline-none"
          style={{ background: 'linear-gradient(135deg, #00C5D4, #009BAB)' }}
        >
          {buttonLabel}
        </button>
      </search>

      {/* ── Dropdown de sugerencias ─────────────────────────────── */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-stroke rounded-2xl shadow-lg overflow-hidden z-[80] animate-[searchDropdownIn_0.2s_ease]"
        >
          {/* Loading skeleton */}
          {isLoading && !hasResults && (
            <div className="p-2" role="status" aria-label="Buscando productos">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-11 h-11 rounded-xl bg-surface-overlay animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded-full bg-surface-overlay animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded-full bg-surface-overlay animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results list */}
          {hasResults && (
            <ul
              ref={listboxRef}
              id="search-listbox"
              role="listbox"
              aria-label="Sugerencias de productos"
              className="p-1.5 max-h-[22rem] overflow-y-auto scrollbar-hide"
            >
              {suggestions.map((item, i) => (
                <li
                  key={item.id}
                  id={`search-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => navigateToProduct(item.slug)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    i === activeIndex
                      ? 'bg-turquoise/[0.07] shadow-[inset_0_0_0_1px_rgba(0,197,212,0.15)]'
                      : 'hover:bg-surface-overlay'
                  }`}
                  style={{
                    animation: `searchItemIn 0.25s ease ${i * 0.04}s both`,
                  }}
                >
                  {/* Thumbnail */}
                  <div className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border transition-colors duration-150 ${
                    i === activeIndex ? 'border-turquoise/30' : 'border-stroke'
                  }`}>
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-on-surface-muted/30" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-nunito text-sm font-bold truncate transition-colors duration-150 ${
                      i === activeIndex ? 'text-turquoise' : 'text-on-surface'
                    }`}>
                      <HighlightMatch text={item.title} query={query} />
                    </p>
                    <p className="font-nunito text-xs text-on-surface-muted/60 truncate mt-0.5">
                      Ver producto
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className={`w-4 h-4 shrink-0 transition-all duration-150 ${
                      i === activeIndex
                        ? 'text-turquoise translate-x-0 opacity-100'
                        : 'text-on-surface-muted/30 -translate-x-1 opacity-0'
                    }`}
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </li>
              ))}

              {/* Loading more spinner */}
              {isLoadingMore && (
                <li className="flex items-center justify-center py-3" aria-label="Cargando más resultados">
                  <div className="w-5 h-5 border-2 border-turquoise/30 border-t-turquoise rounded-full animate-spin" />
                </li>
              )}
            </ul>
          )}

          {/* No results */}
          {noResults && (
            <div className="px-5 py-8 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-pink/[0.06] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-pink/60" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                  <path strokeLinecap="round" d="M8.5 8.5l5 5M13.5 8.5l-5 5" />
                </svg>
              </div>
              <p className="font-nunito text-sm font-bold text-on-surface">
                Sin resultados
              </p>
              <p className="font-nunito text-xs text-on-surface-muted mt-1">
                No encontramos productos para &ldquo;{query.trim()}&rdquo;
              </p>
            </div>
          )}

          {/* Subtle loading bar at bottom when refining */}
          {isLoading && hasResults && (
            <div className="h-0.5 bg-surface-overlay overflow-hidden">
              <div className="h-full w-1/3 bg-turquoise/40 rounded-full animate-[searchLoadingSlide_1s_ease_infinite]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Highlight matching text ─────────────────────────────────── */

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-turquoise font-extrabold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
