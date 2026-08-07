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
        return <p className="text-gray-500 px-4 pt-8">กำลังโหลด...</p>;
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-8">
            <h1 className="text-3xl font-bold mb-6">ปฏิทินออกอากาศอนิเมะ</h1>
            {days.map((day) => (
                <div key={day.dayOfWeek} className="mb-10">
                    <h2 className="text-xl font-semibold mb-3 text-[#0090c7]">{day.dayOfWeek}</h2>
                    {day.items.length === 0 ? (
                        <p className="text-gray-500">ไม่มีอนิเมะออกอากาศ</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {day.items.map((item) => (
                                <Link
                                    key={`${item.uniqueId}-${item.airingAt}`}
                                    to={`/anime/detail/${item.originalId}/${slugify(item.title)}`}
                                    className="rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
                                >
                                    <div className="relative">
                                        <img src={item.posterUrl} alt={item.title} className="w-full h-64 object-cover" />
                                        <div className="absolute top-2 right-2 bg-white text-black text-sm px-3 py-1 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.2)]">
                                            {formatAiringTime(item.airingAt)} น.
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full bg-black/80 text-white text-sm p-2">
                                            <p className="truncate">{item.title}</p>
                                            <p className="text-gray-300 text-xs">ตอนที่ {item.episode}</p>
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
