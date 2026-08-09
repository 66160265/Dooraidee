import { useEffect, useRef, useState } from "react";
import { genreLabel } from "../utils/genreLabels";

// TMDB's movie and TV genre taxonomies genuinely differ (e.g. TV has no
// standalone "Action", only "Action & Adventure") — offering a genre that
// doesn't exist for that media type just returns an empty page, so each
// list here matches TMDB's real /genre/{movie|tv}/list response.
const MOVIE_GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western",
];

const TV_GENRES = [
    "Action & Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Kids", "Mystery", "News", "Reality",
    "Sci-Fi & Fantasy", "Soap", "Talk", "War & Politics", "Western",
];

// Matches AniList's own GenreCollection (minus Hentai, which is excluded
// site-wide as adult content).
const ANIME_GENRES = [
    "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror",
    "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance",
    "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const GENRES_BY_TYPE = {
    movie: MOVIE_GENRES,
    tv: TV_GENRES,
    anime: ANIME_GENRES,
};

const SEASONS = [
    { value: "winter", label: "ฤดูหนาว" },
    { value: "spring", label: "ฤดูใบไม้ผลิ" },
    { value: "summer", label: "ฤดูร้อน" },
    { value: "fall", label: "ฤดูใบไม้ร่วง" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

function ChevronDownIcon({ open }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 text-[#0090c7] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

// A custom listbox instead of a native <select> — native <option> elements
// can't be restyled to match the rounded pill look of the trigger (that's a
// browser/OS-level menu, not CSS-stylable), so the whole dropdown is
// hand-built here to keep a consistent rounded, themed look end to end.
function CustomSelect({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

    return (
        <div className="relative min-w-[140px]" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-2 bg-white text-black border border-gray-200 shadow-sm rounded-full pl-4 pr-3.5 py-2 cursor-pointer transition-all hover:border-[#36b9e9] hover:shadow-[0_2px_10px_rgba(54,185,233,0.15)] focus:outline-none focus:border-[#36b9e9] focus:shadow-[0_0_0_4px_rgba(54,185,233,0.15)]"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDownIcon open={open} />
            </button>

            {open && (
                <div className="absolute z-30 left-0 right-0 mt-2 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 p-1.5">
                    {options.map((opt) => (
                        <button
                            key={opt.value || "__all__"}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                                opt.value === value
                                    ? "bg-gradient-to-br from-[#54d1ff] to-[#0090c7] text-white font-medium"
                                    : "text-black hover:bg-[#E6F8FE]"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function FilterBar({ mediaType, filters, onChange }) {
    const genreOptions = [
        { value: "", label: "ทุกแนว" },
        ...GENRES_BY_TYPE[mediaType].map((g) => ({ value: g, label: genreLabel(g) })),
    ];
    const seasonOptions = [{ value: "", label: "ทุกฤดูกาล" }, ...SEASONS];
    const yearOptions = [
        { value: "", label: "ทุกปี" },
        ...YEARS.map((y) => ({ value: String(y), label: String(y) })),
    ];

    function handleChange(key, value) {
        onChange({ ...filters, [key]: value });
    }

    return (
        <div className="flex flex-wrap gap-3 max-w-[1200px] mx-auto px-4 pt-3 pb-4">
            <CustomSelect
                value={filters.genre}
                onChange={(v) => handleChange("genre", v)}
                options={genreOptions}
                placeholder="ทุกแนว"
            />

            {mediaType === "anime" && (
                <CustomSelect
                    value={filters.season}
                    onChange={(v) => handleChange("season", v)}
                    options={seasonOptions}
                    placeholder="ทุกฤดูกาล"
                />
            )}

            <CustomSelect
                value={filters.year}
                onChange={(v) => handleChange("year", v)}
                options={yearOptions}
                placeholder="ทุกปี"
            />
        </div>
    );
}

export default FilterBar;
