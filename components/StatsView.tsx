// This file is now components/StatsView.js
import React, { useState, useMemo } from 'react';
import { getTotalFocusTime, formatTotalTime, calculateOverallLongestStreak } from '../utils/helpers.js';
import { USER_RANKS } from '../constants.js';
import RanksModal from './modals/RanksModal.js';

const StatCard = ({ label, value, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-400 text-sm uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-white flex items-center justify-center mt-2">
          {icon && <span className="text-4xl mr-2">{icon}</span>}
          {value}
        </p>
    </div>
);

export default function StatsView({ subjects }) {
  const [isRanksModalOpen, setIsRanksModalOpen] = useState(false);
  
  const allSessions = useMemo(() => subjects.flatMap(s => s.sessions || []), [subjects]);

  const totalFocusTime = useMemo(() => getTotalFocusTime(allSessions), [allSessions]);

  const longestStreak = useMemo(() => calculateOverallLongestStreak(subjects), [subjects]);

  const mostProductiveDay = useMemo(() => {
    if (allSessions.length === 0) return null;
    
    const dailyTotals = {};
    allSessions.forEach(session => {
        const dateKey = new Date(session.date).toLocaleDateString();
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + session.duration;
    });

    let maxDuration = 0;
    let productiveDate = '';
    for (const date in dailyTotals) {
        if (dailyTotals[date] > maxDuration) {
            maxDuration = dailyTotals[date];
            productiveDate = date;
        }
    }
    return { date: productiveDate, duration: maxDuration };
  }, [allSessions]);
  
  const totalHours = totalFocusTime / 3600;

  const currentRank = useMemo(() => {
    return USER_RANKS.slice().reverse().find(rank => totalHours >= rank.minHours) || USER_RANKS[0];
  }, [totalHours]);
  
  const nextRank = useMemo(() => {
    return USER_RANKS.find(rank => totalHours < rank.minHours);
  }, [totalHours]);

  const progressToNextRank = useMemo(() => {
    if (!nextRank) return 100;
    const currentRankIndex = USER_RANKS.findIndex(r => r.name === currentRank.name);
    const prevRankMinHours = USER_RANKS[currentRankIndex]?.minHours || 0;
    const rankRange = nextRank.minHours - prevRankMinHours;
    if (rankRange <= 0) return 100;
    const progressInRank = totalHours - prevRankMinHours;
    return (progressInRank / rankRange) * 100;
  }, [totalHours, nextRank, currentRank]);

  const sortedSubjectsByFocus = useMemo(() => {
    return [...subjects].sort((a, b) => (getTotalFocusTime(b.sessions || []) || 0) - (getTotalFocusTime(a.sessions || []) || 0));
  }, [subjects]);

  return (
    <div className="animate-fadeIn">
      <RanksModal
        isOpen={isRanksModalOpen}
        onClose={() => setIsRanksModalOpen(false)}
        totalFocusTime={totalFocusTime}
      />
      <h1 className="text-3xl font-bold mb-6">My Stats</h1>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
        {/* FIX: Added missing 'icon' prop to StatCard component. */}
        <StatCard label="Total Focus Time" value={formatTotalTime(totalFocusTime)} icon="⏱️" />
        <StatCard label="Current Rank" value={currentRank.name} icon={currentRank.icon} />
        <StatCard label="Longest Streak" value={`${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`} icon="🔥" />
        {mostProductiveDay ? (
            <StatCard label="Most Productive Day" value={`${mostProductiveDay.date} (${formatTotalTime(mostProductiveDay.duration)})`} icon="🚀" />
        ) : (
            <StatCard label="Most Productive Day" value="N/A" icon="🚀" />
        )}
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg">Rank Progress</h3>
            {nextRank ? (
                <p className="text-sm text-gray-400">Next: {nextRank.name} ({nextRank.minHours} hrs)</p>
            ) : (
                <p className="text-sm text-gray-400">Max rank achieved!</p>
            )}
          </div>
          <button onClick={() => setIsRanksModalOpen(true)} className="text-sm text-cyan-400 hover:underline">View All Ranks</button>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-cyan-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progressToNextRank)}%` }}
          ></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Focus Time by Subject</h2>
        <div className="space-y-4">
          {sortedSubjectsByFocus.length > 0 ? sortedSubjectsByFocus.map(subject => (
            <div key={subject.id} className="bg-gray-800 rounded-lg p-4" style={{ borderLeft: `5px solid ${subject.colorHex}` }}>
              <div className="flex justify-between items-center">
                <p className="font-semibold">{subject.name}</p>
                <p className="font-bold text-white">{formatTotalTime(getTotalFocusTime(subject.sessions || []))}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 px-6 bg-gray-800 rounded-lg">
                <p className="text-gray-400">No focus data yet. Start a session!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}