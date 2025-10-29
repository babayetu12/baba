import React, { useState } from 'react';
import { formatTotalTime } from '../../utils/helpers';

interface HeatmapProps {
    data: number[][]; // 7 days x 24 hours
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
    const maxVal = Math.max(...data.flat(), 1);
    const [tooltip, setTooltip] = useState<{ day: number, hour: number, value: number, x: number, y: number } | null>(null);

    const handleMouseOver = (day: number, hour: number, value: number, e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({ day, hour, value, x: rect.left + window.scrollX + rect.width / 2, y: rect.top + window.scrollY });
    };

    const formatHour = (h: number) => {
        if (h === 0) return '12am';
        if (h === 12) return '12pm';
        if (h < 12) return `${h}am`;
        return `${h - 12}pm`;
    }

    return (
        <div className="relative">
            {tooltip && (
                <div 
                    className="absolute z-10 p-2 text-xs bg-gray-900 text-white rounded-md shadow-lg pointer-events-none transform -translate-y-full -translate-x-1/2"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <strong>{days[tooltip.day]} at {formatHour(tooltip.hour)}:</strong> {formatTotalTime(tooltip.value)}
                </div>
            )}
            <div className="grid grid-cols-[auto_repeat(24,_minmax(0,_1fr))] gap-1 text-xs text-gray-400">
                <div /> {/* Empty corner */}
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="col-span-4 text-center">{formatHour(i * 4)}</div>
                ))}

                {days.map((day, dayIndex) => (
                    <React.Fragment key={day}>
                        <div className="flex items-center justify-end pr-1">{day}</div>
                        {Array.from({ length: 24 }).map((_, hourIndex) => {
                            const value = data[dayIndex][hourIndex];
                            const opacity = value > 0 ? 0.2 + (value / maxVal) * 0.8 : 0.05;
                            return (
                                <div
                                    key={`${dayIndex}-${hourIndex}`}
                                    className="w-full aspect-square bg-cyan-500 rounded-sm"
                                    style={{ opacity }}
                                    onMouseOver={(e) => handleMouseOver(dayIndex, hourIndex, value, e)}
                                    onMouseOut={() => setTooltip(null)}
                                />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
