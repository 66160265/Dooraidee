import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import MediaCardSkeleton from "../components/MediaCardSkeleton";
import Countdown from "../components/Countdown";
import slugify from "../utils/slugify";
import { API_BASE_URL } from "../config";

const TABS = [
    { key: "movie", label: "หนัง" },
    { key: "tv", label: "ซีรีส์" },
    { key: "anime", label: "อนิเมะ" },
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
            className="group block relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 h-[220px] sm:h-[300px] bg-gradient-to-br from-[#54d1ff] via-[#36b9e9] to-[#0090c7] shadow-[0_10px_40px_rgba(54,185,233,0.35)]"
        >
            <img
                src={item.posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-25 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
                <span className="text-xs uppercase tracking-widest text-white/70 mb-2">ออกอากาศเร็วที่สุด</span>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold drop-shadow-sm">{item.title}</h2>
                <p className="mt-1 text-sm sm:text-base text-white/90">ตอนที่ {item.episode}</p>
                <div className="mt-3 sm:mt-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3">
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
            {items.map((item, i) => (
                <div key={item.uniqueId} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}>
                    <MediaCard {...item} dateLabel={formatShortThaiDate(item[dateField])} />
                </div>
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
                fetchJson(`${API_BASE_URL}/api/anime-calendar`),
                fetchJson(`${API_BASE_URL}/api/release-calendar/movies`),
                fetchJson(`${API_BASE_URL}/api/release-calendar/tv-shows`),
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
        return (
            <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-8">
                <div className="relative rounded-2xl sm:rounded-3xl mb-6 sm:mb-10 h-[220px] sm:h-[300px] bg-gray-200 overflow-hidden shimmer" />
                <div className="relative h-11 w-64 bg-gray-100 rounded-full mb-6 overflow-hidden shimmer" />
                <div className="relative h-9 w-72 bg-gray-200 rounded-full mb-6 overflow-hidden shimmer" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <MediaCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-8">
            {activeTab === "anime" && <HeroCountdown item={soonest} />}

            <div className="flex gap-2 mb-6 bg-[#E6F8FE] p-1.5 rounded-full w-fit shadow-inner">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 rounded-full font-medium transition-all ${
                            activeTab === tab.key
                                ? "bg-gradient-to-br from-[#54d1ff] to-[#0090c7] text-white shadow-[0_4px_14px_rgba(54,185,233,0.4)]"
                                : "text-black/70 hover:bg-white/60"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "anime" && (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">ปฏิทินออกอากาศอนิเมะ</h1>
                    {days.map((day) => (
                        <div key={day.dayOfWeek} className="mb-10">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#54d1ff] to-[#0090c7]" />
                                <h2 className="text-xl font-semibold text-[#0090c7]">{day.dayOfWeek}</h2>
                            </div>
                            {day.items.length === 0 ? (
                                <p className="text-gray-500 pl-4">ไม่มีอนิเมะออกอากาศ</p>
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
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 animate-fade-in-up">หนังเข้าฉายเร็วๆ นี้</h1>
                    <ReleaseGrid items={movies} dateField="releaseDate" />
                </>
            )}

            {activeTab === "tv" && (
                <>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 animate-fade-in-up">ซีรีส์ตอนใหม่</h1>
                    <ReleaseGrid items={tvShows} dateField="nextEpisodeDate" />
                </>
            )}
        </div>
    );
}

export default AnimeCalendar;
