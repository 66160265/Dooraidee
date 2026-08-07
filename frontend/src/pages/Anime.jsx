import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";

function Anime() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <h1>Anime Page</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <MediaGrid mediaType="anime" searchQuery={searchQuery} />
    </>
  );
}

export default Anime;
