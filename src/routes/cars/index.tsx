import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { X, ShoppingCart, CheckCircle, ArrowLeft, Heart, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { catalog, fmtPrice } from "@/data/cars";
import type { CarListing } from "@/data/cars";

import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/cars/")({
  head: () => ({
    meta: [
      { title: "Inventory — Marque" },
      {
        name: "description",
        content:
          "Browse verified high-performance and collector automobiles across the Marque network.",
      },
      { property: "og:title", content: "Inventory — Marque" },
      {
        property: "og:description",
        content:
          "Browse verified high-performance and collector automobiles across the Marque network.",
      },
    ],
  }),
  component: InventoryPage,
});

type Category = "All" | "GT" | "Sports" | "Supercar" | "Electric" | "Classic" | "Hypercar";

const categories: Category[] = ["All", "GT", "Sports", "Supercar", "Electric", "Classic"];
const sorts = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price ↑" },
  { key: "price-desc", label: "Price ↓" },
  { key: "year-desc", label: "Newest" },
  { key: "hp-desc", label: "Power" },
] as const;

const FILTERS_KEY = "marque_filters";
const FAVORITES_KEY = "marque_favorites";

function readFilters(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(FILTERS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeFilters(filters: Record<string, unknown>) {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
}

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

type SortKey = (typeof sorts)[number]["key"];

// ─── useDebounce ───────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── HighlightedText ───────────────────────────────────────────
function HighlightedText({ text, query, className }: { text: string; query: string; className?: string }) {
  if (!query.trim()) return <span className={className}>{text}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-accent/15 text-accent rounded-sm">{part}</mark>
          : part
      )}
    </span>
  );
}

