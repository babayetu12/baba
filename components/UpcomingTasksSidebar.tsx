
import React from 'react';
import { TodoItem, Subject } from '../types';

interface UpcomingTasksSidebarProps {
  allTodos: (TodoItem & { subject: Subject })[];
}

export default function UpcomingTasksSidebar({ allTodos }: UpcomingTasksSidebarProps) {
  const upcomingTasks = allTodos
    .filter(todo => !todo.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // A simple handler for the button as we cannot modify other views
  const handleAddTaskClick = () => {
    alert('This will open the Add Task modal. Functionality will be fully connected in a future update to keep changes isolated to the Planner view.');
  };

  return (
    <aside className="hidden lg:block w-56 sticky top-8 self-start">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-400">Upcoming Tasks</h2>
            <button onClick={handleAddTaskClick} className="text-sm text-cyan-400 hover:underline">+ Add Task</button>
        </div>
      {upcomingTasks.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4 bg-gray-800 rounded-lg">No upcoming tasks.</div>
      ) : (
        <div className="space-y-3">
          {upcomingTasks.slice(0, 7).map(todo => ( // Show top 7 tasks
            <div key={todo.id} className="bg-gray-800 p-3 rounded-lg border-l-4" style={{ borderColor: todo.subject.colorHex }}>
              <p className="font-bold truncate text-white text-sm">{todo.title}</p>
              <div className="text-xs text-gray-400 flex items-center mt-1">
                <span className="truncate max-w-[100px]">{todo.subject.name}</span>
                <span className="mx-2">·</span>
                <span>
                    {new Date(todo.dueDate).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric'
                    })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}