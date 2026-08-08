function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-400">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}

function SearchBar({ value, onChange }) {
    return (
        <div className="max-w-[1200px] mx-auto px-4 mt-2">
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    id="search-input"
                    placeholder="พิมพ์ชื่อเรื่องได้ที่นี่..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-12 rounded-full border border-gray-200 bg-white pl-11 pr-4 text-lg shadow-sm transition-all focus:outline-none focus:border-[#36b9e9] focus:shadow-[0_0_0_4px_rgba(54,185,233,0.15)]"
                />
            </div>
        </div>
    )
}

export default SearchBar;
