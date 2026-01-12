import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

/**
 * Convert BSE/NSE symbol formats
 */
function convertToYahooSymbol(symbol: string): string {
    if (symbol.endsWith('.BSE')) {
        return symbol.replace('.BSE', '.BO');
    }
    if (symbol.endsWith('.NSE')) {
        return symbol.replace('.NSE', '.NS');
    }
    return symbol;
}

export async function POST(request: NextRequest) {
    try {
        const { symbols } = await request.json();

        if (!Array.isArray(symbols) || symbols.length === 0) {
            return NextResponse.json(
                { error: 'Invalid symbols array' },
                { status: 400 }
            );
        }

        const priceMap: Record<string, number> = {};

        // Fetch prices for all symbols in parallel
        const results = await Promise.allSettled(
            symbols.map(async (symbol: string) => {
                try {
                    const yahooSymbol = convertToYahooSymbol(symbol);

                    // Use quoteSummary to get price data
                    const result = await yahooFinance.quoteSummary(yahooSymbol, {
                        modules: ['price']
                    }) as any;

                    const price = result?.price?.regularMarketPrice;
                    if (price && typeof price === 'number') {
                        return { symbol, price };
                    }
                    return { symbol, price: null };
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                    return { symbol, price: null };
                }
            })
        );

        // Build price map from results
        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.price !== null) {
                priceMap[result.value.symbol] = result.value.price;
            }
        });

        return NextResponse.json({ prices: priceMap });
    } catch (error) {
        console.error('Error in stock prices API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        );
    }
}
