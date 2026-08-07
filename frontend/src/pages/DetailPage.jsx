import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { genreLabel } from "../utils/genreLabels";

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
                const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}/${id}`);
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
        if (mediaType === "anime") return;

        async function fetchProviders() {
            try {
                const res = await fetch(`http://localhost:4000/api/watch-providers/${mediaType}/${id}`);
                const data = await res.json();
                setWatchProviders(data);
            } catch (err) {
                console.error("Failed to fetch watch providers:", err);
            }
        }
        fetchProviders();
    }, [mediaType, id]);

    if (loading) return <p className="text-center pt-8">กำลังโหลด...</p>;
    if (!item) return <p className="text-center pt-8">ไม่พบข้อมูล</p>;

    return (
        <div className="max-w-[1200px] mx-auto pt-8 pb-16 px-4">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 bg-[#b1e5ff] text-black px-4 py-1.5 rounded-md hover:scale-[1.02] transition-transform"
            >
                &larr; ย้อนกลับ
            </button>

            <div className="flex flex-col md:flex-row gap-5 bg-[#b1e5ff] rounded-xl p-5">
                <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full md:w-[250px] h-[350px] object-cover rounded-lg shrink-0"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex-wrap">{item.title}</h1>
                    <p className="mt-2 text-lg">{item.description}</p>
                    <p className="mt-2">⭐ {item.score.toFixed(1)}</p>

                    {item.genres?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {item.genres.map((g) => (
                                <span key={g} className="bg-[#00aaff] text-black text-sm px-3 py-1 rounded-md">
                                    {genreLabel(g)}
                                </span>
                            ))}
                        </div>
                    )}

                    {item.studio && (
                        <div className="mt-4">
                            <p className="text-sm mb-2">ผลิตโดยสตูดิโอ {item.studio}</p>
                            {item.studioLogoUrl && (
                                <img
                                    src={item.studioLogoUrl}
                                    alt={item.studio}
                                    className="h-28 w-auto object-contain bg-white rounded-lg p-3 shadow-[0_0_5px_rgba(0,0,0,0.2)]"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {watchProviders.platforms.length > 0 && (
                <div className="mt-6 bg-[#b1e5ff] rounded-xl p-5">
                    <h2 className="text-xl font-semibold mb-3">ช่องทางการรับชม</h2>
                    <div className="flex flex-wrap gap-4">
                        {watchProviders.platforms.map((p) => (
                            <a
                                key={p.name}
                                href={watchProviders.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 hover:scale-105 transition-transform"
                            >
                                <img src={p.logoUrl} alt={p.name} className="w-6 h-6 rounded" />
                                <span className="text-black text-sm">{p.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DetailPage;
