const globalRequestQueue: number[] = [];
const RATE_LIMIT_MAX_REQUESTS = 8;
const RATE_LIMIT_WINDOW = 60000;
const MIN_DELAY = 2000; 

const canMakeRequest = (lastFetchedTime: number): { allowed: boolean; waitTime?: number } => {
    const now = Date.now();
    while (globalRequestQueue.length > 0 && now - globalRequestQueue[0] > RATE_LIMIT_WINDOW) {
        globalRequestQueue.shift();
    }

    if (globalRequestQueue.length >= RATE_LIMIT_MAX_REQUESTS) {
        const oldestRequest = globalRequestQueue[0];
        const waitTime = Math.ceil((RATE_LIMIT_WINDOW - (now - oldestRequest)) / 1000);
        return { allowed: false, waitTime };
    }

    const timeSinceLast = now - lastFetchedTime;
    if (lastFetchedTime > 0 && timeSinceLast < MIN_DELAY) {
        return { allowed: false, waitTime: Math.ceil((MIN_DELAY - timeSinceLast) / 1000) };
    }

    return { allowed: true };
};

export const fetchCoinGecko = async (endpoint: string, params: Record<string, string>, signal?: AbortSignal) => {
    const url = new URL(`https://api.coingecko.com/api/v3/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

    globalRequestQueue.push(Date.now());

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal
    });

    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (!response.ok) throw new Error(`HTTP_ERROR_${response.status}`);

    return response.json();
};

export const apiGuards = { canMakeRequest };