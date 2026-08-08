import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { genreLabel } from "../utils/genreLabels";
import PlatformIcon from "../components/PlatformIcon";
import { API_BASE_URL } from "../config";

const ENDPOINT_MAP = {
    movie: "movies",
    tv: "tv-shows",
    anime: "anime",
};

function DetailPage({ mediaType }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchProviders, setWatchProviders] = useState({ platforms: [], link: null });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/${ENDPOINT_MAP[mediaType]}/${id}`);
                if (!res.ok) {
                    setItem(null);
                    return;
                }
                const data = await res.json();
                setItem(data);
            } catch (err) {
                console.error("Failed to fetch detail:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, mediaType]);

    useEffect(() => {
        if (!item) return;

        async function fetchProviders() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/watch-providers/${mediaType}/${id}?title=${encodeURIComponent(item.title)}`);
                if (!res.ok) return;
                const data = await res.json();
                setWatchProviders(data);
            } catch (err) {
                console.error("Failed to fetch watch providers:", err);
            }
        }
        fetchProviders();
    }, [mediaType, id, item]);

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto pt-8 pb-16 px-4">
                <div className="relative h-9 w-28 bg-gray-100 rounded-full mb-4 overflow-hidden shimmer" />
                <div className="flex flex-col md:flex-row gap-6 bg-white rounded-3xl p-4 sm:p-6 shadow-sm">
                    <div className="relative w-full md:w-[250px] h-[300px] sm:h-[350px] rounded-2xl shrink-0 bg-gray-200 overflow-hidden shimmer" />
                    <div className="flex-1 space-y-4">
                        <div className="relative h-8 w-3/4 bg-gray-200 rounded-full overflow-hidden shimmer" />
                        <div className="flex gap-2">
                            <div className="relative h-6 w-16 bg-gray-200 rounded-full overflow-hidden shimmer" />
                            <div className="relative h-6 w-24 bg-gray-200 rounded-full overflow-hidden shimmer" />
                        </div>
                        <div className="space-y-2">
                            <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden shimmer" />
                            <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden shimmer" />
                            <div className="relative h-4 w-2/3 bg-gray-200 rounded-full overflow-hidden shimmer" />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative h-7 w-20 bg-gray-200 rounded-full overflow-hidden shimmer" />
                            <div className="relative h-7 w-20 bg-gray-200 rounded-full overflow-hidden shimmer" />
                            <div className="relative h-7 w-20 bg-gray-200 rounded-full overflow-hidden shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="max-w-[1200px] mx-auto pt-16 pb-16 px-4 text-center">
                <p className="text-5xl mb-3">😕</p>
                <p className="text-gray-500 text-lg">ไม่พบข้อมูล</p>
            </div>
        );
    }

    return (
        <div className="pb-16">
            <div className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-40"
                    style={{ backgroundImage: `url(${item.posterUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/70 to-white" />

                <div className="relative max-w-[1200px] mx-auto pt-8 px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm text-black px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:-translate-x-0.5 transition-all"
                    >
                        &larr; ย้อนกลับ
                    </button>

                    <div className="flex flex-col md:flex-row gap-5 sm:gap-6 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] animate-fade-in-up">
                        <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-full md:w-[250px] h-[300px] sm:h-[350px] object-cover rounded-2xl shrink-0 shadow-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex-wrap">{item.title}</h1>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="flex items-center gap-1 bg-yellow-400/90 text-black text-sm font-semibold px-3 py-1 rounded-full">
                                    ⭐ {item.score.toFixed(1)}
                                </span>
                                {item.ageRating && (
                                    <span className="bg-black/80 text-white text-xs font-medium px-3 py-1 rounded-full">
                                        {item.ageRating}
                                    </span>
                                )}
                            </div>

                            <p className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed text-black/80">{item.description}</p>

                            {item.genres?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {item.genres.map((g) => (
                                        <span key={g} className="bg-[#00aaff] text-black text-sm px-3 py-1 rounded-full">
                                            {genreLabel(g)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {item.studio && (
                                <div className="mt-5">
                                    <p className="text-sm mb-2 text-black/70">ผลิตโดยสตูดิโอ {item.studio}</p>
                                    {item.studioLogoUrl && (
                                        <img
                                            src={item.studioLogoUrl}
                                            alt={item.studio}
                                            className="h-16 w-auto max-w-[200px] object-contain bg-white rounded-xl p-2.5 shadow-sm"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {watchProviders.platforms.length > 0 && (
                <div className="max-w-[1200px] mx-auto px-4 mt-6">
                    <div className="bg-[#b1e5ff] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#54d1ff] to-[#0090c7]" />
                            <h2 className="text-xl font-semibold">ช่องทางการรับชม</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {watchProviders.platforms.map((p, i) => (
                                <a
                                    key={`${p.name}-${i}`}
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white rounded-full pl-2 pr-4 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                                >
                                    <PlatformIcon {...p} />
                                    <span className="text-black text-sm font-medium">{p.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetailPage;
