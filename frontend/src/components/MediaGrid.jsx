import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";
import MediaCardSkeleton from "./MediaCardSkeleton";

const ENDPOINT_MAP = {
  movie: "movies",
  tv: "tv-shows",
  anime: "anime",
};

function MediaGrid({ mediaType, searchQuery }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setLoading(true);

    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}?page=1`);
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
  }, [mediaType]);

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}?page=${nextPage}`);
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

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {filteredItems.map((item) => (
          <MediaCard key={item.uniqueId} {...item} />
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center pb-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {loadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
          </button>
        </div>
      )}
    </>
  );
}

export default MediaGrid;
