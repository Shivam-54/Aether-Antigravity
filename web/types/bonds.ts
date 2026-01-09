export type BondStatus = 'Active' | 'Matured' | 'Called';
export type BondType = 'Government' | 'Agency' | 'Municipal' | 'Corporate' | 'International';

export interface Bond {
    id: string;
    ticker: string;
    description: string; // e.g. "US Treasury Note 3.5%"
    issuer: string;
    faceValue: number; // Principal amount
    couponRate: number; // Annual interest rate in %
    maturityDate: string; // ISO date string
    purchaseDate: string; // ISO date string
    type: BondType;
    status: BondStatus;
    yieldToMaturity: number; // YTM in %
    currentPrice: number; // Market price (often per 100 face value, or raw value depending on convention. Here we use raw value for simplicity)
    currency: 'INR';
}

export interface BondMetric {
    month: string;
    income: number;
    yield: number;
}
