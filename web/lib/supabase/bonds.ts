import { createClient } from '@/lib/supabase/client';
import { BondMaster, UserBond, UserBondWithDetails } from '@/types/bonds';

/**
 * Fetch all bond types available in the catalog
 */
export async function fetchBondTypes(): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bond_master')
        .select('issuer_type')
        .order('issuer_type');

    if (error) {
        console.error('Error fetching bond types:', error);
        return [];
    }

    // Get unique issuer types
    const uniqueTypes = [...new Set(data.map(item => item.issuer_type))];
    return uniqueTypes;
}

/**
 * Fetch all issuers of a specific bond type
 */
export async function fetchIssuersByType(issuerType: string): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bond_master')
        .select('issuer_name')
        .eq('issuer_type', issuerType)
        .order('issuer_name');

    if (error) {
        console.error('Error fetching issuers:', error);
        return [];
    }

    // Get unique issuer names
    const uniqueIssuers = [...new Set(data.map(item => item.issuer_name))];
    return uniqueIssuers;
}

/**
 * Fetch all bonds from a specific issuer
 */
export async function fetchBondsByIssuer(issuerName: string): Promise<BondMaster[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bond_master')
        .select('*')
        .eq('issuer_name', issuerName)
        .order('maturity_date');

    if (error) {
        console.error('Error fetching bonds by issuer:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetch bonds by type (for filtering)
 */
export async function fetchBondsByType(issuerType: string): Promise<BondMaster[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bond_master')
        .select('*')
        .eq('issuer_type', issuerType)
        .order('issuer_name');

    if (error) {
        console.error('Error fetching bonds by type:', error);
        return [];
    }

    return data || [];
}

/**
 * Search bonds by name (for autocomplete)
 */
export async function searchBonds(query: string, issuerType?: string): Promise<BondMaster[]> {
    const supabase = createClient();

    let queryBuilder = supabase
        .from('bond_master')
        .select('*')
        .ilike('bond_name', `%${query}%`);

    if (issuerType) {
        queryBuilder = queryBuilder.eq('issuer_type', issuerType);
    }

    const { data, error } = await queryBuilder
        .order('bond_name')
        .limit(10);

    if (error) {
        console.error('Error searching bonds:', error);
        return [];
    }

    return data || [];
}

/**
 * Get a specific bond by ID
 */
export async function getBondById(bondId: string): Promise<BondMaster | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('bond_master')
        .select('*')
        .eq('id', bondId)
        .single();

    if (error) {
        console.error('Error fetching bond:', error);
        return null;
    }

    return data;
}

/**
 * Add a bond to user's portfolio
 */
export async function addUserBond(
    userId: string,
    bondId: string,
    quantity: number,
    purchasePrice?: number,
    purchaseDate?: string,
    currentValue?: number
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_bonds')
        .insert({
            user_id: userId,
            bond_id: bondId,
            quantity,
            purchase_price: purchasePrice,
            purchase_date: purchaseDate,
            current_value: currentValue,
            status: 'active'
        });

    if (error) {
        console.error('Error adding user bond:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Fetch all user bonds with bond master details
 */
export async function fetchUserBonds(userId: string): Promise<UserBondWithDetails[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_bonds')
        .select(`
            *,
            bond_master (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user bonds:', error);
        return [];
    }

    return data as UserBondWithDetails[] || [];
}

/**
 * Update a user bond
 */
export async function updateUserBond(
    bondId: string,
    updates: Partial<Omit<UserBond, 'id' | 'user_id' | 'bond_id' | 'created_at'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_bonds')
        .update(updates)
        .eq('id', bondId);

    if (error) {
        console.error('Error updating user bond:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a user bond
 */
export async function deleteUserBond(bondId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_bonds')
        .delete()
        .eq('id', bondId);

    if (error) {
        console.error('Error deleting user bond:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get user bonds grouped by issuer type (for allocation analysis)
 */
export async function getUserBondsByType(userId: string): Promise<Record<string, UserBondWithDetails[]>> {
    const bonds = await fetchUserBonds(userId);

    return bonds.reduce((acc, bond) => {
        const type = bond.bond_master.issuer_type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(bond);
        return acc;
    }, {} as Record<string, UserBondWithDetails[]>);
}

/**
 * Calculate total portfolio value
 */
export async function calculatePortfolioValue(userId: string): Promise<number> {
    const bonds = await fetchUserBonds(userId);

    return bonds.reduce((total, bond) => {
        const value = bond.current_value || (bond.quantity * (bond.bond_master.face_value || 0));
        return total + value;
    }, 0);
}
