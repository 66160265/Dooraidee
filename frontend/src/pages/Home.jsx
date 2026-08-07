import { useState, useEffect } from "react";
import AiringTodayCarousel from "../components/AiringTodayCarousel";

function Home() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:4000/api/anime-calendar/today");
                const data = await res.json();
                setItems(data.results);
            } catch (err) {
                console.error("Failed to fetch today's airing anime:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <>
            <h1 className="text-white text-2xl font-bold px-4 pt-4">อนิเมะออกอากาศวันนี้</h1>
            {loading ? (
                <p className="text-gray-400 px-4">กำลังโหลด...</p>
            ) : (
                <AiringTodayCarousel items={items} />
            )}
        </>
    );
}

export default Home;
