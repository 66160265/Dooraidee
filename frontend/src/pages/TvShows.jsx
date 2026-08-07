import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";

function TvShows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", season: "" });

  return (
    <>
      <h1 className="max-w-[1200px] mx-auto px-4 pt-8 text-3xl font-bold">ซีรีส์</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar mediaType="tv" filters={filters} onChange={setFilters} />
      <MediaGrid mediaType="tv" searchQuery={searchQuery} filters={filters} />
    </>
  );
}

export default TvShows;
