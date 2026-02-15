import { API_CONFIG } from "@/configs/constants";

const globalRequestQueue: number[] = [];
const pendingRequests = new Map<string, Promise<any>>();

const canMakeRequest = (lastFetchedTime: number): { allowed: boolean; waitTime?: number } => {
    const now = Date.now();

    while (globalRequestQueue.length > 0 && now - globalRequestQueue[0] > API_CONFIG.RATE_LIMIT_WINDOW) {
        globalRequestQueue.shift();
    }

    if (globalRequestQueue.length >= API_CONFIG.MAX_REQUESTS_PER_WINDOW) {
        const oldestRequest = globalRequestQueue[0];
        const waitTime = Math.ceil((API_CONFIG.RATE_LIMIT_WINDOW - (now - oldestRequest)) / 1000);
        return { allowed: false, waitTime };
    }

    const timeSinceLast = now - lastFetchedTime;
    if (lastFetchedTime > 0 && timeSinceLast < API_CONFIG.MIN_REQUEST_DELAY) {
        return { allowed: false, waitTime: Math.ceil((API_CONFIG.MIN_REQUEST_DELAY - timeSinceLast) / 1000) };
    }

    return { allowed: true };
};

export const fetchCoinGecko = async (endpoint: string, params: Record<string, string>, signal?: AbortSignal) => {
    const url = new URL(API_CONFIG.BASE_URL, window.location.origin);

    url.searchParams.append('path', endpoint);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const requestKey = url.toString();

    const pending = pendingRequests.get(requestKey);
    if (pending) {
        return pending;
    }

    const requestPromise = (async () => {
        try {
            globalRequestQueue.push(Date.now());

            const response = await fetch(requestKey, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal
            });

            if (response.status === 429) {
                throw new Error("RATE_LIMIT");
            }

            if (!response.ok) {
                throw new Error(`HTTP_ERROR_${response.status}`);
            }

            const data = await response.json();
            return data;
        } finally {
  
            pendingRequests.delete(requestKey);
        }
    })();

    pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
};

export const apiGuards = {
    canMakeRequest,
    fetchCoinGecko,
    clearPendingRequests: () => pendingRequests.clear()
};