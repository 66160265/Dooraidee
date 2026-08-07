import { useState, useEffect } from "react";
import MediaCard from "../components/MediaCard";

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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {day.items.map((item) => (
                                <MediaCard key={`${item.uniqueId}-${item.airingAt}`} {...item} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default AnimeCalendar;
