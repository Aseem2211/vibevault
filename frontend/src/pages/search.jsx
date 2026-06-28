import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { searchItems } from "../services/api";
import { useAuth } from "../context/AuthContext";

const LIMIT = 12;

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const query = params.get("tosearch") || "";
  const [results, setResults] = useState([]);
  const [sections, setSections] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [section, setSection] = useState(params.get("section") || "all");
  const [age, setAge] = useState(params.get("age") || "all");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [showFilters, setShowFilters] = useState(false);

  const abortRef = useRef(null);

  const dm = {
    page: darkMode ? "bg-[#0f1220] text-[#e8ecff]" : "bg-[#E6E6FA] text-[#1A2556]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    card: darkMode ? "bg-[#161b35] border-[#2a3060] hover:border-[#5b6af0]" : "bg-white border-[#E0E4FF] hover:border-[#1A2556]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#5b6af0]"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556] placeholder-[#9aa3c9] focus:border-[#1A2556]",
    filterPanel: darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-white border-[#E0E4FF]",
    badge: darkMode ? "bg-[#1e2444] text-[#8892be]" : "bg-[#F0EFFF] text-[#4F5B81]",
    activeBadge: darkMode ? "bg-[#5b6af0] text-white" : "bg-[#1A2556] text-white",
    btn: darkMode ? "bg-[#5b6af0] text-white hover:bg-[#6e7df5]" : "bg-[#1A2556] text-white hover:bg-[#FF6B6B]",
    pill: darkMode ? "bg-[#1e2444] border-[#2a3060] text-[#8892be] hover:border-[#5b6af0]" : "bg-[#F8F6FF] border-[#E0E4FF] text-[#4F5B81] hover:border-[#1A2556]",
    activePill: darkMode ? "bg-[#5b6af0] border-[#5b6af0] text-white" : "bg-[#1A2556] border-[#1A2556] text-white",
    pageBtn: darkMode ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] hover:bg-[#5b6af0]" : "bg-white border-[#E0E4FF] text-[#1A2556] hover:bg-[#1A2556] hover:text-white",
    activePageBtn: darkMode ? "bg-[#5b6af0] border-[#5b6af0] text-white" : "bg-[#1A2556] border-[#1A2556] text-white",
  };

  const fetchResults = useCallback(async (overrides = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    try {
      const p = {
        q: overrides.query ?? query,
        section: overrides.section ?? section,
        age: overrides.age ?? age,
        minPrice: overrides.minPrice ?? minPrice,
        maxPrice: overrides.maxPrice ?? maxPrice,
        sort: overrides.sort ?? sort,
        page: overrides.page ?? page,
        limit: LIMIT,
      };
      const res = await searchItems(p);
      setResults(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
      if (res.data.sections?.length) setSections(["all", ...res.data.sections]);
    } catch (err) {
      if (err.name !== "CanceledError") setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [query, section, age, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const applyFilters = () => {
    setPage(1);
    setParams({ tosearch: query, section, age, minPrice, maxPrice, sort, page: 1 });
    fetchResults({ page: 1 });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSection("all");
    setAge("all");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    setParams({ tosearch: query });
    fetchResults({ section: "all", age: "all", minPrice: "", maxPrice: "", sort: "newest", page: 1 });
  };

  const handleSort = (val) => {
    setSort(val);
    setPage(1);
    fetchResults({ sort: val, page: 1 });
  };

  const handlePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchResults({ page: p });
  };

  const hasActiveFilters = section !== "all" || age !== "all" || minPrice || maxPrice;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-6">
          <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${dm.sub}`}>Search Results</p>
          <h1 className={`text-3xl font-extrabold ${dm.heading}`}>
            {query ? `"${query}"` : "All Items"}
          </h1>
          {!loading && (
            <p className={`mt-1 text-sm ${dm.sub}`}>
              {total} {total === 1 ? "result" : "results"} found
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${hasActiveFilters ? dm.activePill : dm.pill}`}
          >
            <i className="ti ti-adjustments-horizontal" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 rounded-full bg-[#FF6B6B] inline-block" />
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className={`px-4 py-2 rounded-xl border text-sm font-semibold outline-none transition-all ${dm.input}`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priceasc">Price: Low to High</option>
            <option value="pricedesc">Price: High to Low</option>
          </select>

          {sections.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {sections.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSection(s);
                    setPage(1);
                    if(!["furniture","appliance","books"].includes(s.toLowerCase())){
                      setAge("all");
                      fetchResults({section:s,age:"all",page:1});
                    }else{
                      fetchResults({section:s,page:1});
                    }
                    
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all capitalize ${section === s ? dm.activePill : dm.pill}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {["furniture","appliance","books"].includes(section.toLowerCase())&&(
            <div className="flex gap-2 flex-wrap">
              {["all", "New", "Old"].map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAge(a);
                    setPage(1);
                    fetchResults({ age: a, page: 1 });
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${age === a ? dm.activePill : dm.pill}`}
                >
                  {a === "all" ? "Any condition" : a}
                </button>
              ))}
            </div>
          )}
         

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`text-sm font-semibold hover:text-[#FF6B6B] transition ml-auto ${dm.sub}`}
            >
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className={`mb-6 rounded-2xl border p-6 ${dm.filterPanel}`}>
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${dm.sub}`}>Price Range</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-[120px]">
                <label className={`text-xs font-medium block mb-1 ${dm.sub}`}>Min Price (₹)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-2 rounded-xl border text-sm outline-none transition-all ${dm.input}`}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className={`text-xs font-medium block mb-1 ${dm.sub}`}>Max Price (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className={`w-full px-4 py-2 rounded-xl border text-sm outline-none transition-all ${dm.input}`}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={applyFilters}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${dm.btn}`}
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className={`px-6 py-2 rounded-xl text-sm font-semibold border transition-all ${dm.pill}`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`rounded-2xl border p-4 animate-pulse h-64 ${dm.filterPanel}`} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 font-semibold">{error}</p>
            <button onClick={() => fetchResults()} className={`mt-4 px-6 py-2 rounded-xl text-sm font-semibold ${dm.btn}`}>
              Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className={`text-2xl font-extrabold mb-2 ${dm.heading}`}>No results found</h2>
            <p className={`mb-6 ${dm.sub}`}>
              Try a different keyword or clear your filters.
            </p>
            <button onClick={clearFilters} className={`px-6 py-3 rounded-xl font-semibold text-sm ${dm.btn}`}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/detailpage/${item._id}`)}
                className={`rounded-2xl border cursor-pointer transition-all duration-200 overflow-hidden group ${dm.card}`}
              >
                <div className="relative overflow-hidden h-44 bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${dm.badge}`}>
                      <i className="ti ti-photo text-3xl opacity-30" />
                    </div>
                  )}
                  {item.section && (
                    <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full capitalize ${dm.badge}`}>
                      {item.section}
                    </span>
                  )}
                  {item.age && (
                    <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${item.age === "New" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {item.age}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-sm line-clamp-2 mb-1 ${dm.heading}`}>{item.name}</h3>
                  {item.description && (
                    <p className={`text-xs line-clamp-2 mb-2 ${dm.sub}`}>{item.description}</p>
                  )}
                  <p className={`text-lg font-extrabold ${dm.heading}`}>₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => handlePage(page - 1)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all disabled:opacity-30 ${dm.pageBtn}`}
            >
              <i className="ti ti-chevron-left" />
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className={`px-2 text-sm ${dm.sub}`}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePage(p)}
                    className={`w-10 h-10 rounded-xl border text-sm font-semibold transition-all ${page === p ? dm.activePageBtn : dm.pageBtn}`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              disabled={page === pages}
              onClick={() => handlePage(page + 1)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all disabled:opacity-30 ${dm.pageBtn}`}
            >
              <i className="ti ti-chevron-right" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
