import { useState } from 'react';
import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";

function TvShows() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <h1>TvShows Page</h1>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <MediaGrid mediaType="tv" searchQuery={searchQuery} />
    </>
  );
}

export default TvShows;
