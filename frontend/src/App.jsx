import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import TvShows from "./pages/TvShows";
import Anime from "./pages/Anime";
import Navbar from "./components/Navbar";
import DetailPage from "./pages/DetailPage";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv-shows" element={<TvShows />} />
        <Route path="/anime" element={<Anime />} />
        <Route path="/movies/detail/:id/:slug" element={<DetailPage mediaType="movie" />} />
        <Route path="/tv-shows/detail/:id/:slug" element={<DetailPage mediaType="tv" />} />
        <Route path="/anime/detail/:id/:slug" element={<DetailPage mediaType="anime" />} />
      </Routes>
    </>
  );
}

export default App;
