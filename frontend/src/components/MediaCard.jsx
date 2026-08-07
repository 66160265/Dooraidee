import { Link } from 'react-router-dom';
import slugify from '../utils/slugify';

const MEDIA_TYPE_LABELS_TH = {
    movie: "หนัง",
    tv: "ซีรีส์",
    anime: "อนิเมะ",
};

function MediaCard({ title, posterUrl, score, mediaType, originalId }) {
    const routeMap = {
        movie: "movies",
        tv: "tv-shows",
        anime: "anime",
    };

    return (
        <Link to={`/${routeMap[mediaType]}/detail/${originalId}/${slugify(title)}`}>
            <div className="rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.4)] bg-white hover:scale-105 transition-transform">
                <img src={posterUrl} alt={title} className="w-full h-72 object-cover" />
                <div className="p-3">
                    <h3 className="text-black font-semibold truncate">{title}</h3>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-yellow-500 text-sm">⭐ {score.toFixed(1)}</span>
                        <span className="text-black text-xs bg-[#00aaff] px-2 py-0.5 rounded">
                            {MEDIA_TYPE_LABELS_TH[mediaType]}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default MediaCard;
