function MediaCardSkeleton() {
    return (
        <div className="flex h-[180px] sm:h-[220px] rounded-2xl overflow-hidden shadow-md bg-gray-100">
            <div className="relative w-[110px] sm:w-[150px] h-full bg-gray-200 shrink-0 overflow-hidden shimmer"></div>
            <div className="flex-1 p-3 space-y-3">
                <div className="relative h-4 bg-gray-200 rounded-full w-3/4 overflow-hidden shimmer"></div>
                <div className="relative h-3 bg-gray-200 rounded-full w-1/2 overflow-hidden shimmer"></div>
                <div className="relative h-3 bg-gray-200 rounded-full w-2/3 overflow-hidden shimmer"></div>
            </div>
        </div>
    )
}

export default MediaCardSkeleton;
