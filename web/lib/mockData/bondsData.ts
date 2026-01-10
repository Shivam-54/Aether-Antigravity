import { Bond, BondMetric } from '@/types/bonds';

export const mockBonds: Bond[] = [
    // 1. Government Bond
    {
        id: 'bond-gov-001',
        ticker: 'GOI-2030',
        description: 'Government of India 7.26% 2030',
        issuer: 'Government of India',
        faceValue: 5000000,
        couponRate: 7.26,
        maturityDate: '2030-08-22',
        purchaseDate: '2023-01-15',
        type: 'Government',
        status: 'Active',
        yieldToMaturity: 7.15,
        currentPrice: 5120000,
        currency: 'INR'
    },
    // 2. Treasury Bond
    {
        id: 'bond-trs-001',
        ticker: 'T-Bond-2032',
        description: 'Indian Treasury Bond 6.8% 2032',
        issuer: 'Reserve Bank of India',
        faceValue: 3000000,
        couponRate: 6.8,
        maturityDate: '2032-05-15',
        purchaseDate: '2023-06-10',
        type: 'Treasury',
        status: 'Active',
        yieldToMaturity: 6.75,
        currentPrice: 3050000,
        currency: 'INR'
    },
    // 3. Municipal Bond
    {
        id: 'bond-muni-001',
        ticker: 'BMC-2028',
        description: 'Mumbai Municipal Bond 6.5%',
        issuer: 'Brihanmumbai Municipal Corp',
        faceValue: 1000000,
        couponRate: 6.5,
        maturityDate: '2028-03-31',
        purchaseDate: '2023-08-10',
        type: 'Municipal',
        status: 'Active',
        yieldToMaturity: 6.45,
        currentPrice: 1010000,
        currency: 'INR'
    },
    // 4. Corporate Bond
    {
        id: 'bond-corp-001',
        ticker: 'RIL-2027',
        description: 'Reliance Industries 8.5% 2027',
        issuer: 'Reliance Industries Ltd',
        faceValue: 2500000,
        couponRate: 8.5,
        maturityDate: '2027-11-15',
        purchaseDate: '2023-05-20',
        type: 'Corporate',
        status: 'Active',
        yieldToMaturity: 8.2,
        currentPrice: 2580000,
        currency: 'INR'
    },
    // 5. Agency Bond
    {
        id: 'bond-agc-001',
        ticker: 'NABARD-2031',
        description: 'NABARD Rural Bond 7.3% 2031',
        issuer: 'NABARD',
        faceValue: 1500000,
        couponRate: 7.3,
        maturityDate: '2031-09-15',
        purchaseDate: '2022-12-05',
        type: 'Agency',
        status: 'Active',
        yieldToMaturity: 7.25,
        currentPrice: 1520000,
        currency: 'INR'
    },
    // 6. Sovereign Bond
    {
        id: 'bond-sov-001',
        ticker: 'UST-2029',
        description: 'US Treasury Sovereign 4.5% 2029',
        issuer: 'US Department of Treasury',
        faceValue: 8200000,
        couponRate: 4.5,
        maturityDate: '2029-05-15',
        purchaseDate: '2023-03-20',
        type: 'Sovereign',
        status: 'Active',
        yieldToMaturity: 4.35,
        currentPrice: 8450000,
        currency: 'INR'
    },
    // 7. Convertible Bond
    {
        id: 'bond-conv-001',
        ticker: 'TCS-CV-2026',
        description: 'TCS Convertible 5.2% 2026',
        issuer: 'Tata Consultancy Services',
        faceValue: 2000000,
        couponRate: 5.2,
        maturityDate: '2026-12-31',
        purchaseDate: '2021-01-10',
        type: 'Convertible',
        status: 'Active',
        yieldToMaturity: 5.1,
        currentPrice: 2150000,
        currency: 'INR'
    },
    // 8. Zero-Coupon Bond
    {
        id: 'bond-zero-001',
        ticker: 'ZERO-2035',
        description: 'Zero Coupon Deep Discount 2035',
        issuer: 'State Bank of India',
        faceValue: 5000000,
        couponRate: 0,
        maturityDate: '2035-12-31',
        purchaseDate: '2023-01-01',
        type: 'Zero-Coupon',
        status: 'Active',
        yieldToMaturity: 7.8,
        currentPrice: 2800000, // Deep discount
        currency: 'INR'
    },
    // 9. Floating Rate Bond
    {
        id: 'bond-float-001',
        ticker: 'HDFC-FRN-2028',
        description: 'HDFC Floating Rate Note MIBOR+2%',
        issuer: 'HDFC Bank',
        faceValue: 1800000,
        couponRate: 8.5, // Current rate (MIBOR 6.5% + 2%)
        maturityDate: '2028-06-30',
        purchaseDate: '2023-07-01',
        type: 'Floating Rate',
        status: 'Active',
        yieldToMaturity: 8.4,
        currentPrice: 1820000,
        currency: 'INR'
    },
    // 10. Inflation-Linked Bond
    {
        id: 'bond-iib-001',
        ticker: 'IIB-2034',
        description: 'Inflation Indexed Bond 2.5% + CPI',
        issuer: 'Government of India',
        faceValue: 3500000,
        couponRate: 2.5,
        maturityDate: '2034-06-05',
        purchaseDate: '2022-06-05',
        type: 'Inflation-Linked',
        status: 'Active',
        yieldToMaturity: 6.8, // Real yield + expected inflation
        currentPrice: 3700000,
        currency: 'INR'
    },
    // 11. High-Yield Bond
    {
        id: 'bond-hy-001',
        ticker: 'VFL-2026',
        description: 'Videocon High Yield 12.5% 2026',
        issuer: 'Videocon Finance Ltd',
        faceValue: 1000000,
        couponRate: 12.5,
        maturityDate: '2026-03-15',
        purchaseDate: '2023-03-01',
        type: 'High-Yield',
        status: 'Active',
        yieldToMaturity: 13.2,
        currentPrice: 920000, // Trading at discount due to risk
        currency: 'INR'
    },
    // 12. Green Bond
    {
        id: 'bond-green-001',
        ticker: 'NTPC-GREEN-2030',
        description: 'NTPC Green Energy Bond 7.0% 2030',
        issuer: 'NTPC Limited',
        faceValue: 2200000,
        couponRate: 7.0,
        maturityDate: '2030-09-20',
        purchaseDate: '2023-09-20',
        type: 'Green',
        status: 'Active',
        yieldToMaturity: 6.95,
        currentPrice: 2230000,
        currency: 'INR'
    },
    // 13. Perpetual Bond
    {
        id: 'bond-perp-001',
        ticker: 'ICICI-AT1',
        description: 'ICICI Bank Perpetual Tier 1 Bond 9.5%',
        issuer: 'ICICI Bank',
        faceValue: 1500000,
        couponRate: 9.5,
        maturityDate: '2099-12-31', // Effectively perpetual
        purchaseDate: '2020-01-15',
        type: 'Perpetual',
        status: 'Active',
        yieldToMaturity: 9.3,
        currentPrice: 1550000,
        currency: 'INR'
    },
    // 14. Other - Sovereign Gold Bond
    {
        id: 'bond-other-001',
        ticker: 'SGB-2028',
        description: 'Sovereign Gold Bond Series IV 2.5%',
        issuer: 'Reserve Bank of India',
        faceValue: 500000,
        couponRate: 2.5,
        maturityDate: '2028-06-15',
        purchaseDate: '2020-06-15',
        type: 'Other',
        status: 'Active',
        yieldToMaturity: 2.5,
        currentPrice: 750000, // Appreciated due to gold price
        currency: 'INR'
    }
];

export const mockBondMetrics: BondMetric[] = [
    { month: 'Jan', income: 52000, yield: 7.2 },
    { month: 'Feb', income: 55000, yield: 7.25 },
    { month: 'Mar', income: 58000, yield: 7.3 },
    { month: 'Apr', income: 56000, yield: 7.28 },
    { month: 'May', income: 61000, yield: 7.35 },
    { month: 'Jun', income: 64000, yield: 7.4 },
    { month: 'Jul', income: 63000, yield: 7.38 },
    { month: 'Aug', income: 67000, yield: 7.42 },
    { month: 'Sep', income: 70000, yield: 7.45 },
    { month: 'Oct', income: 72000, yield: 7.5 },
    { month: 'Nov', income: 71000, yield: 7.48 },
    { month: 'Dec', income: 75000, yield: 7.55 },
];
