import React, { useState, useMemo } from 'react';
import { usePersistence } from './hooks/usePersistence';
import { generateId, getTotalFocusTime } from './utils/helpers';
import { Subject, SessionReport as SessionReportType, FocusMode as FocusModeEnum } from './types';

import SubjectsView from './components/SubjectsView';
import SubjectDetailView from './components/SubjectDetailView';
import HomeView from './components/HomeView';
import StatsView from './components/StatsView';
import PlannerView from './components/PlannerView';
import FocusView from './components/FocusView';
import BottomNav from './components/BottomNav';
import SessionReportModal from './components/modals/SessionReportModal';
import { LOCAL_STORAGE_KEY_SUBJECTS } from './constants';

interface SessionConfig {
  subjectId: string;
  mode: FocusModeEnum;
  duration: number;
}

export default function App() {
  const [subjects, setSubjects] = usePersistence<Subject[]>(LOCAL_STORAGE_KEY_SUBJECTS, []);
  const [activeView, setActiveView] = useState('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionReport, setSessionReport] = useState<SessionReportType | null>(null);

  const handleAddSubject = (newSubjectData: Omit<Subject, 'id' | 'sessions' | 'todos'>) => {
    const newSubject: Subject = {
      ...newSubjectData,
      id: generateId(),
      sessions: [],
      todos: [],
    };
    setSubjects(prev => [...prev, newSubject]);
  };
  
  const handleUpdateSubject = (updatedSubject: Subject) => {
    setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
  };
  
  const handleDeleteSubject = (id: string) => {
    if (window.confirm("Are you sure you want to delete this subject and all its data?")) {
        setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
  };
  
  const handleStartSession = (subjectId: string, mode: FocusModeEnum, duration: number) => {
    setSessionConfig({ subjectId, mode, duration });
  };
  
  const handleSessionEnd = (focusedDuration: number, breakDuration: number, subjectId: string) => {
    const totalFocusTimeBefore = getTotalFocusTime(subjects.flatMap(s => s.sessions || []));
    
    const newSession = {
      id: generateId(),
      date: new Date().toISOString(),
      duration: focusedDuration,
      breakDuration: breakDuration,
    };
    
    setSubjects(prev => prev.map(s => {
      if (s.id === subjectId) {
        return { ...s, sessions: [...(s.sessions || []), newSession] };
      }
      return s;
    }));
    
    const totalFocusTimeAfter = totalFocusTimeBefore + focusedDuration;
    
    setSessionConfig(null);
    setSessionReport({ focusedDuration, breakDuration, totalFocusTimeBefore, totalFocusTimeAfter });
  };

  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  
  const allTodos = useMemo(() => {
    return subjects.flatMap(subject => 
        (subject.todos || []).map(todo => ({ ...todo, subject }))
    );
  }, [subjects]);

  const renderContent = () => {
    if (selectedSubject) {
      return (
        <SubjectDetailView
          subject={selectedSubject}
          onBack={() => setSelectedSubjectId(null)}
          onUpdateSubject={handleUpdateSubject}
          subjects={subjects}
          onStartSession={handleStartSession}
        />
      );
    }
    
    switch (activeView) {
      case 'home':
        return <HomeView subjects={subjects} allTodos={allTodos} onUpdateSubject={handleUpdateSubject} />;
      case 'subjects':
        return <SubjectsView subjects={subjects} onSelectSubject={handleSelectSubject} onAddSubject={handleAddSubject} onUpdateSubject={handleUpdateSubject} onDeleteSubject={handleDeleteSubject} setSubjects={setSubjects} />;
      case 'stats':
        return <StatsView subjects={subjects} />;
      case 'planner':
        return <PlannerView subjects={subjects} />;
      default:
        return <HomeView subjects={subjects} allTodos={allTodos} onUpdateSubject={handleUpdateSubject}/>;
    }
  };
  
  const focusSubject = sessionConfig ? subjects.find(s => s.id === sessionConfig.subjectId) : null;

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {renderContent()}
      </main>
      
      {!selectedSubject && <BottomNav activeView={activeView} setActiveView={(v) => setActiveView(v)} />}
      
      {sessionConfig && focusSubject && (
        <FocusView sessionConfig={sessionConfig} onSessionEnd={handleSessionEnd} subject={focusSubject} />
      )}
      
      {sessionReport && (
        <SessionReportModal report={sessionReport} onClose={() => setSessionReport(null)} />
      )}
    </div>
  );
}