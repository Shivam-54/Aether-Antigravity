'use client';

import { Bond } from '@/types/bonds';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BondAllocationProps {
    bonds: Bond[];
}

export default function BondAllocation({ bonds }: BondAllocationProps) {
    // Allocation by Type
    const allocation = bonds.reduce((acc, bond) => {
        acc[bond.type] = (acc[bond.type] || 0) + bond.faceValue;
        return acc;
    }, {} as Record<string, number>);

    const chartData = {
        labels: Object.keys(allocation),
        datasets: [
            {
                data: Object.values(allocation),
                backgroundColor: [
                    'rgba(255, 255, 255, 0.8)', // Govt - Brightest
                    'rgba(255, 255, 255, 0.5)', // Agency
                    'rgba(255, 255, 255, 0.3)', // Muni
                    'rgba(255, 255, 255, 0.1)', // Corp - Darkest
                ],
                borderColor: 'rgba(0,0,0,0)',
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleColor: 'rgba(255, 255, 255, 0.9)',
                bodyColor: 'rgba(255, 255, 255, 0.7)',
                callbacks: {
                    label: (context: any) => ` ₹${(context.parsed / 100000).toFixed(2)} L`
                }
            }
        },
        cutout: '70%',
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-light tracking-wide text-white/90 mb-2">Asset Allocation</h1>
                <p className="text-white/50 font-light tracking-wide">
                    Exposure by issuer category
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-[500px]">
                {/* Chart Ring */}
                <div className="h-[350px] relative">
                    <Doughnut data={chartData} options={chartOptions} />
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <p className="text-white/30 font-light text-sm uppercase tracking-widest">Total Corpus</p>
                        <p className="text-white/90 text-3xl font-light mt-2">
                            ₹{(Object.values(allocation).reduce((a, b) => a + b, 0) / 10000000).toFixed(2)} Cr
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-4 p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)' }}>
                    {Object.entries(allocation).map(([type, value], index) => {
                        const total = Object.values(allocation).reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        const opacity = [0.8, 0.5, 0.3, 0.1][index % 4];

                        return (
                            <div key={type} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: `rgba(255, 255, 255, ${opacity})` }}
                                    />
                                    <span className="text-white/80 font-light tracking-wide">{type}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-white/90 font-light block">{percent}%</span>
                                    <span className="text-white/30 text-xs">₹{(value / 100000).toFixed(2)} L</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
