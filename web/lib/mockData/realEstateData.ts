import { Property, RealEstateTransaction, PropertyDocument, AIInsight, PortfolioPerformance, PropertyStatus } from '@/types/realestate';

// Mock Properties
export const mockProperties: Property[] = [
    {
        id: '1',
        name: 'Sunset Villa',
        location: 'Mumbai, Maharashtra',
        streetAddress: '23/B, Malabar Hill Road, Walkeshwar',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400006',
        latitude: 18.9541,
        longitude: 72.7933,
        propertyType: 'Residential',
        purchaseValue: 12500000,
        currentValue: 18500000,
        appreciation: 48.0,
        equity: 15000000,
        outstandingMortgage: 3500000,
        loanToValue: 18.9,
        landArea: 3500,
        landUnit: 'sq ft',
        bedrooms: 4,
        bathrooms: 3,
        acquisitionDate: '2019-03-15',
        ownershipStructure: 'Individual',
        holdingDuration: '4 years 10 months',
        status: PropertyStatus.Rented,
        rentalInfo: {
            rentType: 'Monthly',
            rentAmount: 75000,
            startDate: '2024-01-01',
            tenantType: 'Individual',
            securityDeposit: 150000
        }
    },
    {
        id: '2',
        name: 'Tech Park Office',
        location: 'Bangalore, Karnataka',
        streetAddress: 'Tower B, 4th Floor, Electronic City Phase 1',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560100',
        latitude: 12.8456,
        longitude: 77.6603,
        propertyType: 'Commercial',
        purchaseValue: 45000000,
        currentValue: 62000000,
        appreciation: 37.8,
        equity: 62000000,
        outstandingMortgage: 0,
        loanToValue: 0,
        landArea: 8500,
        landUnit: 'sq ft',
        acquisitionDate: '2017-08-20',
        ownershipStructure: 'Entity',
        holdingDuration: '6 years 5 months',
        status: PropertyStatus.Owned
    },
    {
        id: '3',
        name: 'Coastal Land Plot',
        location: 'Goa',
        streetAddress: 'Survey No. 158/2, Candolim Beach Road, Bardez',
        city: 'Candolim',
        state: 'Goa',
        zipCode: '403515',
        latitude: 15.5180,
        longitude: 73.7622,
        propertyType: 'Land',
        purchaseValue: 8000000,
        currentValue: 15000000,
        appreciation: 87.5,
        equity: 15000000,
        outstandingMortgage: 0,
        loanToValue: 0,
        landArea: 2.5,
        landUnit: 'acre',
        acquisitionDate: '2015-12-10',
        ownershipStructure: 'Joint',
        holdingDuration: '8 years 1 month',
        status: PropertyStatus.Owned
    },
    {
        id: '4',
        name: 'Green Meadows Apartment',
        location: 'Pune, Maharashtra',
        streetAddress: 'Flat 302, Green Meadows Society, Baner Road',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411045',
        latitude: 18.5590,
        longitude: 73.7814,
        propertyType: 'Residential',
        purchaseValue: 7500000,
        currentValue: 9800000,
        appreciation: 30.7,
        equity: 7300000,
        outstandingMortgage: 2500000,
        loanToValue: 25.5,
        landArea: 1850,
        landUnit: 'sq ft',
        bedrooms: 3,
        bathrooms: 2,
        acquisitionDate: '2020-06-01',
        ownershipStructure: 'Individual',
        holdingDuration: '3 years 7 months',
        status: PropertyStatus.Owned
    }
];

// Mock Transactions
export const mockTransactions: RealEstateTransaction[] = [
    {
        id: '1',
        propertyId: '1',
        propertyName: 'Sunset Villa',
        type: 'Buy',
        value: 12500000,
        paymentMethod: 'Mixed',
        date: '2019-03-15',
        holdingDuration: '4 years 10 months'
    },
    {
        id: '2',
        propertyId: '2',
        propertyName: 'Tech Park Office',
        type: 'Buy',
        value: 45000000,
        paymentMethod: 'Cash',
        date: '2017-08-20',
        holdingDuration: '6 years 5 months'
    },
    {
        id: '3',
        propertyId: '3',
        propertyName: 'Coastal Land Plot',
        type: 'Buy',
        value: 8000000,
        paymentMethod: 'Cash',
        date: '2015-12-10',
        holdingDuration: '8 years 1 month'
    },
    {
        id: '4',
        propertyId: '4',
        propertyName: 'Green Meadows Apartment',
        type: 'Buy',
        value: 7500000,
        paymentMethod: 'Loan',
        date: '2020-06-01',
        holdingDuration: '3 years 7 months'
    },
    {
        id: '5',
        propertyId: '1',
        propertyName: 'Sunset Villa',
        type: 'Rent',
        value: 75000,
        paymentMethod: 'Cash',
        date: '2024-01-01'
    },
    {
        id: '6',
        propertyId: '2',
        propertyName: 'Tech Park Office',
        type: 'Rent',
        value: 350000,
        paymentMethod: 'Cash',
        date: '2024-01-01'
    }
];

