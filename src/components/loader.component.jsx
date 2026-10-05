const Loader = ({ compact = false }) => {
    return (
        <div className={`flex items-center justify-center ${compact ? "py-6" : "py-16"}`}>
            <span className={`quiet-ring ${compact ? "is-compact" : ""}`} aria-hidden="true"></span>
            <span className="sr-only">Loading</span>
        </div>
    );
};

export default Loader;
