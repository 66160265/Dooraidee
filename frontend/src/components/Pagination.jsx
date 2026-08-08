function getPageNumbers(current, total) {
    const delta = 2;
    const range = [];
    const withDots = [];
    let last;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (last !== undefined) {
            if (i - last === 2) {
                withDots.push(last + 1);
            } else if (i - last !== 1) {
                withDots.push("...");
            }
        }
        withDots.push(i);
        last = i;
    }

    return withDots;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <div className="flex justify-center items-center gap-1.5 flex-wrap pb-8 px-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full bg-[#E6F8FE] text-black font-medium disabled:opacity-40 hover:bg-[#b1e5ff] transition-colors"
            >
                ก่อนหน้า
            </button>

            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-gray-400">···</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`min-w-10 h-10 px-2 rounded-full font-medium transition-all ${
                            p === currentPage
                                ? "bg-gradient-to-br from-[#54d1ff] to-[#0090c7] text-white shadow-[0_4px_14px_rgba(54,185,233,0.5)] scale-105"
                                : "bg-[#E6F8FE] text-black hover:bg-[#b1e5ff] hover:scale-105"
                        }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full bg-[#E6F8FE] text-black font-medium disabled:opacity-40 hover:bg-[#b1e5ff] transition-colors"
            >
                ถัดไป
            </button>
        </div>
    );
}

export default Pagination;