// Mock Documents
export const mockDocuments: PropertyDocument[] = [
    {
        id: '1',
        propertyId: '1',
        propertyName: 'Sunset Villa',
        type: 'Ownership Certificate',
        issuedDate: '2019-03-20',
        status: 'active'
    },
    {
        id: '2',
        propertyId: '1',
        propertyName: 'Sunset Villa',
        type: 'Mortgage Agreement',
        issuedDate: '2019-03-15',
        status: 'active'
    },
    {
        id: '3',
        propertyId: '1',
        propertyName: 'Sunset Villa',
        type: 'Insurance',
        issuedDate: '2024-01-01',
        status: 'active'
    },
    {
        id: '4',
        propertyId: '2',
        propertyName: 'Tech Park Office',
        type: 'Ownership Certificate',
        issuedDate: '2017-08-25',
        status: 'active'
    },
    {
        id: '5',
        propertyId: '2',
        propertyName: 'Tech Park Office',
        type: 'Sale Deed',
        issuedDate: '2017-08-20',
        status: 'active'
    },
    {
        id: '6',
        propertyId: '2',
        propertyName: 'Tech Park Office',
        type: 'Tax Record',
        issuedDate: '2024-04-01',
        status: 'active'
    },
    {
        id: '7',
        propertyId: '3',
        propertyName: 'Coastal Land Plot',
        type: 'Ownership Certificate',
        issuedDate: '2015-12-15',
        status: 'active'
    },
    {
        id: '8',
        propertyId: '4',
        propertyName: 'Green Meadows Apartment',
        type: 'Ownership Certificate',
        issuedDate: '2020-06-05',
        status: 'active'
    },
    {
        id: '9',
        propertyId: '4',
        propertyName: 'Green Meadows Apartment',
        type: 'Mortgage Agreement',
        issuedDate: '2020-06-01',
        status: 'active'
    }
];

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
    {
        id: '1',
        message: 'Coastal Land Plot has appreciated 87.5% since acquisition. Consider partial liquidation to rebalance portfolio risk.',
        impact: 'High',
        confidence: 87,
        category: 'opportunity',
        propertyId: '3'
    },
    {
        id: '2',
        message: 'Tech Park Office generates strong rental yield (0.67% monthly). Commercial real estate exposure is well-positioned.',
        impact: 'Medium',
        confidence: 92,
        category: 'optimization'
    },
    {
        id: '3',
        message: 'Sunset Villa mortgage LTV is low (18.9%). Refinancing could unlock capital for new opportunities.',
        impact: 'Medium',
        confidence: 78,
        category: 'optimization',
        propertyId: '1'
    },
    {
        id: '4',
        message: 'Your real estate portfolio is concentrated in Maharashtra (50%). Consider geographic diversification.',
        impact: 'Low',
        confidence: 85,
        category: 'risk'
    },
    {
        id: '5',
        message: 'Green Meadows Apartment appreciation (30.7%) is below portfolio average. Monitor market trends in Pune.',
        impact: 'Low',
        confidence: 73,
        category: 'risk',
        propertyId: '4'
    }
];

// Mock Portfolio Performance (12 months)
export const mockPerformanceData: PortfolioPerformance[] = [
    { month: 'Jan 2024', value: 97000000 },
    { month: 'Feb 2024', value: 98500000 },
    { month: 'Mar 2024', value: 99200000 },
    { month: 'Apr 2024', value: 100100000 },
    { month: 'May 2024', value: 101000000 },
    { month: 'Jun 2024', value: 101800000 },
    { month: 'Jul 2024', value: 102500000 },
    { month: 'Aug 2024', value: 103200000 },
    { month: 'Sep 2024', value: 103800000 },
    { month: 'Oct 2024', value: 104500000 },
    { month: 'Nov 2024', value: 105000000 },
    { month: 'Dec 2024', value: 105300000 }
];
