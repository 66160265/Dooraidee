import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";

function Movies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", season: "" });

  return (
    <>
      <h1 className="max-w-[1200px] mx-auto px-4 pt-8 text-3xl font-bold">หนัง</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar mediaType="movie" filters={filters} onChange={setFilters} />
      <MediaGrid mediaType="movie" searchQuery={searchQuery} filters={filters} />
    </>
  );
}

export default Movies;
