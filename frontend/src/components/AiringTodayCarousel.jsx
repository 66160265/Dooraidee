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
        return <p className="text-gray-400 px-4">วันนี้ไม่มีอนิเมะออกอากาศ</p>;
    }

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 px-4">
                {items.map((item) => (
                    <Link
                        key={item.uniqueId}
                        to={`/anime/detail/${item.originalId}/${slugify(item.title)}`}
                        className="shrink-0 w-40 rounded-lg overflow-hidden shadow-md bg-gray-800 hover:scale-105 transition-transform"
                    >
                        <img
                            src={item.posterUrl}
                            alt={item.title}
                            className="w-full h-56 object-cover"
                        />
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
        </div>
    );
}

export default AiringTodayCarousel;
