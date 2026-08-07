import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";

function Movies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", season: "" });

  return (
    <>
      <h1 className="text-white text-2xl font-bold px-4 pt-4">หนัง</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar mediaType="movie" filters={filters} onChange={setFilters} />
      <MediaGrid mediaType="movie" searchQuery={searchQuery} filters={filters} />
    </>
  );
}

export default Movies;
