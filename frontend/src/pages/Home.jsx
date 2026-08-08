import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AiringTodayCarousel from "../components/AiringTodayCarousel";
import AiringTodayCardSkeleton from "../components/AiringTodayCardSkeleton";

function Home() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://localhost:4000/api/anime-calendar/today");
                if (!res.ok) return;
                const data = await res.json();
                setItems(data.results || []);
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
            <div className="relative max-w-[1200px] mx-auto mt-10 rounded-3xl overflow-hidden bg-gradient-to-br from-[#54d1ff] via-[#36b9e9] to-[#0090c7] shadow-[0_10px_40px_rgba(54,185,233,0.35)] py-16 px-4 text-center">
                <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" />

                <div className="relative animate-fade-in-up">
                    <p className="text-white text-4xl md:text-5xl font-bold drop-shadow-sm">ยินดีต้อนรับเข้าสู่ Dooraidee</p>
                    <p className="text-white/90 text-lg md:text-xl mt-3">ศูนย์รวมหนัง ซีรีส์ และอนิเมะที่คุณชื่นชอบ</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/movies"
                            className="inline-block bg-white text-[#0090c7] text-lg font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all"
                        >
                            ดูรายชื่อหนัง
                        </Link>
                        <Link
                            to="/tv-shows"
                            className="inline-block bg-white text-[#0090c7] text-lg font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all"
                        >
                            ดูรายชื่อซีรีส์
                        </Link>
                        <Link
                            to="/anime"
                            className="inline-block bg-white text-[#0090c7] text-lg font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition-all"
                        >
                            ดูรายชื่ออนิเมะ
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto mt-14 mb-16 px-4">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-[#54d1ff] to-[#0090c7]" />
                    <h2 className="text-2xl font-bold">อนิเมะออกอากาศวันนี้</h2>
                </div>

                <div className="rounded-3xl bg-[#E6F8FE] py-8 shadow-sm">
                    {loading ? (
                        <div className="flex gap-6 px-4 overflow-hidden">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <AiringTodayCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <AiringTodayCarousel items={items} />
                    )}
                </div>
            </div>
        </>
    );
}

export default Home;
