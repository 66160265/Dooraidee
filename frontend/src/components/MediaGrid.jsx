import { useState, useEffect } from "react";
import MediaCard from "./MediaCard";
import MediaCardSkeleton from "./MediaCardSkeleton";

function MediaGrid({ mediaType }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:4000/api/trending");
        const data = await res.json();
        const filtered = data.results.filter(
          (item) => item.mediaType === mediaType,
        );
        setItems(filtered);
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mediaType]);

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {items.map((item) => (
        <MediaCard key={item.uniqueId} {...item} />
      ))}
    </div>
  );
}

export default MediaGrid;
