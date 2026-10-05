import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { apiUrl } from "../common/server-url"

const MODES = [
    { id: "haiku", label: "Haiku", hint: "five / seven / five" },
    { id: "trailer", label: "Trailer", hint: "in a world..." },
    { id: "argue", label: "Argue", hint: "pick a fight" },
    { id: "gossip", label: "Gossip", hint: "spill it" },
    { id: "groupchat", label: "Group chat", hint: "Rio, Sage, Kit" },
    { id: "radio", label: "Late night", hint: "between songs" }
];

const RemixLab = ({ blog_id }) => {
    const [activeMode, setActiveMode] = useState(null);
    const [remix, setRemix] = useState("");
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState("");
    const [chat, setChat] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        setActiveMode(null);
        setRemix("");
        setQuestion("");
        setChat([]);
    }, [blog_id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [chat, loading]);

    const runRemix = async (mode) => {
        setActiveMode(mode);
        setLoading(true);
        setRemix("");

        try {
            const { data } = await axios.post(apiUrl("/remix-blog"), {
                blog_id,
                mode
            });
            setRemix(data.remix);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Remix fizzled");
            setActiveMode(null);
        } finally {
            setLoading(false);
        }
    };

    const askPost = async (e) => {
        e.preventDefault();
        const nextQuestion = question.trim();
        if (!nextQuestion || loading) return;

        const history = [...chat, { role: "user", content: nextQuestion }];
        setChat(history);
        setQuestion("");
        setActiveMode("ask");
        setLoading(true);

        try {
            const { data } = await axios.post(apiUrl("/remix-blog"), {
                blog_id,
                mode: "ask",
                question: nextQuestion,
                history: chat
            });
            setChat([...history, { role: "assistant", content: data.remix }]);
        } catch (err) {
            toast.error(err?.response?.data?.error || "The post went quiet");
            setChat(chat);
        } finally {
            setLoading(false);
        }
    };

    const copyRemix = async () => {
        const text = activeMode === "ask"
            ? chat.map((item) => `${item.role === "user" ? "You" : "Post"}: ${item.content}`).join("\n\n")
            : remix;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied");
        } catch {
            toast.error("Could not copy");
        }
    };

    return (
        <section id="remix-lab" className="!px-0 !py-0 mt-16 mb-6">
            <div className="rounded-3xl border border-grey bg-grey/40 p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-purple mb-2">Remix Lab</p>
                        <h3 className="text-3xl md:text-4xl font-medium leading-tight">What if this post were something else?</h3>
                        <p className="text-dark-grey mt-3 text-xl font-gelasio">Pick a lens. The piece stays the same. The vibe does not.</p>
                    </div>
                    <span className="hidden sm:flex w-12 h-12 rounded-full bg-purple/15 text-purple items-center justify-center shrink-0">
                        <i className="fi fi-rr-magic-wand text-xl"></i>
                    </span>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                    {MODES.map((mode) => (
                        <button
                            key={mode.id}
                            disabled={loading}
                            onClick={() => runRemix(mode.id)}
                            className={"rounded-full px-5 py-3 border transition-all " + (activeMode === mode.id
                                ? "bg-black text-white border-black"
                                : "bg-white text-black border-grey hover:border-black")}
                        >
                            <span className="block text-base capitalize">{mode.label}</span>
                            <span className={"block text-sm mt-0.5 " + (activeMode === mode.id ? "text-white/70" : "text-dark-grey")}>{mode.hint}</span>
                        </button>
                    ))}
                </div>

                {(loading || remix || chat.length) ? (
                    <AnimationWrapper>
                        <div className={"mt-8 rounded-2xl bg-white border border-grey p-5 md:p-7 " + (activeMode === "haiku" ? "text-center" : "")}>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm uppercase tracking-[0.16em] text-dark-grey">
                                    {activeMode === "ask" ? "The post talks back" : (MODES.find((mode) => mode.id === activeMode)?.label || "Remix")}
                                </p>
                                {(remix || chat.length) && !loading ?
                                    <button onClick={copyRemix} className="text-sm text-dark-grey hover:text-black flex items-center gap-2">
                                        <i className="fi fi-rr-copy-alt"></i> Copy
                                    </button> : ""}
                            </div>

                            {activeMode === "ask" ? (
                                <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">
                                    {chat.map((item, i) => (
                                        <div key={i} className={item.role === "user" ? "ml-8 rounded-2xl bg-grey px-4 py-3" : "mr-8"}>
                                            <p className="text-sm text-dark-grey mb-1">{item.role === "user" ? "You" : "The post"}</p>
                                            <p className="font-gelasio text-xl leading-8 whitespace-pre-wrap">{item.content}</p>
                                        </div>
                                    ))}
                                    {loading ? <p className="text-dark-grey italic">the post is thinking in ink...</p> : ""}
                                    <div ref={chatEndRef}></div>
                                </div>
                            ) : loading ? (
                                <p className="font-gelasio text-xl text-dark-grey italic">spilling the ink...</p>
                            ) : (
                                <p className={"font-gelasio whitespace-pre-wrap text-black " + (activeMode === "haiku"
                                    ? "text-3xl leading-relaxed"
                                    : "text-xl md:text-2xl leading-9")}>{remix}</p>
                            )}
                        </div>
                    </AnimationWrapper>
                ) : ""}

                <form onSubmit={askPost} className="mt-8 flex flex-col sm:flex-row gap-3">
                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        maxLength={500}
                        placeholder="Ask this post anything..."
                        className="input-box pl-5 bg-white"
                    />
                    <button disabled={loading || !question.trim()} className="btn-dark px-8 disabled:opacity-40">
                        Ask
                    </button>
                </form>
            </div>
        </section>
    );
};

export default RemixLab;
