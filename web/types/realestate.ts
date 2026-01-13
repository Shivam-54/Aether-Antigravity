export type PropertyType = 'Residential' | 'Commercial' | 'Land';
export type OwnershipStructure = 'Individual' | 'Joint' | 'Entity';
export type TransactionType = 'Buy' | 'Sell' | 'Rent';
export type PaymentMethod = 'Cash' | 'Loan' | 'Mixed';
export type DocumentType = 'Ownership Certificate' | 'Sale Deed' | 'Mortgage Agreement' | 'Tax Record' | 'Insurance';
export type DocumentStatus = 'active' | 'archived';
export type ImpactLevel = 'Low' | 'Medium' | 'High';
export type InsightCategory = 'risk' | 'opportunity' | 'optimization';

// ==================== PROPERTY LIFECYCLE ====================

export enum PropertyStatus {
    Owned = 'owned',
    Rented = 'rented',
    Sold = 'sold'
}

export interface RentalInfo {
    rentType: 'Monthly' | 'Yearly';
    rentAmount: number;
    startDate: string;
    tenantType?: 'Individual' | 'Company';
    securityDeposit?: number;
    endDate?: string;
}

export interface SaleInfo {
    sellingPrice: number;
    saleDate: string;
    buyerType?: string;
    paymentMode: 'Cash' | 'Loan' | 'Mixed';
    capitalGain: number;
    appreciationPercent: number;
}

// ==================== PROPERTY ====================

export interface Property {
    id: string;
    name: string;
    location: string; // Legacy: city, state (kept for backward compatibility)

    // Full Address
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;

    // Geographic Coordinates
    latitude: number;
    longitude: number;

    propertyType: PropertyType;

    // Financial
    purchaseValue: number;
    currentValue: number;
    appreciation: number; // percentage
    equity: number;
    outstandingMortgage: number;
    loanToValue: number; // percentage

    // Specifications
    landArea: number;
    landUnit: 'acre' | 'sq ft';
    bedrooms?: number;
    bathrooms?: number;

    // Ownership
    acquisitionDate: string;
    ownershipStructure: OwnershipStructure;
    holdingDuration: string;

    // Lifecycle Management
    status: PropertyStatus;
    rentalInfo?: RentalInfo;
    saleInfo?: SaleInfo;
}

export interface RealEstateTransaction {
    id: string;
    propertyId: string;
    propertyName: string;
    type: TransactionType;
    value: number;
    paymentMethod: PaymentMethod;
    date: string;
    holdingDuration?: string;
    netGainLoss?: number;
}

export interface PropertyDocument {
    id: string;
    propertyId: string;
    propertyName: string;
    type: DocumentType;
    issuedDate: string;
    status: DocumentStatus;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
}

export interface AIInsight {
    id: string;
    message: string;
    impact: ImpactLevel;
    confidence: number; // 0-100
    category: InsightCategory;
    propertyId?: string;
}

export interface PortfolioPerformance {
    month: string;
    value: number;
}
