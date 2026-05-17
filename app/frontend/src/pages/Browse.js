import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

const CATEGORIES = ["All", "Tops", "Bottoms", "Dresses", "Shoes", "Outerwear", "Accessories", "Activewear", "Formal"];
const SIZES = ["All", "XS", "S", "M", "L", "XL", "XXL", "6", "7", "8", "9", "9.5", "10", "10.5", "11"];
const CONDITIONS = ["All", "Like New", "Excellent", "Good", "Fair", "Poor"];
const SORTS = [{ value: "newest", label: "Newest First" }, { value: "value_asc", label: "Value: Low to High" }, { value: "value_desc", label: "Value: High to Low" }];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    size: "",
    condition: "",
    location: "",
    sort: "newest",
  });

  const fetchListings = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (filters.search) params.set("search", filters.search);
      if (filters.category && filters.category !== "All") params.set("category", filters.category);
      if (filters.size && filters.size !== "All") params.set("size", filters.size);
      if (filters.condition && filters.condition !== "All") params.set("condition", filters.condition);
      if (filters.location) params.set("location", filters.location);
      params.set("sort", filters.sort);
      const res = await api.get(`/api/listings?${params}`);
      setListings(res.data.listings || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => fetchListings(1), 300);
    return () => clearTimeout(t);
  }, [fetchListings]);

  const updateFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ search: "", category: "", size: "", condition: "", location: "", sort: "newest" });

  const activeFilterCount = [filters.category, filters.size, filters.condition, filters.location]
    .filter((v) => v && v !== "All").length;
  const nearbyCount = user?.location
    ? listings.filter((listing) => listing.location?.toLowerCase().includes(user.location.toLowerCase().split(",")[0])).length
    : 0;

  return (
    <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-[#171A18] mb-1">Browse Listings</h1>
          <p className="text-[#58605A]">{total > 0 ? `${total} items available to swap` : "Loading..."}</p>
        </div>

        {user?.location && (
          <div className="mb-6 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1">Location Match</div>
              <p className="text-sm text-[#171A18]">
                {nearbyCount > 0 ? `${nearbyCount} visible listings near ${user.location}` : `Filter by ${user.location} to find nearby swaps.`}
              </p>
            </div>
            <button onClick={() => updateFilter("location", user.location)}
              className="btn-outline text-sm px-4 py-2">
              Show Nearby
            </button>
          </div>
        )}

        {/* Search + controls row */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" color="#A4ACA6" />
            <input
              data-testid="browse-search"
              type="text"
              placeholder="Search brands, styles..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            data-testid="browse-filter-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ border: "1.5px solid #DCD9CE", background: filtersOpen ? "#24402E" : "#fff", color: filtersOpen ? "#fff" : "#171A18" }}>
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "#C2FF41", color: "#171A18" }}>{activeFilterCount}</span>
            )}
          </button>
          <select data-testid="browse-sort" value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)}
            className="input-field w-auto px-4 py-2.5 text-sm cursor-pointer" style={{ width: "auto" }}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Category</label>
              <select data-testid="filter-category" value={filters.category} onChange={(e) => updateFilter("category", e.target.value)}
                className="input-field text-sm py-2">
                {CATEGORIES.map((c) => <option key={c} value={c === "All" ? "" : c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Size</label>
              <select data-testid="filter-size" value={filters.size} onChange={(e) => updateFilter("size", e.target.value)}
                className="input-field text-sm py-2">
                {SIZES.map((s) => <option key={s} value={s === "All" ? "" : s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Condition</label>
              <select data-testid="filter-condition" value={filters.condition} onChange={(e) => updateFilter("condition", e.target.value)}
                className="input-field text-sm py-2">
                {CONDITIONS.map((c) => <option key={c} value={c === "All" ? "" : c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Location</label>
              <input type="text" placeholder="City, State" value={filters.location}
                onChange={(e) => updateFilter("location", e.target.value)}
                className="input-field text-sm py-2" data-testid="filter-location" />
            </div>
            {activeFilterCount > 0 && (
              <div className="col-span-2 sm:col-span-4 flex justify-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-[#58605A] hover:text-[#171A18]">
                  <X size={13} /> Clear filters
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Category quick filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
          {CATEGORIES.slice(0, 8).map((cat) => (
            <button key={cat} data-testid={`cat-btn-${cat.toLowerCase()}`}
              onClick={() => updateFilter("category", cat === "All" ? "" : cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: (cat === "All" && !filters.category) || filters.category === cat ? "#24402E" : "#EBE8DF",
                color: (cat === "All" && !filters.category) || filters.category === cat ? "#fff" : "#58605A"
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
                <div className="skeleton" style={{ height: 220 }} />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EBE8DF" }}>
              <Search size={28} color="#A4ACA6" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-[#171A18] mb-2">No listings found</h3>
            <p className="text-[#58605A]">Try adjusting your filters or search terms</p>
            <button onClick={clearFilters} className="btn-outline mt-5 text-sm px-5 py-2.5">Clear all filters</button>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((l) => <ListingCard key={l.id} listing={l} variants={item} />)}
          </motion.div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => fetchListings(page - 1)} disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: "#EBE8DF", color: "#171A18" }}>Previous</button>
            <span className="text-sm text-[#58605A]">Page {page} of {pages}</span>
            <button onClick={() => fetchListings(page + 1)} disabled={page === pages}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: "#EBE8DF", color: "#171A18" }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
