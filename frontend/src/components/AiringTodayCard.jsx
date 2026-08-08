import { Link } from "react-router-dom";
import slugify from "../utils/slugify";

function formatAiringDay(airingAt) {
    return new Date(airingAt * 1000).toLocaleDateString("th-TH", {
        weekday: "long",
        timeZone: "Asia/Bangkok",
    });
}

function formatAiringTime(airingAt) {
    return new Date(airingAt * 1000).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
    });
}

function AiringTodayCard({ title, posterUrl, originalId, airingAt }) {
    return (
        <Link to={`/anime/detail/${originalId}/${slugify(title)}`} className="group block w-[150px] sm:w-[220px] shrink-0">
            {airingAt && (
                <p className="text-center text-sm font-medium text-[#0090c7] mb-2">
                    {formatAiringDay(airingAt)} {formatAiringTime(airingAt)}
                </p>
            )}
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[3/4] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(54,185,233,0.35)] group-hover:-translate-y-1">
                <img
                    src={posterUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>
            <p className="mt-2 text-center text-sm font-semibold line-clamp-2 group-hover:text-[#0090c7] transition-colors">
                {title}
            </p>
        </Link>
    );
}

export default AiringTodayCard;
