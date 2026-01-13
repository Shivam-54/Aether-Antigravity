/**
 * Yahoo Finance API Utility Functions
 * Uses yahoo-finance2 for real-time stock prices and search
 * Supports global stocks including Indian BSE/NSE
 * NO API KEY REQUIRED - NO RATE LIMITS
 */

import yahooFinance from 'yahoo-finance2';

export interface StockSearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

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
 * Convert Yahoo symbol back to our format
 * BHARATRAS.BO -> BHARATRAS.BSE
 * RELIANCE.NS -> RELIANCE.NSE
 */
export function convertFromYahooSymbol(symbol: string): string {
    if (symbol.endsWith('.BO')) {
        return symbol.replace('.BO', '.BSE');
    }
    if (symbol.endsWith('.NS')) {
        return symbol.replace('.NS', '.NSE');
    }
    return symbol;
}

/**
 * Search for stocks by query (symbol or company name)
 * @param query - Search term (e.g., "Reliance", "AAPL", "Tata")
 * @returns Array of matching stocks
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const results = await yahooFinance.search(query.trim());

        if (!results || !results.quotes || results.quotes.length === 0) {
            return [];
        }

        // Filter and map results to our format
        const stocks: StockSearchResult[] = results.quotes
            .filter((quote: any) => {
                // Only include stocks and ETFs
                return quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF';
            })
            .map((quote: any) => ({
                symbol: convertFromYahooSymbol(quote.symbol),
                name: quote.longname || quote.shortname || quote.symbol,
                exchange: quote.exchDisp || quote.exchange || 'Unknown',
                type: quote.quoteType || 'EQUITY'
            }))
            .slice(0, 10); // Limit to top 10 results

        return stocks;
    } catch (error) {
        console.error('Error searching stocks:', error);
        return [];
    }
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

/**
 * Get company details including sector
 * @param symbol - Stock symbol
 * @returns Company details with sector info
 */
export async function getCompanyDetails(symbol: string): Promise<{ sector?: string; industry?: string } | null> {
    try {
        const yahooSymbol = convertToYahooSymbol(symbol);

        const quote = await yahooFinance.quoteSummary(yahooSymbol, {
            modules: ['assetProfile', 'summaryProfile']
        }) as any;

        if (quote && (quote.assetProfile || quote.summaryProfile)) {
            return {
                sector: quote.assetProfile?.sector || quote.summaryProfile?.sector,
                industry: quote.assetProfile?.industry || quote.summaryProfile?.industry
            };
        }

        return null;
    } catch (error) {
        console.error(`Error fetching company details for ${symbol}:`, error);
        return null;
    }
}
