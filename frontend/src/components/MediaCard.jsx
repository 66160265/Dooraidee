import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import slugify from '../utils/slugify';
import { genreLabel } from '../utils/genreLabels';
import PlatformIcon from './PlatformIcon';

const ROUTE_MAP = {
    movie: "movies",
    tv: "tv-shows",
    anime: "anime",
};

function formatAiringDay(airingAt) {
    return new Date(airingAt * 1000).toLocaleDateString("th-TH", {
        weekday: "short",
        timeZone: "Asia/Bangkok",
    });
}

function formatAiringTime(airingAt) {
    return new Date(airingAt * 1000).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
    });
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    );
}

function MediaCard({ title, posterUrl, score, mediaType, originalId, genres = [], episode, airingAt, dateLabel, platforms: embeddedPlatforms = [] }) {
    const [fetchedPlatforms, setFetchedPlatforms] = useState([]);

    useEffect(() => {
        // Anime already carries its platforms from the AniList list/calendar
        // response (embedded field) — only movie/tv need a per-card fetch
        // against TMDB's separate watch-providers endpoint.
        if (mediaType !== "movie" && mediaType !== "tv") return;

        async function fetchProviders() {
            try {
                const res = await fetch(`http://localhost:4000/api/watch-providers/${mediaType}/${originalId}?title=${encodeURIComponent(title)}`);
                const data = await res.json();
                setFetchedPlatforms(data.platforms || []);
            } catch (err) {
                console.error("Failed to fetch watch providers:", err);
            }
        }
        fetchProviders();
    }, [mediaType, originalId, title]);

    const platforms = mediaType === "anime" ? embeddedPlatforms : fetchedPlatforms;
    const visiblePlatforms = platforms.slice(0, 3);
    const extraPlatformCount = platforms.length - visiblePlatforms.length;

    return (
        <Link to={`/${ROUTE_MAP[mediaType]}/detail/${originalId}/${slugify(title)}`} className="group block">
            <div className="flex h-[220px] rounded-2xl overflow-hidden shadow-md bg-[#b1e5ff] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(54,185,233,0.35)] group-hover:-translate-y-1">
                <div className="relative w-[150px] h-full shrink-0 overflow-hidden">
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {!airingAt && !dateLabel && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                            ⭐ {score.toFixed(1)}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0 p-3 flex flex-col">
                    <h3 className="font-semibold truncate group-hover:text-[#0090c7] transition-colors">{title}</h3>

                    {genres.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {genres.slice(0, 3).map((g) => (
                                <span key={g} className="bg-[#00aaff] text-black text-xs px-2 py-0.5 rounded-full">
                                    {genreLabel(g)}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-2 border-t border-black/15 flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                            {visiblePlatforms.map((p, i) => (
                                <PlatformIcon key={`${p.name}-${i}`} {...p} />
                            ))}
                            {extraPlatformCount > 0 && (
                                <span className="w-6 h-6 rounded-full bg-[#36b9e9] text-white text-xs flex items-center justify-center">
                                    +{extraPlatformCount}
                                </span>
                            )}
                        </div>

                        {airingAt ? (
                            <div className="flex items-center gap-2 text-xs text-black/70 shrink-0">
                                <span className="flex items-center gap-1"><CalendarIcon />{formatAiringDay(airingAt)}</span>
                                <span className="flex items-center gap-1"><ClockIcon />{formatAiringTime(airingAt)}</span>
                            </div>
                        ) : dateLabel ? (
                            <span className="flex items-center gap-1 text-xs text-black/70 shrink-0"><CalendarIcon />{dateLabel}</span>
                        ) : null}
                    </div>
                    {episode && (
                        <p className="text-xs text-black/60 mt-1">ตอนที่ {episode}</p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default MediaCard;
