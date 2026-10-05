import { useEffect, useState } from "react";
import { subscribeServerSleep } from "../common/server-wake";

const REST_LINES = [
    "The salon is still lighting the candles.",
    "Silk sheets. One more minute.",
    "A gilded pause, then the doors open."
];

const Crescent = ({ compact = false }) => (
    <div className={`beauty-orb ${compact ? "is-compact" : ""}`} aria-hidden="true">
        <span className="beauty-halo"></span>
        <svg viewBox="0 0 96 96" className="beauty-moon">
            <defs>
                <linearGradient id="beauty-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F4E4C1" />
                    <stop offset="45%" stopColor="#D4B483" />
                    <stop offset="100%" stopColor="#A8844A" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="48" r="26" fill="url(#beauty-gold)" opacity="0.18" />
            <path
                fill="url(#beauty-gold)"
                d="M58 18a30 30 0 1 0 0 60 26 26 0 1 1 0-60z"
            />
            <circle cx="62" cy="30" r="1.6" fill="#F7E7C3" />
            <circle cx="70" cy="46" r="1.1" fill="#F7E7C3" opacity="0.8" />
            <circle cx="64" cy="62" r="0.9" fill="#F7E7C3" opacity="0.65" />
        </svg>
        <span className="beauty-mote m1"></span>
        <span className="beauty-mote m2"></span>
        <span className="beauty-mote m3"></span>
    </div>
);

const BeautySleep = ({ compact = false, waiting = true }) => {
    const [sleeping, setSleeping] = useState(false);
    const [line, setLine] = useState(0);
    const lingering = waiting || sleeping;

    useEffect(() => subscribeServerSleep(setSleeping), []);

    useEffect(() => {
        if (!lingering) {
            setLine(0);
            return;
        }
        const tick = setInterval(() => {
            setLine((prev) => (prev + 1) % REST_LINES.length);
        }, 4200);
        return () => clearInterval(tick);
    }, [lingering]);

    if (compact) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Crescent compact />
                <p className="beauty-kicker mt-4">Beauty rest</p>
            </div>
        );
    }

    return (
        <div className="beauty-rest">
            <Crescent />
            <p className="beauty-kicker">Beauty rest</p>
            <p className="beauty-line">
                {lingering ? REST_LINES[line] : "Preparing the room…"}
            </p>
        </div>
    );
};

export default BeautySleep;
