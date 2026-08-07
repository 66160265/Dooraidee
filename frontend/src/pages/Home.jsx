import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
            <div className="max-w-[1200px] mx-auto mt-10 rounded-2xl bg-[#36b9e9] shadow-[0_0_20px_rgba(0,0,0,0.2)] py-8 px-4 text-center">
                <p className="text-white text-3xl">ยินดีต้อนรับเข้าสู่ Dooraidee</p>
                <p className="text-white text-xl mt-2">ศูนย์รวมหนัง ซีรีส์ และอนิเมะที่คุณชื่นชอบ</p>
                <div className="mt-6">
                    <Link
                        to="/anime"
                        className="inline-block bg-[#54d1ff] text-white text-lg px-8 py-2.5 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:opacity-90"
                    >
                        ดูรายชื่ออนิเมะ
                    </Link>
                </div>
            </div>

            <h2 className="mt-10 ml-4 md:ml-[calc((100%-1200px)/2)] text-2xl font-semibold">
                อนิเมะออกอากาศวันนี้
            </h2>

            <div className="max-w-[1200px] mx-auto mt-4 mb-16 rounded-2xl bg-[#E6F8FE] py-8">
                {loading ? (
                    <p className="text-gray-500 px-4">กำลังโหลด...</p>
                ) : (
                    <AiringTodayCarousel items={items} />
                )}
            </div>
        </>
    );
}

export default Home;
