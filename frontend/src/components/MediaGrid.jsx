import { useState, useEffect, useRef } from "react";
import MediaCard from "./MediaCard";
import MediaCardSkeleton from "./MediaCardSkeleton";
import Pagination from "./Pagination";

const ENDPOINT_MAP = {
  movie: "movies",
  tv: "tv-shows",
  anime: "anime",
};

function buildQuery(page, filters, search) {
  const params = new URLSearchParams({ page });
  if (search) params.set("search", search);
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.year) params.set("year", filters.year);
  if (filters.season) params.set("season", filters.season);
  return params.toString();
}

function MediaGrid({ mediaType, searchQuery, filters = {} }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const filterKey = `${filters.genre || ""}|${filters.year || ""}|${filters.season || ""}|${debouncedSearch}`;
  const identityKey = `${mediaType}|${filterKey}`;
  const prevIdentityKeyRef = useRef(identityKey);

  useEffect(() => {
    // Filters/search/category changed — reset to page 1 first. Fetching here
    // with the old `page` value would send a stale, possibly out-of-range
    // page against the new query (AniList rejects pages past its own total),
    // so skip straight to the reset and let the resulting re-render (with
    // page back at 1) trigger the fetch below instead.
    if (prevIdentityKeyRef.current !== identityKey) {
      prevIdentityKeyRef.current = identityKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    setLoading(true);
    setError(false);

    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}?${buildQuery(page, filters, debouncedSearch)}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setItems(data.results);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch media list:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [identityKey, page]);

  function handlePageChange(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-[1400px] mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-3">⚠️</p>
        <p className="text-gray-500 text-lg">เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้งในภายหลัง</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-3">🔍</p>
        <p className="text-gray-500 text-lg">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-[1400px] mx-auto">
        {items.map((item, i) => (
          <div key={item.uniqueId} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
            <MediaCard {...item} />
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </>
  );
}

export default MediaGrid;
