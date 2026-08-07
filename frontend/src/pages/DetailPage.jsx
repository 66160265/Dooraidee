import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { genreLabel } from "../utils/genreLabels";

const ENDPOINT_MAP = {
    movie: "movies",
    tv: "tv-shows",
    anime: "anime",
};

function DetailPage({ mediaType }) {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchProviders, setWatchProviders] = useState({ platforms: [], link: null });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:4000/api/${ENDPOINT_MAP[mediaType]}/${id}`);
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

    if (loading) return <p>กำลังโหลด...</p>;
    if (!item) return <p>ไม่พบข้อมูล</p>;

    return (
        <div>
            <h1>{item.title}</h1>
            <img src={item.posterUrl} alt={item.title} />
            <p>{item.description}</p>
            <p>⭐ {item.score.toFixed(1)}</p>
            {item.genres?.length > 0 && (
                <p>แนว: {item.genres.map(genreLabel).join(", ")}</p>
            )}
            {item.studio && <p>ผลิตโดยสตูดิโอ {item.studio}</p>}
            {watchProviders.platforms.length > 0 && (
                <div>
                    <h2>ช่องทางการรับชม</h2>
                    {watchProviders.platforms.map((p) => (
                        <a key={p.name} href={watchProviders.link} target="_blank" rel="noopener noreferrer">
                            <img src={p.logoUrl} alt={p.name} />
                            <span>{p.name}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DetailPage;