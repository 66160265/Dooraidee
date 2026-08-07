import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function DetailPage({ mediaType }) {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:4000/api/trending");
                const data = await res.json();
                const found = data.results.find(
                    (i) => i.mediaType === mediaType && i.originalId === Number(id)
                );
                setItem(found);
            } catch (err) {
                console.error("Failed to fetch detail:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, mediaType]);

    if (loading) return <p>Loading...</p>;
    if (!item) return <p>ไม่พบข้อมูล</p>;

    return (
        <div>
            <h1>{item.title}</h1>
            <img src={item.posterUrl} alt={item.title} />
            <p>{item.description}</p>
            <p>⭐ {item.score.toFixed(1)}</p>
        </div>
    );
}

export default DetailPage;