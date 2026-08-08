import { genreLabel } from "../utils/genreLabels";

const MOVIE_TV_GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Science Fiction", "Thriller", "War", "Western",
];

const ANIME_GENRES = [
    "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror",
    "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance",
    "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const SEASONS = [
    { value: "winter", label: "ฤดูหนาว" },
    { value: "spring", label: "ฤดูใบไม้ผลิ" },
    { value: "summer", label: "ฤดูร้อน" },
    { value: "fall", label: "ฤดูใบไม้ร่วง" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR + 1 - i);

const SELECT_CLASS = "bg-white text-black border border-gray-200 shadow-sm rounded-full px-4 py-2 cursor-pointer transition-all hover:border-[#36b9e9] focus:outline-none focus:border-[#36b9e9] focus:shadow-[0_0_0_4px_rgba(54,185,233,0.15)]";

function FilterBar({ mediaType, filters, onChange }) {
    const genreOptions = mediaType === "anime" ? ANIME_GENRES : MOVIE_TV_GENRES;

    function handleChange(key, value) {
        onChange({ ...filters, [key]: value });
    }

    return (
        <div className="flex flex-wrap gap-3 max-w-[1200px] mx-auto px-4 pt-3 pb-4">
            <select
                value={filters.genre}
                onChange={(e) => handleChange("genre", e.target.value)}
                className={SELECT_CLASS}
            >
                <option value="">ทุกแนว</option>
                {genreOptions.map((g) => (
                    <option key={g} value={g}>{genreLabel(g)}</option>
                ))}
            </select>

            {mediaType === "anime" && (
                <select
                    value={filters.season}
                    onChange={(e) => handleChange("season", e.target.value)}
                    className={SELECT_CLASS}
                >
                    <option value="">ทุกฤดูกาล</option>
                    {SEASONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            )}

            <select
                value={filters.year}
                onChange={(e) => handleChange("year", e.target.value)}
                className={SELECT_CLASS}
            >
                <option value="">ทุกปี</option>
                {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>
        </div>
    );
}

export default FilterBar;
