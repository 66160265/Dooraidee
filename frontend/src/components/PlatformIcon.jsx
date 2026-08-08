// AniList's platform icons are plain white silhouettes meant to sit on
// their brand color (given separately as `color`), so we render that
// background ourselves. TMDB logos are already full-color images and
// have no `color` field, so they render as-is.
function PlatformIcon({ name, logoUrl, color, className = "w-6 h-6" }) {
    if (color) {
        return (
            <span
                className={`${className} rounded-full flex items-center justify-center shrink-0`}
                style={{ backgroundColor: color }}
                title={name}
            >
                <img src={logoUrl} alt={name} className="w-2/3 h-2/3 object-contain" />
            </span>
        );
    }

    return (
        <img
            src={logoUrl}
            alt={name}
            title={name}
            className={`${className} rounded object-contain bg-white shrink-0`}
        />
    );
}

export default PlatformIcon;
