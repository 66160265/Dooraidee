import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Movies from "./pages/Movies";
import TvShows from "./pages/TvShows";
import Anime from "./pages/Anime";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/movies" />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv-shows" element={<TvShows />} />
        <Route path="/anime" element={<Anime />} />
      </Routes>
    </>
  );
}

export default App;
