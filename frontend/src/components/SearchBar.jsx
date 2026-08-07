function SearchBar({ value, onChange }) {
    return (
        <div className="max-w-[1200px] mx-auto px-4 mt-2">
            <input
                type="text"
                id="search-input"
                placeholder="พิมพ์ชื่อเรื่องได้ที่นี่..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 pl-3 text-lg focus:outline-none focus:border-[#36b9e9]"
            />
        </div>
    )
}

export default SearchBar;
