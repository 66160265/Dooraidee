function MediaCardSkeleton() {
    return (
        <div className="flex h-[220px] rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.2)] bg-gray-100 animate-pulse">
            <div className="w-[150px] h-full bg-gray-200 shrink-0"></div>
            <div className="flex-1 p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    )
}

export default MediaCardSkeleton;
