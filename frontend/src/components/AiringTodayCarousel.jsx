import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AiringTodayCard from "./AiringTodayCard";

function ChevronIcon({ direction }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points={direction === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
        </svg>
    );
}

function ScrollButton({ direction, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={direction === "prev" ? "เลื่อนไปก่อนหน้า" : "เลื่อนไปถัดไป"}
            className={`absolute top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#0090c7] transition-all hover:scale-110 hover:shadow-xl disabled:opacity-0 disabled:pointer-events-none ${
                direction === "prev" ? "left-2" : "right-2"
            }`}
        >
            <ChevronIcon direction={direction} />
        </button>
    );
}

function AiringTodayCarousel({ items }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback((api) => {
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    if (items.length === 0) {
        return <p className="text-gray-500 px-4">วันนี้ไม่มีอนิเมะออกอากาศ</p>;
    }

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#E6F8FE] to-transparent z-[5]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#E6F8FE] to-transparent z-[5]" />

            <ScrollButton direction="prev" onClick={() => emblaApi?.scrollPrev()} disabled={!canScrollPrev} />
            <ScrollButton direction="next" onClick={() => emblaApi?.scrollNext()} disabled={!canScrollNext} />

            <div className="overflow-hidden px-10" ref={emblaRef}>
                <div className="flex gap-6">
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
        </div>
    );
}

export default AiringTodayCarousel;
