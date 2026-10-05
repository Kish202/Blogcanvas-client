export const apiUrl = (path) => {
    const origin = String(import.meta.env.VITE_SERVER_DOMAIN || "").replace(/\/$/, "");
    const route = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${route}`;
};
