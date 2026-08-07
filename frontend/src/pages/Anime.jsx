import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import MediaGrid from "../components/MediaGrid";

function Anime() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ genre: "", year: "", season: "" });

  return (
    <>
      <h1 className="text-white text-2xl font-bold px-4 pt-4">อนิเมะ</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <FilterBar mediaType="anime" filters={filters} onChange={setFilters} />
      <MediaGrid mediaType="anime" searchQuery={searchQuery} filters={filters} />
    </>
  );
}

export default Anime;
