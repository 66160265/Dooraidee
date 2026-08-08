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

function ChevronDownIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#0090c7]">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function Select({ value, onChange, children }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="appearance-none bg-white text-black border border-gray-200 shadow-sm rounded-full pl-4 pr-10 py-2 cursor-pointer transition-all hover:border-[#36b9e9] hover:shadow-[0_2px_10px_rgba(54,185,233,0.15)] focus:outline-none focus:border-[#36b9e9] focus:shadow-[0_0_0_4px_rgba(54,185,233,0.15)]"
            >
                {children}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                <ChevronDownIcon />
            </span>
        </div>
    );
}

function FilterBar({ mediaType, filters, onChange }) {
    const genreOptions = mediaType === "anime" ? ANIME_GENRES : MOVIE_TV_GENRES;

    function handleChange(key, value) {
        onChange({ ...filters, [key]: value });
    }

    return (
        <div className="flex flex-wrap gap-3 max-w-[1200px] mx-auto px-4 pt-3 pb-4">
            <Select value={filters.genre} onChange={(e) => handleChange("genre", e.target.value)}>
                <option value="">ทุกแนว</option>
                {genreOptions.map((g) => (
                    <option key={g} value={g}>{genreLabel(g)}</option>
                ))}
            </Select>

            {mediaType === "anime" && (
                <Select value={filters.season} onChange={(e) => handleChange("season", e.target.value)}>
                    <option value="">ทุกฤดูกาล</option>
                    {SEASONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </Select>
            )}

            <Select value={filters.year} onChange={(e) => handleChange("year", e.target.value)}>
                <option value="">ทุกปี</option>
                {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </Select>
        </div>
    );
}

export default FilterBar;
