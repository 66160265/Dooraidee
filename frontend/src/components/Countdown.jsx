import { useState, useEffect } from "react";

function formatRemaining(seconds) {
    if (seconds <= 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function Countdown({ targetTimestamp }) {
    const [now, setNow] = useState(() => Date.now() / 1000);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now() / 1000), 1000);
        return () => clearInterval(interval);
    }, []);

    const remaining = formatRemaining(targetTimestamp - now);

    if (!remaining) {
        return <span className="text-lg font-semibold">ออกอากาศแล้ว</span>;
    }

    return (
        <div className="text-center">
            <p className="text-4xl font-bold tabular-nums tracking-wide">{remaining}</p>
            <p className="mt-1 text-sm text-white/80">กำลังรอออกอากาศ</p>
        </div>
    );
}

export default Countdown;
