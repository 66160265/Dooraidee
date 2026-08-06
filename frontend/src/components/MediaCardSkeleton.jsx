function MediaCardSkeleton() {
    return (
        <div className="rounded-lg overflow-hidden shadow-md bg-gray-800 animate-pulse">
            <div className="w-full h-72 bg-gray-700"></div>
            <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    )
}

export default MediaCardSkeleton;