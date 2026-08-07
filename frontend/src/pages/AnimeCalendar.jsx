import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import slugify from "../utils/slugify";

function formatAiringTime(airingAt) {
    return new Date(airingAt * 1000).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
    });
}

function AnimeCalendar() {
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:4000/api/anime-calendar");
                const data = await res.json();
                setDays(data.days);
            } catch (err) {
                console.error("Failed to fetch anime calendar:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return <p className="text-gray-400 px-4 pt-4">กำลังโหลด...</p>;
    }

    return (
        <div className="px-4 pt-4 pb-8">
            <h1 className="text-white text-2xl font-bold mb-4">ปฏิทินออกอากาศอนิเมะ</h1>
            {days.map((day) => (
                <div key={day.dayOfWeek} className="mb-8">
                    <h2 className="text-white text-xl font-semibold mb-3">{day.dayOfWeek}</h2>
                    {day.items.length === 0 ? (
                        <p className="text-gray-400">ไม่มีอนิเมะออกอากาศ</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {day.items.map((item) => (
                                <Link
                                    key={`${item.uniqueId}-${item.airingAt}`}
                                    to={`/anime/detail/${item.originalId}/${slugify(item.title)}`}
                                    className="rounded-lg overflow-hidden shadow-md bg-gray-800 hover:scale-105 transition-transform"
                                >
                                    <img src={item.posterUrl} alt={item.title} className="w-full h-56 object-cover" />
                                    <div className="p-2">
                                        <h3 className="text-white text-sm font-semibold truncate">{item.title}</h3>
                                        <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                                            <span>ตอนที่ {item.episode}</span>
                                            <span>{formatAiringTime(item.airingAt)} น.</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AnimeCalendar;
