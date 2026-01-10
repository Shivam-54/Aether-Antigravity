// Bond Master (Shared Catalog)
export interface BondMaster {
    id: string;
    issuer_name: string;
    issuer_type: 'government' | 'treasury' | 'municipal' | 'corporate' | 'agency' | 'sgb' |
    'sovereign' | 'convertible' | 'zero-coupon' | 'floating-rate' |
    'inflation-linked' | 'high-yield' | 'green' | 'perpetual' | 'other';
    bond_name: string;
    bond_series: string | null;
    coupon_rate: number | null;
    coupon_type: 'fixed' | 'floating' | 'zero' | null;
    face_value: number | null;
    maturity_date: string | null; // ISO date string
    currency: string | null;
    country: string | null;
    rating: string | null;
    created_at: string;
}

// User Bond Holdings
export interface UserBond {
    id: string;
    user_id: string;
    bond_id: string;
    quantity: number;
    purchase_price: number | null;
    purchase_date: string | null; // ISO date string
    current_value: number | null;
    status: 'active' | 'matured' | 'sold' | null;
    created_at: string;
}

// Combined type for displaying user bonds with master data
export interface UserBondWithDetails extends UserBond {
    bond_master: BondMaster;
}

// Legacy Bond type (keeping for backward compatibility during migration)
export type BondType =
    | 'Government'
    | 'Treasury'
    | 'Municipal'
    | 'Corporate'
    | 'Agency'
    | 'Sovereign'
    | 'Convertible'
    | 'Zero-Coupon'
    | 'Floating Rate'
    | 'Inflation-Linked'
    | 'High-Yield'
    | 'Green'
    | 'Perpetual'
    | 'Other';

export type BondStatus = 'Active' | 'Matured' | 'Called' | 'Sold';

export interface Bond {
    id: string;
    ticker: string;
    description: string;
    issuer: string;
    faceValue: number;
    couponRate: number;
    maturityDate: string;
    purchaseDate: string;
    type: BondType;
    status: BondStatus;
    yieldToMaturity?: number;
    currentPrice?: number;
    currency: string;
}

export interface BondMetric {
    month: string;
    income: number;
    yield: number;
}
