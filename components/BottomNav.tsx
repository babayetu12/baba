// This file is now components/BottomNav.js
import React from 'react';
import { HomeIcon, BookOpenIcon, ChartBarIcon, CalendarIcon } from './ui/Icons.js';

const navItems = [
  { view: 'home', icon: <HomeIcon />, label: 'Home' },
  { view: 'subjects', icon: <BookOpenIcon />, label: 'Subjects' },
  { view: 'planner', icon: <CalendarIcon />, label: 'Planner' },
  { view: 'stats', icon: <ChartBarIcon />, label: 'Stats' },
];

export default function BottomNav({ activeView, setActiveView }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
      <div className="flex justify-around max-w-2xl mx-auto">
        {navItems.map(item => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm transition-colors duration-200 ${
              activeView === item.view ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
