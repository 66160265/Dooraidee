import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import slugify from "../utils/slugify";

function formatAiringTime(airingAt) {
    return new Date(airingAt * 1000).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
    });
}

function AiringTodayCarousel({ items }) {
    const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

    if (items.length === 0) {
        return <p className="text-gray-500 px-4">วันนี้ไม่มีอนิเมะออกอากาศ</p>;
    }

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 px-6">
                {items.map((item) => (
                    <Link
                        key={item.uniqueId}
                        to={`/anime/detail/${item.originalId}/${slugify(item.title)}`}
                        className="shrink-0 w-[200px] rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
                    >
                        <div className="relative">
                            <img
                                src={item.posterUrl}
                                alt={item.title}
                                className="w-full h-[310px] object-cover"
                            />
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
        </div>
    );
}

export default AiringTodayCarousel;
