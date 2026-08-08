import useEmblaCarousel from "embla-carousel-react";
import AiringTodayCard from "./AiringTodayCard";

function AiringTodayCarousel({ items }) {
    const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

    if (items.length === 0) {
        return <p className="text-gray-500 px-4">วันนี้ไม่มีอนิเมะออกอากาศ</p>;
    }

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 px-4">
                {items.map((item, i) => (
                    <div
                        key={item.uniqueId}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                    >
                        <AiringTodayCard {...item} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AiringTodayCarousel;
