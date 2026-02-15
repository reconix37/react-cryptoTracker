import type { VercelRequest, VercelResponse } from '@vercel/node';

const CACHE_DURATION = 90 * 1000; 
const RATE_LIMIT_WINDOW = 60 * 1000; 
const MAX_REQUESTS_PER_IP = 50;

const cache = new Map<string, { data: any; timestamp: number }>();
const requestLog = new Map<string, number[]>();

function getRateLimitKey(req: VercelRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket?.remoteAddress || 'unknown';
    return ip;
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const requests = requestLog.get(key) || [];

    const recentRequests = requests.filter(ts => now - ts < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS_PER_IP) {
        return true;
    }

    recentRequests.push(now);
    requestLog.set(key, recentRequests);

    return false;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const rateLimitKey = getRateLimitKey(req);
    if (isRateLimited(rateLimitKey)) {
        return res.status(429).json({
            error: "Too many requests. Please slow down.",
            retryAfter: 60
        });
    }

    const { path, ...queryParams } = req.query;

    const targetPath = Array.isArray(path) ? path[0] : path;

    if (!targetPath) {
        return res.status(400).json({ error: "Path parameter is required" });
    }

    const COINGECKO_URL = new URL(`https://api.coingecko.com/api/v3/${targetPath}`);

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
            const val = Array.isArray(value) ? value[0] : String(value);
            COINGECKO_URL.searchParams.append(key, val);
        }
    });

    const cacheKey = COINGECKO_URL.toString();
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
        return res.status(200).json(cached.data);
    }

    try {
        const response = await fetch(COINGECKO_URL.toString(), {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CryptoApp/1.0'
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `CoinGecko API error: ${response.statusText}` 
            });
        }

        const data = await response.json();

        cache.set(cacheKey, { data, timestamp: now });

        if (cache.size > 100) {
            const oldestKey = cache.keys().next().value;
            if (oldestKey) {
                cache.delete(oldestKey);
            }
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ 
            error: 'Proxy failed to reach CoinGecko',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}