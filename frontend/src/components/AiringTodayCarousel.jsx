import useEmblaCarousel from "embla-carousel-react";
import MediaCard from "./MediaCard";

function AiringTodayCarousel({ items }) {
    const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

    if (items.length === 0) {
        return <p className="text-gray-500 px-4">วันนี้ไม่มีอนิเมะออกอากาศ</p>;
    }

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 px-4">
                {items.map((item, i) => (
                    <div
                        key={item.uniqueId}
                        className="shrink-0 w-[380px] animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                    >
                        <MediaCard {...item} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AiringTodayCarousel;
