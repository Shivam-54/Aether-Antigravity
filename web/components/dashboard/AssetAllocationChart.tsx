'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AssetAllocationChartProps {
    data: {
        name: string;
        value: number;
        percentage: number;
        color: string;
    }[];
}

export default function AssetAllocationChart({ data }: AssetAllocationChartProps) {
    // Filter out zero values
    const chartData = data.filter(item => item.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-white/30 text-sm">
                No assets to display
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-black/90 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-white text-sm font-medium">{data.name}</p>
                    <p className="text-white/70 text-xs">
                        ₹{data.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-white/50 text-xs">
                        {data.percentage.toFixed(1)}% of portfolio
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => (
                            <span className="text-white/70 text-xs">
                                {value} ({entry.payload.percentage.toFixed(1)}%)
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