// ─── SearchResultRow ───────────────────────────────────────────
function SearchResultRow({
  car,
  query,
  isHighlighted,
  onHover,
  onClick,
}: {
  car: CarListing;
  query: string;
  isHighlighted: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`group relative flex w-full items-center gap-6 px-6 py-5 text-left transition-all duration-200 ${
        isHighlighted
          ? "bg-accent/[0.04]"
          : "hover:bg-accent/[0.02]"
      }`}
    >
      {/* Left accent bar on highlight */}
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-12 rounded-r-full transition-all duration-200 ${
        isHighlighted ? "bg-accent opacity-100" : "bg-transparent opacity-0"
      }`} />

      {/* Thumbnail — bigger, cinematic 3:2 */}
      <div className={`relative w-36 h-24 shrink-0 overflow-hidden bg-neutral-900 ring-1 ring-inset ${
        isHighlighted ? "ring-accent/40" : "ring-border/10 group-hover:ring-border/30"
      }`}>
        <img
          src={car.image}
          alt={car.name}
          className="h-full w-full scale-110 object-cover transition-transform duration-500 group-hover:scale-100"
        />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        {/* Category eyebrow */}
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent/80 mb-1.5">
          {car.category}
        </p>

        {/* Name */}
        <h3 className="truncate text-lg font-bold tracking-tight text-foreground">
          <HighlightedText text={car.name} query={query} />
        </h3>

        {/* Meta line 1: year · engine · HP */}
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70">
          <HighlightedText text={String(car.year)} query={query} /> ·{" "}
          <HighlightedText text={car.engine} query={query} /> · {car.hp} HP
        </p>

        {/* Meta line 2: location */}
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
          <HighlightedText text={car.location} query={query} />
        </p>
      </div>

      {/* Price + Chevron — stacked vertically */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="font-mono text-base font-bold tracking-tight text-foreground">
          {fmtPrice(car.price)}
        </p>
        <ChevronRight
          className={`size-4 transition-all duration-200 ${
            isHighlighted
              ? "text-accent -translate-x-0.5"
              : "text-muted-foreground/20 group-hover:text-accent/60 group-hover:-translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

// ─── InventoryPage ─────────────────────────────────────────────
function InventoryPage() {
  const saved = useMemo(() => readFilters(), []);
  const [category, setCategory] = useState<Category>((saved.category as Category) ?? "All");
  const [sort, setSort] = useState<SortKey>((saved.sort as SortKey) ?? "featured");
  const [query, setQuery] = useState((saved.query as string) ?? "");

  const minCatalogPrice = useMemo(() => Math.min(...catalog.map((c) => c.price)), []);
  const maxCatalogPrice = useMemo(() => Math.max(...catalog.map((c) => c.price)), []);
  const [priceMin, setPriceMin] = useState((saved.priceMin as number) ?? minCatalogPrice);
  const [priceMax, setPriceMax] = useState((saved.priceMax as number) ?? maxCatalogPrice);

  const minCatalogHp = useMemo(() => Math.min(...catalog.map((c) => c.hp)), []);
  const maxCatalogHp = useMemo(() => Math.max(...catalog.map((c) => c.hp)), []);
  const [hpMin, setHpMin] = useState((saved.hpMin as number) ?? minCatalogHp);
  const [hpMax, setHpMax] = useState((saved.hpMax as number) ?? maxCatalogHp);

  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);
  const [cartIds, setCartIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("marque_cart");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(readFavorites()));

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const resultListRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const hasModalOpenRef = useRef(false);
  const navRefs = useRef({ query: "", results: [] as CarListing[], highlightedIndex: -1 });

  // Debounced query for filtering (300ms)
  const debouncedQuery = useDebounce(query, 300);

  // Scroll highlighted result into view
  useEffect(() => {
    if (!searchOpen || highlightedIndex < 0) return;
    const el = document.querySelector(`[data-result-index="${highlightedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, searchOpen]);

  // Measure toolbar height and set CSS custom property for overlay positioning
  useEffect(() => {
    if (!toolbarRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        document.documentElement.style.setProperty("--toolbar-height", `${h}px`);
      }
    });
    observer.observe(toolbarRef.current);
    return () => observer.disconnect();
  }, []);

  // Search overlay keyboard navigation
  useEffect(() => {
    if (!searchOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isFilter = active && (active as HTMLElement).closest?.("[data-filter-input]");

      if (e.key === "Escape") {
        if (!hasModalOpenRef.current) {
          setSearchOpen(false);
        }
        return;
      }

      const { query: q, results: list, highlightedIndex: idx } = navRefs.current;
      if (q.trim() && list.length > 0 && !isFilter) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
        } else if (e.key === "Enter" && list.length > 0) {
          e.preventDefault();
          const targetIdx = idx >= 0 && idx < list.length ? idx : 0;
          setSelectedCar(list[targetIdx]);
        }
      }
    };

    setHighlightedIndex(-1);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [searchOpen]);

  // Autofocus overlay input
  useEffect(() => {
    if (searchOpen && overlayInputRef.current) {
      overlayInputRef.current.focus();
    }
  }, [searchOpen]);

  // Read URL params on mount (from hero search form)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const maxPriceParam = params.get("maxPrice");
    if (searchParam) setQuery(searchParam);
    if (maxPriceParam) {
      const num = parseInt(maxPriceParam, 10);
      if (!isNaN(num)) setPriceMax(num);
    }
    if (searchParam || maxPriceParam) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Persist filters to localStorage
  useEffect(() => {
    writeFilters({ category, sort, query, priceMin, priceMax, hpMin, hpMax });
  }, [category, sort, query, priceMin, priceMax, hpMin, hpMax]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("marque_cart", JSON.stringify([...cartIds]));
  }, [cartIds]);

  // Persist favorites
  useEffect(() => {
    writeFavorites([...favoriteIds]);
  }, [favoriteIds]);

  const toggleFavorite = useCallback((carId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(carId)) {
        next.delete(carId);
      } else {
        next.add(carId);
      }
      return next;
    });
  }, []);

  const addToCart = useCallback(
    (carId: string) => {
      if (cartIds.has(carId)) {
        toast.info("Already in your cart.");
        return;
      }
      setCartIds((prev) => new Set(prev).add(carId));
      toast.success("Inquiry submitted!");
      setSelectedCar(null);
    },
    [cartIds],
  );

  const hasActiveFilters = query.trim() !== "" || sort !== "featured" || priceMin !== minCatalogPrice || priceMax !== maxCatalogPrice || hpMin !== minCatalogHp || hpMax !== maxCatalogHp;

  const resetFilters = () => {
    localStorage.removeItem(FILTERS_KEY);
    setCategory("All");
    setSort("featured");
    setQuery("");
    setPriceMin(minCatalogPrice);
    setPriceMax(maxCatalogPrice);
    setHpMin(minCatalogHp);
    setHpMax(maxCatalogHp);
  };

  // Keep ref in sync with modal state for Escape key guard
  hasModalOpenRef.current = selectedCar !== null;

  // Filtered results using debounced query
  const results = useMemo(() => {
    let list = catalog.slice();
    if (category !== "All") list = list.filter((c) => c.category === category);
    list = list.filter((c) => c.price >= priceMin && c.price <= priceMax);
    list = list.filter((c) => c.hp >= hpMin && c.hp <= hpMax);
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.engine.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "year-desc": list.sort((a, b) => b.year - a.year); break;
      case "hp-desc": list.sort((a, b) => b.hp - a.hp); break;
    }
    return list;
  }, [category, sort, debouncedQuery, priceMin, priceMax, hpMin, hpMax]);

  // Keep navRefs in sync
  navRefs.current = { query: debouncedQuery, results, highlightedIndex };

  // Reset highlighted index when results change
  useEffect(() => {
    if (searchOpen) setHighlightedIndex(-1);
  }, [results, searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
  };

  const handleResultClick = (car: CarListing) => {
    setSelectedCar(car);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        {/* 
        O */}
        <section className="border-b border-border px-6 pt-28 pb-16 md:px-12 md:pt-40 md:pb-20">
          <div className="animate-reveal flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-4 text-accent">Inventory · Vol. 03</p>
              <h1 className="font-display text-5xl italic uppercase leading-[0.9] tracking-tighter md:text-7xl">
                The full catalog.
              </h1>
              <p className="mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
                {catalog.length} verified listings across {new Set(catalog.map((c) => c.location)).size} cities.
                Every vehicle is inspected, provenance-checked, and dealer-signed.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <div>
                <dt>Listings</dt>
                <dd className="mt-1 font-display text-2xl not-italic tracking-tight text-foreground">{catalog.length}</dd>
              </div>
              <div>
                <dt>Avg. HP</dt>
                <dd className="mt-1 font-display text-2xl not-italic tracking-tight text-foreground">
                  {Math.round(catalog.reduce((s, c) => s + c.hp, 0) / catalog.length)}
                </dd>
              </div>
              <div>
                <dt>From</dt>
                <dd className="mt-1 font-display text-2xl not-italic tracking-tight text-foreground">
                  {fmtPrice(Math.min(...catalog.map((c) => c.price)))}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* TOOLBAR */}
        <section ref={toolbarRef} className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-12">
            <div className={`flex-wrap gap-2 ${searchOpen ? 'hidden' : 'flex'}`}>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors duration-200 ${
                    category === c
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground ${searchOpen ? 'hidden' : ''}`}
                >
                  <X className="size-3" />
                  Reset
                </button>
              )}
              <div className={`relative w-full min-w-[220px] md:w-64 ${searchOpen ? 'hidden' : ''}`}>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={openSearch}
                  placeholder="Search make, engine, city…"
                  className="w-full border border-border bg-transparent py-2 pl-9 pr-3 font-mono text-[11px] uppercase tracking-widest outline-none placeholder:text-neutral-600 focus:border-accent cursor-pointer"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={`border border-border bg-transparent px-3 py-2 font-mono text-[10px] uppercase tracking-[0.25em] outline-none focus:border-accent ${searchOpen ? 'hidden' : ''}`}
                aria-label="Sort by"
              >
                {sorts.map((s) => (
                  <option key={s.key} value={s.key} className="bg-background text-foreground">
                    Sort · {s.label}
                  </option>
                ))}
              </select>
              {/* Cart icon — hidden when search overlay is open (shown in overlay instead) */}
              <Link
                to="/cart"
                className={`relative flex size-9 items-center justify-center border border-border transition-colors hover:border-accent hover:text-accent ${searchOpen ? 'hidden' : ''}`}
                aria-label="View cart"
              >
                <ShoppingCart className="size-4" />
                {cartIds.size > 0 && (
                  <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground">
                    {cartIds.size > 9 ? "9+" : cartIds.size}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </section>

        {/* GRID (hidden when search is open) */}
        {!searchOpen && (
          <section className="px-6 py-16 md:px-12 md:py-20">
            <div className="mb-8 flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                [ {String(results.length).padStart(2, "0")} results ]
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {category} · {sorts.find((s) => s.key === sort)?.label}
              </p>
            </div>

            {results.length === 0 ? (
              <div className="border border-border p-16 text-center">
                <p className="font-display text-2xl italic tracking-tight">No matches.</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Adjust filters or clear the search.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-3">
                {results.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isInCart={cartIds.has(car.id)}
                    onClick={() => setSelectedCar(car)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* SEARCH OVERLAY — full-screen immersive */}
        {searchOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <div className="flex min-h-screen flex-col items-center pt-[12vh] px-6 pb-12">
              <div className="w-full max-w-4xl">
                {/* Controls row */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="flex size-11 shrink-0 items-center justify-center border border-border/60 transition-all hover:border-accent hover:text-accent"
                    aria-label="Close search"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/30" />
                    <input
                      ref={overlayInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search make, engine, city…"
                      className="w-full border border-border/50 bg-transparent py-3.5 pl-12 pr-4 font-mono text-sm uppercase tracking-widest outline-none placeholder:text-neutral-700 transition-colors focus:border-accent"
                    />
                  </div>

                  {/* Price & HP filters */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center border border-border/50 focus-within:border-accent transition-colors">
                      <span className="border-r border-border/50 px-2.5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">$</span>
                      <input data-filter-input type="text" inputMode="numeric" placeholder="Min"
                        value={priceMin === minCatalogPrice ? "" : priceMin}
                        onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setPriceMin(raw === "" ? minCatalogPrice : Number(raw)); }}
                        className="w-14 border-0 bg-transparent px-2.5 py-3.5 font-mono text-[11px] outline-none placeholder:text-neutral-700" />
                      <span className="px-1 text-[11px] text-muted-foreground/30">—</span>
                      <input data-filter-input type="text" inputMode="numeric" placeholder="Max"
                        value={priceMax === maxCatalogPrice ? "" : priceMax}
                        onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setPriceMax(raw === "" ? maxCatalogPrice : Number(raw)); }}
                        className="w-14 border-0 bg-transparent px-2.5 py-3.5 font-mono text-[11px] outline-none placeholder:text-neutral-700" />
                    </div>
                    <div className="flex items-center border border-border/50 focus-within:border-accent transition-colors">
                      <span className="border-r border-border/50 px-2.5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">HP</span>
                      <input data-filter-input type="text" inputMode="numeric" placeholder="Min"
                        value={hpMin === minCatalogHp ? "" : hpMin}
                        onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setHpMin(raw === "" ? minCatalogHp : Number(raw)); }}
                        className="w-12 border-0 bg-transparent px-2.5 py-3.5 font-mono text-[11px] outline-none placeholder:text-neutral-700" />
                      <span className="px-1 text-[11px] text-muted-foreground/30">—</span>
                      <input data-filter-input type="text" inputMode="numeric" placeholder="Max"
                        value={hpMax === maxCatalogHp ? "" : hpMax}
                        onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setHpMax(raw === "" ? minCatalogHp : Number(raw)); }}
                        className="w-12 border-0 bg-transparent px-2.5 py-3.5 font-mono text-[11px] outline-none placeholder:text-neutral-700" />
                    </div>
                    {hasActiveFilters && (
                      <button type="button" onClick={resetFilters}
                        className="flex items-center gap-1.5 border border-border/50 px-3 py-3.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50 transition-all hover:border-accent hover:text-accent">
                        <X className="size-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Results */}
                <div className="mt-10">
                  {debouncedQuery.trim() && (
                    <div>
                      {results.length > 0 && (
                        <div className="mb-6 flex items-center gap-3">
                          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/50">
                            {results.length} result{results.length !== 1 ? "s" : ""}
                          </span>
                          <div className="h-px flex-1 bg-border/20" />
                        </div>
                      )}

                      {results.length === 0 ? (
                        <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 py-16">
                          No matches
                        </p>
                      ) : (
                        <div ref={resultListRef} className="divide-y divide-border/10">
                          {results.map((car, idx) => (
                            <div key={car.id} data-result-index={idx}>
                              <SearchResultRow
                                car={car}
                                query={debouncedQuery}
                                isHighlighted={idx === highlightedIndex}
                                onHover={() => setHighlightedIndex(idx)}
                                onClick={() => handleResultClick(car)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Car Detail Overlay */}
        {selectedCar && (
          <CarDetailOverlay
            car={selectedCar}
            isInCart={cartIds.has(selectedCar.id)}
            isFavorite={favoriteIds.has(selectedCar.id)}
            onAddToCart={() => addToCart(selectedCar.id)}
            onToggleFavorite={() => toggleFavorite(selectedCar.id)}
            onClose={() => setSelectedCar(null)}
          />
        )}

        {/* Footer (hidden when search is open) */}
        {!searchOpen && <Footer />}
      </main>
    </div>
  );
}

// ─── CarCard ────────────────────────────────────────────────────
function CarCard({
  car,
  isInCart,
  onClick,
}: {
  car: CarListing;
  isInCart: boolean;
  onClick: () => void;
}) {
  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-neutral-900">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          width={900}
          height={1125}
          className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-100"
        />
        {isInCart && (
          <div className="absolute left-4 top-14 z-10 flex items-center gap-2 border border-accent/50 bg-accent/20 px-3 py-1.5 backdrop-blur-sm">
            <ShoppingCart className="size-4 text-accent" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">In cart</span>
          </div>
        )}
        <span className="absolute left-4 top-4 bg-background/70 px-2 py-1 font-mono text-[11px] uppercase tracking-widest backdrop-blur z-10">
          {car.category}
        </span>
        <span
          className={`absolute right-4 top-4 px-3 py-1 font-mono text-[10px] tracking-widest backdrop-blur ${
            car.status === "SOLD"
              ? "bg-background/80 text-muted-foreground line-through"
              : car.status === "RESERVED"
                ? "bg-accent/90 text-accent-foreground"
                : "bg-background/80"
          }`}
        >
          {car.status}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-tight md:text-lg">
            {car.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase text-muted-foreground">
            <span>{car.year}</span>
            <span>{car.engine}</span>
            <span>{car.hp} HP</span>
          </div>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {car.location} · {car.mileage.toLocaleString()} km
          </p>
        </div>
        <div className="text-right text-base font-bold md:text-lg">
          {fmtPrice(car.price)}
        </div>
      </div>
    </article>
  );
}

// ─── CarDetailOverlay ──────────────────────────────────────────
function CarDetailOverlay({
  car,
  isInCart,
  isFavorite,
  onAddToCart,
  onToggleFavorite,
  onClose,
}: {
  car: CarListing;
  isInCart: boolean;
  isFavorite: boolean;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden bg-background md:flex-row md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — top-right of modal */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center border border-white/15 bg-background/80 backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* ─── LEFT COLUMN: Image ─── */}
        <div className="relative min-h-[260px] flex-1 bg-neutral-900 md:min-h-full md:basis-[55%]">
          <img
            src={car.image}
            alt={car.name}
            className="h-full w-full object-cover"
          />
          {/* Status badge — top-left */}
          <span
            className={`absolute left-4 top-4 z-10 px-3 py-1 font-mono text-[10px] tracking-widest backdrop-blur ${
              car.status === "SOLD"
                ? "bg-background/80 text-muted-foreground line-through"
                : car.status === "RESERVED"
                  ? "bg-accent/90 text-accent-foreground"
                  : "bg-background/70 text-foreground"
            }`}
          >
            {car.status}
          </span>
        </div>

        {/* ─── RIGHT COLUMN: Info ─── */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 md:basis-[45%] md:p-8 md:pl-10">
          {/* Eyebrow */}
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent">
            {car.category}
          </p>

          {/* Name */}
          <h2 className="mt-3 font-display text-3xl italic uppercase leading-[0.95] tracking-tighter md:text-4xl">
            {car.name}
          </h2>

          {/* Price */}
          <p className="mt-4 font-mono text-3xl font-bold tracking-tight text-accent md:text-4xl">
            {fmtPrice(car.price)}
          </p>

          {/* ─── Provenance blurb ─── */}
          <div className="my-6 border-y border-border/60 py-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {car.provenance}
            </p>
          </div>

          {/* ─── Spec grid ─── */}
          <div className="grid grid-cols-2 gap-px bg-border/60">
            {[
              { label: "Year", value: car.year },
              { label: "Engine", value: car.engine },
              { label: "Horsepower", value: `${car.hp} HP` },
              { label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
              { label: "Location", value: car.location },
              { label: "Status", value: car.status },
            ].map((row) => (
              <div key={row.label} className="bg-background p-3 md:p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {row.label}
                </p>
                <p className="mt-1.5 font-mono text-[12px] font-bold tracking-tight text-foreground">
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Dealer status line ─── */}
          <div className="mt-5 flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/40" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Verified dealer · responds{" "}
              <span className="text-foreground">{car.dealerResponseTime}</span>
            </span>
          </div>

          {/* ─── CTA row ─── */}
          <div className="mt-5 flex gap-3">
            {isInCart ? (
              <div className="flex flex-1 items-center justify-center gap-3 border border-accent/30 bg-accent/10 px-6 py-4">
                <CheckCircle className="size-5 text-accent" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
                  Inquired
                </span>
              </div>
            ) : car.status === "AVAILABLE" ? (
              <button
                type="button"
                onClick={onAddToCart}
                className="flex flex-1 items-center justify-center gap-3 bg-foreground px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
              >
                Request to View
              </button>
            ) : (
              <div className="flex flex-1 items-center justify-center border border-border/60 px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {car.status === "RESERVED" ? "Reserved — not available" : "Sold"}
              </div>
            )}

            {/* Save / Favorite button */}
            <button
              type="button"
              onClick={onToggleFavorite}
              className="flex size-14 shrink-0 items-center justify-center border border-border/60 transition-all hover:border-accent hover:text-accent active:scale-[0.95]"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`size-5 transition-all ${
                  isFavorite ? "fill-accent text-accent" : "text-muted-foreground"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
