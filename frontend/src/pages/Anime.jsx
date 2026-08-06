import SearchBar from "../components/SearchBar";
import MediaGrid from "../components/MediaGrid";

function Anime() {
  return (
    <>
      <h1>Anime Page</h1>
      <SearchBar />
      <MediaGrid mediaType="anime" />
    </>
  );
}

export default Anime;
