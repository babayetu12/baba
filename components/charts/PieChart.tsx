
import React from 'react';

interface PieChartProps {
    data: { name: string; value: number; color: string }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
    if (data.length === 0) {
        return <p className="text-gray-500 text-center py-8">Start a focus session to see data here.</p>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <p className="text-gray-500 text-center py-8">No focus time recorded.</p>;
    
    let cumulativePercentage = 0;
    const radius = 80;
    const strokeWidth = 40;
    const circumference = 2 * Math.PI * radius;
    const center = 100;

    const segments = data.map((item, index) => {
        const percentage = item.value / total;
        const arcLength = percentage * circumference;
        const offset = -cumulativePercentage * circumference;
        cumulativePercentage += percentage;

        return (
            <circle
                key={index}
                r={radius}
                cx={center}
                cy={center}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={offset}
            />
        );
    });

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
            <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
                {segments}
            </svg>
            <div className="w-full md:w-auto space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                        <div className="flex justify-between w-full">
                            <span className="text-gray-300">{item.name}</span>
                            <span className="font-semibold text-white ml-4">{((item.value / total) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
