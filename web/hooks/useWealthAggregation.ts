import { useShares } from '@/context/SharesContext';
import { useCrypto } from '@/context/CryptoContext';
import { useRealEstate } from '@/context/RealEstateContext';
import { PropertyStatus } from '@/types/realestate';
import { useMemo } from 'react';

interface AssetBreakdown {
    value: number;
    percentage: number;
    count: number;
    gainLoss: number;
    gainLossPercent: number;
}

interface WealthAggregation {
    totalNetWorth: number;
    assetBreakdown: {
        shares: AssetBreakdown;
        crypto: AssetBreakdown;
        realEstate: AssetBreakdown;
        bonds: AssetBreakdown;
        business: AssetBreakdown;
    };
    totalGainLoss: number;
    totalGainLossPercent: number;
    loading: boolean;
}

export function useWealthAggregation(): WealthAggregation {
    const { shares, loading: sharesLoading } = useShares();
    const { holdings: cryptoHoldings, metrics: cryptoMetrics, loading: cryptoLoading } = useCrypto();
    const { properties, loading: realEstateLoading } = useRealEstate();

    const aggregation = useMemo(() => {
        // Calculate Shares
        const activeShares = shares.filter(s => s.status === 'active');
        const sharesValue = activeShares.reduce((sum, share) => sum + share.totalValue, 0);
        const sharesGainLoss = activeShares.reduce((sum, share) => sum + share.gainLoss, 0);
        const sharesTotalInvested = activeShares.reduce((sum, share) => sum + share.totalInvested, 0);
        const sharesGainLossPercent = sharesTotalInvested > 0 ? (sharesGainLoss / sharesTotalInvested) * 100 : 0;

        // Calculate Crypto
        const cryptoValue = cryptoMetrics.total_value || 0;
        const cryptoGainLoss = cryptoHoldings.reduce((sum, holding) => {
            const invested = holding.quantity * holding.purchase_price_avg;
            const current = holding.quantity * holding.current_price;
            return sum + (current - invested);
        }, 0);
        const cryptoInvested = cryptoHoldings.reduce((sum, h) => sum + (h.quantity * h.purchase_price_avg), 0);
        const cryptoGainLossPercent = cryptoInvested > 0 ? (cryptoGainLoss / cryptoInvested) * 100 : 0;

        // Calculate Real Estate
        const activeProperties = properties.filter(p => p.status === PropertyStatus.Owned || p.status === PropertyStatus.Rented);
        const realEstateValue = activeProperties.reduce((sum, prop) => sum + prop.currentValue, 0);
        const realEstatePurchaseValue = activeProperties.reduce((sum, prop) => sum + prop.purchaseValue, 0);
        const realEstateGainLoss = realEstateValue - realEstatePurchaseValue;
        const realEstateGainLossPercent = realEstatePurchaseValue > 0 ? (realEstateGainLoss / realEstatePurchaseValue) * 100 : 0;

        // TODO: Add Bonds, Business when their contexts are available
        const bondsValue = 0;
        const businessValue = 0;

        // Calculate totals
        const totalNetWorth = sharesValue + cryptoValue + realEstateValue + bondsValue + businessValue;
        const totalGainLoss = sharesGainLoss + cryptoGainLoss + realEstateGainLoss;
        const totalInvested = sharesTotalInvested + cryptoInvested + realEstatePurchaseValue;
        const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

        return {
            totalNetWorth,
            assetBreakdown: {
                shares: {
                    value: sharesValue,
                    percentage: totalNetWorth > 0 ? (sharesValue / totalNetWorth) * 100 : 0,
                    count: activeShares.length,
                    gainLoss: sharesGainLoss,
                    gainLossPercent: sharesGainLossPercent
                },
                crypto: {
                    value: cryptoValue,
                    percentage: totalNetWorth > 0 ? (cryptoValue / totalNetWorth) * 100 : 0,
                    count: cryptoHoldings.length,
                    gainLoss: cryptoGainLoss,
                    gainLossPercent: cryptoGainLossPercent
                },
                realEstate: {
                    value: realEstateValue,
                    percentage: totalNetWorth > 0 ? (realEstateValue / totalNetWorth) * 100 : 0,
                    count: activeProperties.length,
                    gainLoss: realEstateGainLoss,
                    gainLossPercent: realEstateGainLossPercent
                },
                bonds: {
                    value: bondsValue,
                    percentage: 0,
                    count: 0,
                    gainLoss: 0,
                    gainLossPercent: 0
                },
                business: {
                    value: businessValue,
                    percentage: 0,
                    count: 0,
                    gainLoss: 0,
                    gainLossPercent: 0
                }
            },
            totalGainLoss,
            totalGainLossPercent,
            loading: sharesLoading || cryptoLoading || realEstateLoading
        };
    }, [shares, cryptoHoldings, cryptoMetrics, properties, sharesLoading, cryptoLoading, realEstateLoading]);

    return aggregation;
}
