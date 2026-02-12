import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function cryptoProxyHandler(
    req: VercelRequest,
    res: VercelResponse
) {
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

    try {
        const response = await fetch(COINGECKO_URL.toString(), {
            headers: { 'Accept': 'application/json' },
        });

        const data = await response.json();

        return res.status(response.status).json(data);
    } catch (err) {
        console.error('Proxy internal error:', err);
        return res.status(500).json({ error: 'Proxy failed to reach CoinGecko' });
    }
}