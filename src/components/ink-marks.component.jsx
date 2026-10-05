import { useContext } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";
import { UserContext } from "../App";
import { apiUrl } from "../common/server-url"

export const INK_STAMPS = [
    { id: "ink", label: "Ink", hint: "a real blot" },
    { id: "coffee", label: "Coffee", hint: "ring stain" },
    { id: "spark", label: "Spark", hint: "this landed" },
    { id: "flower", label: "Flower", hint: "pressed in" },
    { id: "scribble", label: "Scribble", hint: "in the margin" }
];

export const InkStamp = ({ type, className = "" }) => {
    if (type === "coffee") {
        return (
            <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
                <ellipse cx="30" cy="38" rx="18" ry="16" fill="#C48A52" />
                <ellipse cx="30" cy="38" rx="11" ry="9.5" fill="#F3E2C8" />
                <ellipse cx="30" cy="38" rx="7" ry="6" fill="#8B5A2B" />
                <path d="M47 32c6 1 9 6 8 12-1 5-6 8-11 7" fill="none" stroke="#C48A52" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 12c0 5 4 6 4 10M32 10c1 5 5 6 4 11M38 13c0 4 3 5 3 9" fill="none" stroke="#D4A574" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="23" cy="32" r="2.4" fill="white" opacity="0.55" />
            </svg>
        );
    }
    if (type === "spark") {
        return (
            <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
                <path fill="#8B46FF" d="M32 6l5.4 16.6L54 28l-16.6 5.4L32 50l-5.4-16.6L10 28l16.6-5.4z" />
                <path fill="#D9C6FF" d="M32 16l2.4 7.2L42 26l-7.6 2.4L32 36l-2.4-7.6L22 26l7.6-2.8z" />
                <path fill="#8B46FF" d="M50 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
                <path fill="#8B46FF" d="M12 42l1.6 4.6 4.6 1.6-4.6 1.6L12 54l-1.6-4.6-4.6-1.6 4.6-1.6z" />
            </svg>
        );
    }
    if (type === "flower") {
        return (
            <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
                <path fill="#F4A7C0" d="M32 8c4 8 2 14 0 18-2-4-4-10 0-18z" />
                <path fill="#EE8FB0" d="M48 16c-2 9-8 13-13 15 6-2 13-6 13-15z" />
                <path fill="#F4A7C0" d="M52 36c-8 3-14 2-18 0 4-2 10-4 18 0z" />
                <path fill="#EE8FB0" d="M42 52c-8-4-12-10-13-16 3 5 9 12 13 16z" />
                <path fill="#F4A7C0" d="M22 52c4-8 10-12 16-13-5 3-12 9-16 13z" />
                <path fill="#EE8FB0" d="M12 36c8-3 14-2 18 0-4 2-10 4-18 0z" />
                <path fill="#F4A7C0" d="M16 16c2 9 8 13 13 15-6-2-13-6-13-15z" />
                <circle cx="32" cy="32" r="6" fill="#F6D36B" />
                <circle cx="32" cy="32" r="2.4" fill="#C48A2B" />
            </svg>
        );
    }
    if (type === "scribble") {
        return (
            <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
                <path d="M8 32h10M46 32h10M14 14l8 8M42 42l8 8M14 50l8-8M42 22l8-8" stroke="#8B46FF" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                <path d="M24 8v34" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <circle cx="24" cy="52" r="6" fill="currentColor" />
                <path d="M40 6v36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <circle cx="40" cy="52" r="6" fill="currentColor" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
            <path fill="#8B46FF" d="M32 4c2 16-18 26-18 40a18 18 0 1 0 36 0c0-14-20-24-18-40z" />
            <ellipse cx="26" cy="36" rx="6" ry="8" fill="white" opacity="0.35" />
            <circle cx="28" cy="40" r="2.2" fill="#1A1A1A" />
            <circle cx="38" cy="40" r="2.2" fill="#1A1A1A" />
            <circle cx="28.7" cy="39.3" r="0.7" fill="white" />
            <circle cx="38.7" cy="39.3" r="0.7" fill="white" />
            <path d="M28 46c2 2 6 2 8 0" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="24" cy="44" r="2" fill="#FF8A9B" opacity="0.85" />
            <circle cx="42" cy="44" r="2" fill="#FF8A9B" opacity="0.85" />
            <path fill="#D9C6FF" d="M46 10l1.6 4.4L52 16l-4.4 1.6L46 22l-1.6-4.4L40 16l4.4-1.6z" />
        </svg>
    );
};

export const InkCanvas = () => {
    const { inkMarks, setInkMarks, placingType, setPlacingType, setMyInkTypes, blog } = useContext(BlogContext);
    const { userAuth: { access_token } } = useContext(UserContext);

    const dropMark = (e) => {
        if (!placingType) return;
        if (!access_token) {
            toast.error("Sign in to leave a blot");
            setPlacingType(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const type = placingType;
        setPlacingType(null);

        axios.post(apiUrl("/leave-ink"), {
            _id: blog._id,
            blog_id: blog.blog_id,
            type,
            x,
            y
        }, {
            headers: { Authorization: `Bearer ${access_token}` }
        })
            .then(({ data }) => {
                if (data.removed) {
                    setInkMarks((marks) => marks.filter((mark) => !(mark.mine && mark.type === type)));
                    setMyInkTypes((types) => types.filter((item) => item !== type));
                    return;
                }
                setInkMarks((marks) => [...marks, data.mark]);
                setMyInkTypes((types) => types.includes(type) ? types : [...types, type]);
            })
            .catch((err) => {
                const status = err?.response?.status;
                const message = err?.response?.data?.error
                    || (status === 404 ? "Ink isn't on the live server yet. Use the local API." : "The blot didn't stick");
                toast.error(message);
            });
    };

    return (
        <div
            className={"ink-canvas " + (placingType ? "is-placing" : "")}
            onClick={dropMark}
        >
            {(inkMarks || []).map((mark) => {
                const stamp = INK_STAMPS.find((item) => item.id === mark.type);
                return (
                <span
                    key={mark._id}
                    className={"ink-mark" + (mark.mine ? " is-mine" : "")}
                    style={{
                        left: mark.x + "%",
                        top: mark.y + "%"
                    }}
                >
                    <span className={"ink-mark-art ink-mark-" + mark.type} style={{ display: "block", width: "100%", height: "100%", transform: `rotate(${mark.rotate || 0}deg)` }}>
                        <InkStamp type={mark.type} />
                    </span>
                    <span className="ink-name">
                        {stamp?.label || mark.type}
                        {mark.mine ? " · yours" : mark.username ? ` · @${mark.username}` : ""}
                    </span>
                </span>
                );
            })}
            {placingType ?
                <p className="ink-place-hint">tap the page to leave your {placingType}</p>
                : ""}
        </div>
    );
};

export const InkPalette = () => {
    const { placingType, setPlacingType, myInkTypes, inkMarks, setInkMarks, setMyInkTypes, blog } = useContext(BlogContext);
    const { userAuth: { access_token } } = useContext(UserContext);

    const pickStamp = (type) => {
        if (!access_token) {
            return toast.error("Sign in to leave a blot");
        }

        if (myInkTypes.includes(type)) {
            axios.post(apiUrl("/leave-ink"), {
                _id: blog._id,
                blog_id: blog.blog_id,
                type,
                x: 50,
                y: 50
            }, {
                headers: { Authorization: `Bearer ${access_token}` }
            })
                .then(() => {
                    setInkMarks((marks) => marks.filter((mark) => !(mark.mine && mark.type === type)));
                    setMyInkTypes((types) => types.filter((item) => item !== type));
                    setPlacingType(null);
                    toast.success("blot lifted");
                })
                .catch((err) => {
                    toast.error(err?.response?.data?.error || "Could not lift that blot");
                });
            return;
        }

        setPlacingType((current) => current === type ? null : type);
    };

    return (
        <div className="flex items-end gap-4 flex-wrap">
            {INK_STAMPS.map((stamp) => {
                const active = placingType === stamp.id;
                const mine = myInkTypes.includes(stamp.id);
                return (
                    <button
                        key={stamp.id}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            pickStamp(stamp.id);
                        }}
                        className={"ink-stamp-btn flex flex-col items-center gap-2 min-w-[52px] " + (active || mine ? "text-black" : "text-dark-grey")}
                    >
                        <span className={"w-12 h-12 rounded-full flex items-center justify-center border-2 " + (active
                            ? "bg-white border-black"
                            : mine
                                ? "bg-grey border-black"
                                : "bg-grey border-transparent hover:border-black")}>
                            <InkStamp type={stamp.id} className="w-7 h-7" />
                        </span>
                        <span className="text-[11px] tracking-wide">{stamp.label}</span>
                    </button>
                );
            })}
            <p className="text-dark-grey text-sm pb-1">
                {(inkMarks || []).length}
            </p>
        </div>
    );
};
