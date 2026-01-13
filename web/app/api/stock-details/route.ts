import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// Initialize yahoo-finance2
const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbol = searchParams.get('symbol');

        if (!symbol) {
            return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        // Convert to Yahoo Finance format
        const convertToYahooSymbol = (sym: string): string => {
            if (sym.endsWith('.BSE')) {
                return sym.replace('.BSE', '.BO');
            }
            if (sym.endsWith('.NSE')) {
                return sym.replace('.NSE', '.NS');
            }
            return sym;
        };

        const yahooSymbol = convertToYahooSymbol(symbol);

        // Get price
        const quote: any = await yahooFinance.quote(yahooSymbol);

        const response: any = {};

        // Extract price
        if (quote && quote.regularMarketPrice) {
            response.price = quote.regularMarketPrice;
        }

        // Try to get sector from quoteSummary
        try {
            const summary: any = await yahooFinance.quoteSummary(yahooSymbol, {
                modules: ['assetProfile']
            });

            if (summary?.assetProfile?.sector) {
                response.sector = summary.assetProfile.sector;
            }
            if (summary?.assetProfile?.industry) {
                response.industry = summary.assetProfile.industry;
            }
        } catch (err) {
            // Sector fetch is optional
            console.log('[Stock Details] Could not fetch sector:', err);
        }

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[Stock Details] Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch stock details' }, { status: 500 });
    }
}
