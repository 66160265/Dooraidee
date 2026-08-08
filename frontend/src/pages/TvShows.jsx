import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";

function TvShows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", season: "" });

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-4 pt-8">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#54d1ff] to-[#0090c7]" />
          <h1 className="text-3xl font-bold">ซีรีส์</h1>
        </div>
      </div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar mediaType="tv" filters={filters} onChange={setFilters} />
      <MediaGrid mediaType="tv" searchQuery={searchQuery} filters={filters} />
    </>
  );
}

export default TvShows;
