function SearchBar({ value, onChange }) {
    return (
        <div className="search-container">
        <div className="search-box">
            <input
                type="text"
                id="search-input"
                placeholder="พิมพ์ชื่อเรื่องได้ที่นี่..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
    )
}

export default SearchBar;