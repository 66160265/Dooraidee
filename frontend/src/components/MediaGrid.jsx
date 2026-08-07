import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";
import MediaCardSkeleton from "./MediaCardSkeleton";

const ENDPOINT_MAP = {
  movie: "movies",
  tv: "tv-shows",
  anime: "anime",
};

function buildQuery(page, filters) {
  const params = new URLSearchParams({ page });
  if (filters.genre) params.set("genre", filters.genre);
  if (filters.year) params.set("year", filters.year);
  if (filters.season) params.set("season", filters.season);
  return params.toString();
}

function MediaGrid({ mediaType, searchQuery, filters = {} }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const filterKey = `${filters.genre || ""}|${filters.year || ""}|${filters.season || ""}`;

  useEffect(() => {
    setItems([]);
    setPage(1);
    setLoading(true);

    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}?${buildQuery(1, filters)}`);
        const data = await res.json();
        setItems(data.results);
        setHasNextPage(data.hasNextPage);
      } catch (err) {
        console.error("Failed to fetch media list:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mediaType, filterKey]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}?${buildQuery(nextPage, filters)}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...data.results]);
      setHasNextPage(data.hasNextPage);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to fetch more media:", err);
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const cleanTitle = item.title.replace(/\s+/g, "").toLowerCase();
    const cleanQuery = searchQuery.replace(/\s+/g, "").toLowerCase();
    return cleanTitle.includes(cleanQuery);
  });

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return <p className="text-gray-500 px-4">ไม่พบรายการที่ตรงกับเงื่อนไข</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 max-w-[1400px] mx-auto">
        {filteredItems.map((item) => (
          <MediaCard key={item.uniqueId} {...item} />
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center pb-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-lg bg-[#36b9e9] text-white hover:opacity-90 disabled:opacity-50"
          >
            {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
          </button>
        </div>
      )}
    </>
  );
}

export default MediaGrid;
