import { Bond, BondMetric } from '@/types/bonds';

export const mockBonds: Bond[] = [
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
    {
        id: 'bond-muni-001',
        ticker: 'BMC-2028',
        description: 'BMC Municipal Bond 6.9%',
        issuer: 'Brihanmumbai Municipal Corp',
        faceValue: 1000000,
        couponRate: 6.9,
        maturityDate: '2028-03-31',
        purchaseDate: '2023-08-10',
        type: 'Municipal',
        status: 'Active',
        yieldToMaturity: 6.85,
        currentPrice: 1010000,
        currency: 'INR'
    },
    {
        id: 'bond-agc-001',
        ticker: 'PFC-2032',
        description: 'PFC Tax Free Bond 7.5%',
        issuer: 'Power Finance Corporation',
        faceValue: 1500000,
        couponRate: 7.5,
        maturityDate: '2032-09-15',
        purchaseDate: '2022-12-05',
        type: 'Agency',
        status: 'Active',
        yieldToMaturity: 7.4,
        currentPrice: 1540000,
        currency: 'INR'
    },
    {
        id: 'bond-corp-002',
        ticker: 'HDFC-2025',
        description: 'HDFC Bank Tier II 8.1%',
        issuer: 'HDFC Bank',
        faceValue: 2000000,
        couponRate: 8.1,
        maturityDate: '2025-10-25',
        purchaseDate: '2021-11-10',
        type: 'Corporate',
        status: 'Active',
        yieldToMaturity: 7.9,
        currentPrice: 2050000,
        currency: 'INR'
    },
    {
        id: 'bond-gov-002',
        ticker: 'SGB-2028',
        description: 'Sovereign Gold Bond 2.5%',
        issuer: 'RBI',
        faceValue: 500000,
        couponRate: 2.5,
        maturityDate: '2028-06-15',
        purchaseDate: '2020-06-15',
        type: 'Government',
        status: 'Active',
        yieldToMaturity: 2.5,
        currentPrice: 750000, // Appreciated due to gold price underlying
        currency: 'INR'
    },
    {
        id: 'bond-intl-001',
        ticker: 'UST-2029',
        description: 'US Treasury 4.5% 2029',
        issuer: 'US Department of Treasury',
        faceValue: 8200000, // ~$100,000 equivalent
        couponRate: 4.5,
        maturityDate: '2029-05-15',
        purchaseDate: '2023-03-20',
        type: 'International',
        status: 'Active',
        yieldToMaturity: 4.35,
        currentPrice: 8450000,
        currency: 'INR'
    },
    {
        id: 'bond-intl-002',
        ticker: 'SGS-2031',
        description: 'Singapore Government Bond 3.8%',
        issuer: 'Government of Singapore',
        faceValue: 6150000, // ~$100,000 SGD equivalent
        couponRate: 3.8,
        maturityDate: '2031-07-01',
        purchaseDate: '2023-07-15',
        type: 'International',
        status: 'Active',
        yieldToMaturity: 3.75,
        currentPrice: 6280000,
        currency: 'INR'
    },
    {
        id: 'bond-intl-003',
        ticker: 'UKG-2033',
        description: 'UK Gilt 4.25% 2033',
        issuer: 'UK Debt Management Office',
        faceValue: 10250000, // ~£100,000 equivalent
        couponRate: 4.25,
        maturityDate: '2033-12-07',
        purchaseDate: '2022-09-10',
        type: 'International',
        status: 'Active',
        yieldToMaturity: 4.15,
        currentPrice: 10520000,
        currency: 'INR'
    }
];

export const mockBondMetrics: BondMetric[] = [
    { month: 'Jan', income: 45000, yield: 7.2 },
    { month: 'Feb', income: 48000, yield: 7.25 },
    { month: 'Mar', income: 52000, yield: 7.3 },
    { month: 'Apr', income: 50000, yield: 7.28 },
    { month: 'May', income: 55000, yield: 7.35 },
    { month: 'Jun', income: 58000, yield: 7.4 },
    { month: 'Jul', income: 56000, yield: 7.38 },
    { month: 'Aug', income: 60000, yield: 7.42 },
    { month: 'Sep', income: 62000, yield: 7.45 },
    { month: 'Oct', income: 65000, yield: 7.5 },
    { month: 'Nov', income: 63000, yield: 7.48 },
    { month: 'Dec', income: 68000, yield: 7.55 },
];
