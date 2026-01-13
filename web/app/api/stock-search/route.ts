import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Initialize yahoo-finance2
const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        console.log('[Stock Search] Query:', query);

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Search using yahoo-finance2
        const searchResults: any = await yahooFinance.search(query.trim());

        console.log('[Stock Search] Results count:', searchResults?.quotes?.length || 0);

        if (!searchResults || !searchResults.quotes || searchResults.quotes.length === 0) {
            console.log('[Stock Search] No quotes found');
            return NextResponse.json({ results: [] });
        }

        // Convert Yahoo symbol format back to our format
        const convertFromYahooSymbol = (symbol: string): string => {
            if (!symbol) return '';
            if (symbol.endsWith('.BO')) return symbol.replace('.BO', '.BSE');
            if (symbol.endsWith('.NS')) return symbol.replace('.NS', '.NSE');
            return symbol;
        };

        // Filter and map results
        const stocks = searchResults.quotes
            .filter((quote: any) => {
                // Only include stocks and ETFs
                return quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF';
            })
            .map((quote: any) => ({
                symbol: convertFromYahooSymbol(quote.symbol || ''),
                name: quote.longname || quote.shortname || quote.symbol || 'Unknown',
                exchange: quote.exchDisp || quote.exchange || 'Unknown',
                type: quote.quoteType || 'EQUITY'
            }))
            .filter((stock: any) => stock.symbol) // Remove empty symbols
            .slice(0, 10);

        console.log(`[Stock Search] Returning ${stocks.length} stocks`);

        return NextResponse.json({ results: stocks });
    } catch (error: any) {
        console.error('[Stock Search] Error:', error.message);

        return NextResponse.json({
            results: [],
            error: error.message || 'Search failed'
        }, { status: 500 });
    }
}
