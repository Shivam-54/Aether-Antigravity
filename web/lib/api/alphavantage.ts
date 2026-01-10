/**
 * AlphaVantage API Utility Functions
 */

import type {
    SymbolSearchResponse,
    CompanySearchResult,
    CompanyOverview,
    GlobalQuoteResponse,
} from '@/types/alphavantage';

const API_KEY = process.env.NEXT_PUBLIC_ALPHAVANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Search for companies by keywords (symbol or name)
 * Uses the SYMBOL_SEARCH function
 */
export async function searchCompanies(
    keywords: string
): Promise<CompanySearchResult[]> {
    if (!API_KEY) {
        throw new Error('AlphaVantage API key is not configured');
    }

    if (!keywords.trim()) {
        return [];
    }

    try {
        const url = new URL(BASE_URL);
        url.searchParams.append('function', 'SYMBOL_SEARCH');
        url.searchParams.append('keywords', keywords);
        url.searchParams.append('apikey', API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data: SymbolSearchResponse = await response.json();

        // Check for API error messages
        if ('Note' in data) {
            throw new Error('API rate limit reached. Please try again later.');
        }

        if ('Error Message' in data) {
            throw new Error('Invalid API request');
        }

        // Normalize the response data
        const results: CompanySearchResult[] = (data.bestMatches || []).map(
            (match) => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                currency: match['8. currency'],
                matchScore: parseFloat(match['9. matchScore']),
            })
        );

        return results;
    } catch (error) {
        console.error('Error searching companies:', error);
        throw error;
    }
}

/**
 * Get detailed company overview including sector information
 * Uses the OVERVIEW function
 */
export async function getCompanyOverview(
    symbol: string
): Promise<CompanyOverview | null> {
    if (!API_KEY) {
        throw new Error('AlphaVantage API key is not configured');
    }

    if (!symbol.trim()) {
        return null;
    }

    try {
        const url = new URL(BASE_URL);
        url.searchParams.append('function', 'OVERVIEW');
        url.searchParams.append('symbol', symbol);
        url.searchParams.append('apikey', API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data: CompanyOverview = await response.json();

        // Check for API error messages
        if ('Note' in data) {
            throw new Error('API rate limit reached. Please try again later.');
        }

        if ('Error Message' in data || !data.Symbol) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching company overview:', error);
        throw error;
    }
}

/**
 * Get current stock price
 * Uses the GLOBAL_QUOTE function
 */
export async function getCurrentPrice(
    symbol: string
): Promise<number | null> {
    if (!API_KEY) {
        throw new Error('AlphaVantage API key is not configured');
    }

    if (!symbol.trim()) {
        return null;
    }

    try {
        const url = new URL(BASE_URL);
        url.searchParams.append('function', 'GLOBAL_QUOTE');
        url.searchParams.append('symbol', symbol);
        url.searchParams.append('apikey', API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data: GlobalQuoteResponse = await response.json();

        // Check for API error messages
        if ('Note' in data) {
            throw new Error('API rate limit reached. Please try again later.');
        }

        if ('Error Message' in data || !data['Global Quote']) {
            return null;
        }

        const price = parseFloat(data['Global Quote']['05. price']);
        return isNaN(price) ? null : price;
    } catch (error) {
        console.error('Error fetching current price:', error);
        throw error;
    }
}
