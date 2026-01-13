// CoinCap API Integration
// Documentation: https://docs.coincap.io/

const COINCAP_API_BASE = 'https://api.coincap.io/v2';
const COINCAP_API_KEY = process.env.NEXT_PUBLIC_COINCAP_API_KEY;

export interface CoinCapAsset {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string | null;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
}

export interface CryptoSearchResult {
    id: string;
    name: string;
    symbol: string;
    priceUsd: number;
    priceInr: number;
    changePercent24Hr: number;
    rank: number;
}

/**
 * Convert USD to INR
 * Using approximate rate - could be enhanced with live forex rates
 */
const USD_TO_INR_RATE = 83.12;

function usdToInr(usd: number): number {
    return usd * USD_TO_INR_RATE;
}

/**
 * Search cryptocurrencies by name or symbol
 */
export async function searchCrypto(query: string): Promise<CryptoSearchResult[]> {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const headers: HeadersInit = {};
        if (COINCAP_API_KEY) {
            headers['Authorization'] = `Bearer ${COINCAP_API_KEY}`;
        }

        const response = await fetch(`${COINCAP_API_BASE}/assets?limit=100`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`CoinCap API error: ${response.status}`);
        }

        const data = await response.json();
        const assets: CoinCapAsset[] = data.data;

        // Filter by query (name or symbol)
        const normalizedQuery = query.toLowerCase();
        const filtered = assets.filter((asset) => {
            const name = asset.name.toLowerCase();
            const symbol = asset.symbol.toLowerCase();
            return name.includes(normalizedQuery) || symbol.includes(normalizedQuery);
        });

        // Take top 10 results
        return filtered.slice(0, 10).map((asset) => ({
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol,
            priceUsd: parseFloat(asset.priceUsd),
            priceInr: usdToInr(parseFloat(asset.priceUsd)),
            changePercent24Hr: parseFloat(asset.changePercent24Hr),
            rank: parseInt(asset.rank),
        }));
    } catch (error) {
        console.error('Error searching crypto:', error);
        throw error;
    }
}

/**
 * Get current price for a specific cryptocurrency by ID
 */
export async function getCryptoPrice(coinId: string): Promise<{ priceUsd: number; priceInr: number }> {
    try {
        const headers: HeadersInit = {};
        if (COINCAP_API_KEY) {
            headers['Authorization'] = `Bearer ${COINCAP_API_KEY}`;
        }

        const response = await fetch(`${COINCAP_API_BASE}/assets/${coinId}`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`CoinCap API error: ${response.status}`);
        }

        const data = await response.json();
        const asset: CoinCapAsset = data.data;
        const priceUsd = parseFloat(asset.priceUsd);

        return {
            priceUsd,
            priceInr: usdToInr(priceUsd),
        };
    } catch (error) {
        console.error('Error fetching crypto price:', error);
        throw error;
    }
}

/**
 * Get detailed information for a cryptocurrency
 */
export async function getCryptoDetails(coinId: string): Promise<CryptoSearchResult> {
    try {
        const headers: HeadersInit = {};
        if (COINCAP_API_KEY) {
            headers['Authorization'] = `Bearer ${COINCAP_API_KEY}`;
        }

        const response = await fetch(`${COINCAP_API_BASE}/assets/${coinId}`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`CoinCap API error: ${response.status}`);
        }

        const data = await response.json();
        const asset: CoinCapAsset = data.data;

        return {
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol,
            priceUsd: parseFloat(asset.priceUsd),
            priceInr: usdToInr(parseFloat(asset.priceUsd)),
            changePercent24Hr: parseFloat(asset.changePercent24Hr),
            rank: parseInt(asset.rank),
        };
    } catch (error) {
        console.error('Error fetching crypto details:', error);
        throw error;
    }
}

/**
 * Get top cryptocurrencies by market cap
 */
export async function getTopCryptos(limit: number = 20): Promise<CryptoSearchResult[]> {
    try {
        const headers: HeadersInit = {};
        if (COINCAP_API_KEY) {
            headers['Authorization'] = `Bearer ${COINCAP_API_KEY}`;
        }

        const response = await fetch(`${COINCAP_API_BASE}/assets?limit=${limit}`, {
            headers,
        });

        if (!response.ok) {
            throw new Error(`CoinCap API error: ${response.status}`);
        }

        const data = await response.json();
        const assets: CoinCapAsset[] = data.data;

        return assets.map((asset) => ({
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol,
            priceUsd: parseFloat(asset.priceUsd),
            priceInr: usdToInr(parseFloat(asset.priceUsd)),
            changePercent24Hr: parseFloat(asset.changePercent24Hr),
            rank: parseInt(asset.rank),
        }));
    } catch (error) {
        console.error('Error fetching top cryptos:', error);
        throw error;
    }
}
