// This file is now components/StatsView.js
import React, { useState, useMemo } from 'react';
import { getTotalFocusTime, formatTotalTime, calculateOverallLongestStreak, checkEarnedAchievements, calculateAverageFocusTimes } from '../utils/helpers.js';
import { USER_RANKS } from '../constants.js';
import RanksModal from './modals/RanksModal.js';
import AchievementsModal from './modals/AchievementsModal.js';
import { PieChart } from './charts/PieChart';
import { LineGraph } from './charts/LineGraph';
import { Heatmap } from './charts/Heatmap';

// FIX: Added explicit prop types to make the 'onClick' prop optional, resolving errors on lines 97 and 99.
const StatCard = ({ label, value, icon, onClick }: { label: any; value: any; icon: any; onClick?: () => void; }) => (
    <div 
        onClick={onClick}
        className={`bg-gray-800 p-6 rounded-lg text-center ${onClick ? 'cursor-pointer hover:bg-gray-700 transition' : ''}`}
    >
        <p className="text-gray-400 text-sm uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-white flex items-center justify-center mt-2">
          {icon && <span className="text-4xl mr-2">{icon}</span>}
          {value}
        </p>
    </div>
);

export default function StatsView({ subjects }) {
  const [isRanksModalOpen, setIsRanksModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  
  const allSessions = useMemo(() => subjects.flatMap(s => s.sessions || []), [subjects]);
  const allTodos = useMemo(() => subjects.flatMap(s => s.todos || []), [subjects]);

  const totalFocusTime = useMemo(() => getTotalFocusTime(allSessions), [allSessions]);
  const longestStreak = useMemo(() => calculateOverallLongestStreak(subjects), [subjects]);
  
  const earnedAchievements = useMemo(() => checkEarnedAchievements(subjects, allTodos), [subjects, allTodos]);
  const averageFocusTimes = useMemo(() => calculateAverageFocusTimes(subjects), [subjects]);

  // Data for Charts
  const pieChartData = useMemo(() => {
    return subjects.map(subject => ({
      name: subject.name,
      value: getTotalFocusTime(subject.sessions || []),
      color: subject.colorHex,
    })).filter(item => item.value > 0);
  }, [subjects]);

  const lineGraphData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    }).reverse();

    const dailyTotals = {};
    allSessions.forEach(session => {
        const dateKey = new Date(session.date).toDateString();
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + session.duration;
    });

    return last30Days.map(date => ({
        date: date,
        value: dailyTotals[date.toDateString()] || 0,
    }));
  }, [allSessions]);

  const heatmapData = useMemo(() => {
      const grid = Array(7).fill(0).map(() => Array(24).fill(0));
      allSessions.forEach(session => {
          const date = new Date(session.date);
          const day = date.getDay(); // Sunday = 0, Saturday = 6
          const hour = date.getHours();
          grid[day][hour] += session.duration;
      });
      return grid;
  }, [allSessions]);


  const totalHours = totalFocusTime / 3600;
  const currentRank = useMemo(() => {
    return USER_RANKS.slice().reverse().find(rank => totalHours >= rank.minHours) || USER_RANKS[0];
  }, [totalHours]);

  return (
    <div className="animate-fadeIn space-y-8">
      <RanksModal
        isOpen={isRanksModalOpen}
        onClose={() => setIsRanksModalOpen(false)}
        totalFocusTime={totalFocusTime}
      />
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        earnedAchievements={earnedAchievements}
      />
      <h1 className="text-3xl font-bold">My Stats</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Focus" value={formatTotalTime(totalFocusTime)} icon="⏱️" />
        <StatCard label="Avg. Daily Focus" value={formatTotalTime(averageFocusTimes.daily)} icon="📅" />
        <StatCard label="Avg. Weekly Focus" value={formatTotalTime(averageFocusTimes.weekly)} icon="🗓️" />
        <StatCard label="Current Rank" value={currentRank.name} icon={currentRank.icon} onClick={() => setIsRanksModalOpen(true)} />
        <StatCard label="Longest Streak" value={`${longestStreak}d`} icon="🔥" />
        <StatCard label="Achievements" value={earnedAchievements.length} icon="🌟" onClick={() => setIsAchievementsModalOpen(true)} />
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Achievements</h3>
          <button onClick={() => setIsAchievementsModalOpen(true)} className="text-sm text-cyan-400 hover:underline">View All</button>
        </div>
        <div className="flex flex-wrap gap-4">
            {earnedAchievements.length > 0 ? earnedAchievements.slice(0, 10).map(ach => (
                <div key={ach.id} title={ach.name} className="text-3xl p-2 bg-gray-700 rounded-full">{ach.icon}</div>
            )) : <p className="text-gray-500 text-sm">No achievements unlocked yet. Keep focusing!</p>}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">30-Day Focus Trend</h2>
        <LineGraph data={lineGraphData} color="#06B6D4" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Focus Time by Subject</h2>
          <PieChart data={pieChartData} />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Weekly Focus Heatmap</h2>
          <Heatmap data={heatmapData} />
        </div>
      </div>
    </div>
  );
}