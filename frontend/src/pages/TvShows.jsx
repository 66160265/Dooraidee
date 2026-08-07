import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";

function TvShows() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", season: "" });

  return (
    <>
      <h1 className="text-white text-2xl font-bold px-4 pt-4">ซีรีส์</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar mediaType="tv" filters={filters} onChange={setFilters} />
      <MediaGrid mediaType="tv" searchQuery={searchQuery} filters={filters} />
    </>
  );
}

export default TvShows;
