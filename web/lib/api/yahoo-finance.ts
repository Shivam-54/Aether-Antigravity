/**
 * Yahoo Finance API Utility Functions
 * Uses yahoo-finance2 for real-time stock prices
 * Supports global stocks including Indian BSE/NSE
 */

import yahooFinance from 'yahoo-finance2';

/**
 * Convert BSE/NSE symbol formats
 * BHARATRAS.BSE -> BHARATRAS.BO (Yahoo format for BSE)
 * RELIANCE.NSE -> RELIANCE.NS (Yahoo format for NSE)
 */
export function convertToYahooSymbol(symbol: string): string {
    if (symbol.endsWith('.BSE')) {
        return symbol.replace('.BSE', '.BO');
    }
    if (symbol.endsWith('.NSE')) {
        return symbol.replace('.NSE', '.NS');
    }
    return symbol; // US stocks don't need conversion
}

/**
 * Get current stock price from Yahoo Finance
 * @param symbol - Stock symbol (e.g., "BHARATRAS.BSE", "AAPL")
 * @returns Current price or null if not found
 */
export async function getYahooPrice(symbol: string): Promise<number | null> {
    try {
        const yahooSymbol = convertToYahooSymbol(symbol);

        const quote = await yahooFinance.quote(yahooSymbol) as any;

        if (quote && quote.regularMarketPrice) {
            return quote.regularMarketPrice;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return null;
    }
}

/**
 * Get prices for multiple stocks in batch
 * @param symbols - Array of stock symbols
 * @returns Map of symbol to price
 */
export async function getYahooPricesBatch(
    symbols: string[]
): Promise<Record<string, number>> {
    const priceMap: Record<string, number> = {};

    // Process in parallel for better performance
    const results = await Promise.allSettled(
        symbols.map(async (symbol) => {
            const price = await getYahooPrice(symbol);
            return { symbol, price };
        })
    );

    results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.price !== null) {
            priceMap[result.value.symbol] = result.value.price;
        }
    });

    return priceMap;
}
