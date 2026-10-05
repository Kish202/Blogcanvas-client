import { useEffect, useState } from "react";
import { subscribeServerSleep } from "../common/server-wake";

const SLEEP_LINES = [
    "Inky dozed off on the page.",
    "Blotting a little dream…",
    "Back in a tiny splash.",
    "The ink is still yawning."
];

const Inky = ({ size = "md" }) => {
    const scale = size === "sm" ? "w-14 h-[4.25rem]" : "w-[4.5rem] h-[5.5rem]";

    return (
        <div className={`relative ${scale} mx-auto`} aria-hidden="true">
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[72%] h-3 rounded-full bg-black/10 ink-nap-shadow"></div>
            <svg viewBox="0 0 80 96" className="relative z-[1] w-full h-full ink-nap-blob">
                <path
                    className="fill-purple"
                    d="M40 6C40 6 14 40 14 58a26 26 0 1 0 52 0C66 40 40 6 40 6z"
                />
                <ellipse cx="30" cy="50" rx="7" ry="11" fill="white" opacity="0.28" />
                <path d="M26 58q6 7 12 0" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M42 58q6 7 12 0" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="24" cy="66" r="3.6" fill="#FFB7C5" opacity="0.7" />
                <circle cx="56" cy="66" r="3.6" fill="#FFB7C5" opacity="0.7" />
            </svg>
            <span className="ink-nap-z z-one text-purple">z</span>
            <span className="ink-nap-z z-two text-purple">z</span>
            {size !== "sm" ? <span className="ink-nap-z z-three text-purple">z</span> : null}
        </div>
    );
};

const Loader = ({ compact = false }) => {
    const [sleeping, setSleeping] = useState(false);
    const [line, setLine] = useState(0);

    useEffect(() => subscribeServerSleep(setSleeping), []);

    useEffect(() => {
        if (!sleeping) {
            setLine(0);
            return;
        }
        const tick = setInterval(() => {
            setLine((prev) => (prev + 1) % SLEEP_LINES.length);
        }, 3600);
        return () => clearInterval(tick);
    }, [sleeping]);

    if (compact) {
        return (
            <div className="flex items-center justify-center py-6">
                <Inky size="sm" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            <Inky />
            <p className="uppercase tracking-[0.2em] text-[11px] text-purple mt-5 mb-2">
                {sleeping ? "beauty sleep" : "mixing ink"}
            </p>
            <p className="font-gelasio text-2xl leading-snug text-black max-w-xs">
                {sleeping ? SLEEP_LINES[line] : "Just a tiny blot…"}
            </p>
            <div className="ink-nap-dots mt-5">
                <span className="bg-purple"></span>
                <span className="bg-purple"></span>
                <span className="bg-purple"></span>
            </div>
        </div>
    );
};

export default Loader;
