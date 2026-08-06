function MediaCard({ title, posterUrl, score, mediaType }) {
    return (
        <div className="rounded-lg overflow-hidden shadow-md bg-gray-800 hover:scale-105 transition-transform">
            <img src={posterUrl} alt={title} className="w-full h-72 object-cover" />
            <div className="p-3">
                <h3 className="text-white font-semibold truncate">{title}</h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-yellow-400 text-sm">⭐ {score.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs uppercase">{mediaType}</span>
                </div>
            </div>
        </div>
    )
}

export default MediaCard;