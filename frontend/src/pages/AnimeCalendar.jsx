import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import Countdown from "../components/Countdown";
import slugify from "../utils/slugify";

const TABS = [
    { key: "anime", label: "อนิเมะ" },
    { key: "movie", label: "หนัง" },
    { key: "tv", label: "ซีรีส์" },
];

function formatShortThaiDate(dateString) {
    return new Date(dateString).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Bangkok",
    });
}

function HeroCountdown({ item }) {
    if (!item) return null;

    return (
        <Link
            to={`/anime/detail/${item.originalId}/${slugify(item.title)}`}
            className="block relative rounded-2xl overflow-hidden mb-10 h-[280px] bg-[#36b9e9]"
        >
            <img
                src={item.posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold">{item.title}</h2>
                <p className="mt-1 text-white/90">ตอนที่ {item.episode}</p>
                <div className="mt-4">
                    <Countdown targetTimestamp={item.airingAt} />
                </div>
            </div>
        </Link>
    );
}

function ReleaseGrid({ items, dateField }) {
    if (items.length === 0) {
        return <p className="text-gray-500">ไม่มีข้อมูล</p>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => (
                <MediaCard key={item.uniqueId} {...item} dateLabel={formatShortThaiDate(item[dateField])} />
            ))}
        </div>
    );
}

function AnimeCalendar() {
    const [activeTab, setActiveTab] = useState("anime");
    const [days, setDays] = useState([]);
    const [soonest, setSoonest] = useState(null);
    const [movies, setMovies] = useState([]);
    const [tvShows, setTvShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJson(url) {
            try {
                const res = await fetch(url);
                if (!res.ok) return null;
                return await res.json();
            } catch (err) {
                console.error(`Failed to fetch ${url}:`, err);
                return null;
            }
        }

        async function fetchData() {
            const [animeData, moviesData, tvData] = await Promise.all([
                fetchJson("http://localhost:4000/api/anime-calendar"),
                fetchJson("http://localhost:4000/api/release-calendar/movies"),
                fetchJson("http://localhost:4000/api/release-calendar/tv-shows"),
            ]);

            setDays(animeData?.days || []);
            setSoonest(animeData?.soonest || null);
            setMovies(moviesData?.results || []);
            setTvShows(tvData?.results || []);
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) {
        return <p className="text-gray-500 px-4 pt-8">กำลังโหลด...</p>;
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-8">
            {activeTab === "anime" && <HeroCountdown item={soonest} />}

            <div className="flex gap-2 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === tab.key
                                ? "bg-[#36b9e9] text-white"
                                : "bg-[#E6F8FE] text-black hover:bg-[#b1e5ff]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "anime" && (
                <>
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
                </>
            )}

            {activeTab === "movie" && (
                <>
                    <h1 className="text-3xl font-bold mb-6">หนังเข้าฉายเร็วๆ นี้</h1>
                    <ReleaseGrid items={movies} dateField="releaseDate" />
                </>
            )}

            {activeTab === "tv" && (
                <>
                    <h1 className="text-3xl font-bold mb-6">ซีรีส์ตอนใหม่</h1>
                    <ReleaseGrid items={tvShows} dateField="nextEpisodeDate" />
                </>
            )}
        </div>
    );
}

export default AnimeCalendar;
