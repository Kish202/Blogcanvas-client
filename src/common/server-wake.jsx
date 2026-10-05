import axios from "axios";
import { apiUrl } from "./server-url"

const SLEEP_AFTER_MS = 1200;
let pending = 0;
let sleepTimer = null;
let sleeping = false;
const listeners = new Set();

const setSleeping = (next) => {
    if (sleeping === next) return;
    sleeping = next;
    listeners.forEach((fn) => fn(next));
};

const noteStart = () => {
    pending += 1;
    if (!sleepTimer) {
        sleepTimer = setTimeout(() => {
            if (pending > 0) setSleeping(true);
        }, SLEEP_AFTER_MS);
    }
};

const noteEnd = () => {
    pending = Math.max(0, pending - 1);
    if (pending === 0) {
        clearTimeout(sleepTimer);
        sleepTimer = null;
        setSleeping(false);
    }
};

const isSleepingError = (error) => {
    const status = error?.response?.status;
    return !status || status === 502 || status === 503 || status === 504;
};

export const subscribeServerSleep = (fn) => {
    listeners.add(fn);
    fn(sleeping);
    return () => listeners.delete(fn);
};

export const watchServerSleep = () => {
    if (watchServerSleep.installed) return;
    watchServerSleep.installed = true;

    axios.interceptors.request.use((config) => {
        if (!config.skipWakeWatch) noteStart();
        return config;
    });

    axios.interceptors.response.use(
        (response) => {
            if (!response.config.skipWakeWatch) noteEnd();
            return response;
        },
        (error) => {
            if (!error.config?.skipWakeWatch) noteEnd();
            return Promise.reject(error);
        }
    );

    const ping = () =>
        axios.get(apiUrl("/trending-blogs"), {
            timeout: 50000,
            skipWakeWatch: true
        });

    ping().catch(async (error) => {
        if (!isSleepingError(error)) return;

        for (let i = 0; i < 18; i += 1) {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            try {
                await ping();
                return;
            } catch (next) {
                if (!isSleepingError(next)) return;
            }
        }
    });
};
