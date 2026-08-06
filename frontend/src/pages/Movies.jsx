import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";

function Movies() {
  return (
    <>
      <h1>Movies Page</h1>
      <SearchBar />
      <MediaGrid mediaType="movie" />
    </>
  );
}

export default Movies;
