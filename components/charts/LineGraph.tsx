import React from 'react';
import { formatTotalTime } from '../../utils/helpers';

interface LineGraphProps {
    data: { date: Date; value: number }[]; // value in seconds
    color: string;
}

export const LineGraph: React.FC<LineGraphProps> = ({ data, color }) => {
    if (data.length < 2) return <p className="text-gray-500 text-center py-8">Not enough data for a trend line.</p>;

    const width = 500;
    const height = 150;
    const padding = 20;

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    const xStep = (width - padding * 2) / (data.length - 1);

    const points = data.map((d, i) => {
        const x = padding + i * xStep;
        const y = height - padding - (d.value / maxValue) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');
    
    const lastPoint = data[data.length - 1];
    const lastX = padding + (data.length - 1) * xStep;
    const lastY = height - padding - (lastPoint.value / maxValue) * (height - padding * 2);

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-axis labels */}
                <text x={padding - 5} y={padding} textAnchor="end" fontSize="10" fill="#9CA3AF">{formatTotalTime(maxValue)}</text>
                <text x={padding - 5} y={height - padding + 3} textAnchor="end" fontSize="10" fill="#9CA3AF">0m</text>
                
                {/* Grid lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#4B5563" strokeWidth="0.5" strokeDasharray="2" />
                <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#4B5563" strokeWidth="0.5" strokeDasharray="2" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#4B5563" strokeWidth="0.5" />

                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                />
                
                {/* Highlight last point */}
                <circle cx={lastX} cy={lastY} r="4" fill={color} />

                {/* X-axis labels */}
                <text x={padding} y={height} textAnchor="start" fontSize="10" fill="#9CA3AF">{data[0].date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</text>
                <text x={width - padding} y={height} textAnchor="end" fontSize="10" fill="#9CA3AF">{data[data.length - 1].date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</text>
            </svg>
        </div>
    );
};
