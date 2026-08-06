import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";

function TvShows() {
  return (
    <>
      <h1>TvShows Page</h1>
      <SearchBar />
      <MediaGrid mediaType="tv" />
    </>
  );
}

export default TvShows;
