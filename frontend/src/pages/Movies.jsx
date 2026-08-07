import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";

function Movies() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <h1>Movies Page</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <MediaGrid mediaType="movie" searchQuery={searchQuery} />
    </>
  );
}

export default Movies;
