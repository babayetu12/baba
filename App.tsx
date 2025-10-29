
import React, { useState, useMemo } from 'react';
import { usePersistence } from './hooks/usePersistence';
import { Subject, SessionReport, FocusMode, Exam, StudyBlock, TodoItem, DailyGoal } from './types';
import { LOCAL_STORAGE_KEY_SUBJECTS, LOCAL_STORAGE_KEY_PLANNER } from './constants';
import { generateId, getTotalFocusTime } from './utils/helpers';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import SubjectsView from './components/SubjectsView';
import SubjectDetailView from './components/SubjectDetailView';
import StatsView from './components/StatsView';
import PlannerView from './components/PlannerView';
import FocusView from './components/FocusView';
import SessionReportModal from './components/modals/SessionReportModal';

export default function App() {
  // State management
  const [subjects, setSubjects] = usePersistence<Subject[]>(LOCAL_STORAGE_KEY_SUBJECTS, []);
  const [studyBlocks, setStudyBlocks] = usePersistence<StudyBlock[]>(`${LOCAL_STORAGE_KEY_PLANNER}-blocks`, []);
  const [exams, setExams] = usePersistence<Exam[]>(`${LOCAL_STORAGE_KEY_PLANNER}-exams`, []);
  const [allDailyGoals, setAllDailyGoals] = usePersistence<Record<string, DailyGoal[]>>('zenith-focus-all-goals', {});
  
  const [activeView, setActiveView] = useState('home');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [focusSessionConfig, setFocusSessionConfig] = useState<{ subjectId: string; mode: FocusMode; duration: number } | null>(null);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);

  // Memoized derived state
  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  
  const allTodos = useMemo(() => {
    return subjects.flatMap(subject =>
        (subject.todos || []).map(todo => ({
            ...todo,
            subject: subject
        }))
    );
  }, [subjects]);

  // Handlers for Subjects
  const handleAddSubject = (subjectData: Omit<Subject, 'id' | 'sessions' | 'todos'>) => {
      const newSubject: Subject = {
          ...subjectData,
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
        if (selectedSubjectId === id) {
            setSelectedSubjectId(null);
            setActiveView('subjects');
        }
      }
  };

  const handleSelectSubject = (id: string) => {
      setSelectedSubjectId(id);
      setActiveView('subjectDetail');
  };
  
  // Handlers for Focus Sessions
  const handleStartSession = (subjectId: string, mode: FocusMode, duration: number) => {
      setFocusSessionConfig({ subjectId, mode, duration });
  };

  const handleSessionEnd = (focusedDuration: number, breakDuration: number, subjectId: string) => {
      setFocusSessionConfig(null);
      
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      const totalFocusTimeBefore = getTotalFocusTime(subject.sessions || []);

      const newSession = {
          id: generateId(),
          date: new Date().toISOString(),
          duration: focusedDuration,
          breakDuration: breakDuration,
      };
      
      const updatedSubject = {
          ...subject,
          sessions: [...(subject.sessions || []), newSession],
      };

      handleUpdateSubject(updatedSubject);
      
      const totalFocusTimeAfter = totalFocusTimeBefore + focusedDuration;
      
      setSessionReport({ focusedDuration, breakDuration, totalFocusTimeBefore, totalFocusTimeAfter });
  };

  // Handlers for Planner Items
  const handleAddStudyBlock = (block: Omit<StudyBlock, 'id'>) => setStudyBlocks(prev => [...prev, { ...block, id: generateId() }]);
  const handleUpdateStudyBlock = (block: StudyBlock) => setStudyBlocks(prev => prev.map(b => b.id === block.id ? block : b));
  const handleDeleteStudyBlock = (id: string) => setStudyBlocks(prev => prev.filter(b => b.id !== id));
  
  const handleAddExam = (exam: Omit<Exam, 'id'>) => setExams(prev => [...prev, { ...exam, id: generateId() }]);
  const handleUpdateExam = (exam: Exam) => setExams(prev => prev.map(e => e.id === exam.id ? exam : e));
  const handleDeleteExam = (id: string) => setExams(prev => prev.filter(e => e.id !== id));
  
  // Handlers for Daily Goals
  const handleAddGoal = (date: Date, goalData: { text: string; subjectId: string }) => {
    const dateKey = date.toISOString().slice(0, 10);
    const newGoal: DailyGoal = { ...goalData, id: generateId(), isCompleted: false };
    const updatedGoalsForDay = [...(allDailyGoals[dateKey] || []), newGoal];
    setAllDailyGoals(prev => ({ ...prev, [dateKey]: updatedGoalsForDay }));
  };

  const handleToggleGoal = (date: Date, goalId: string) => {
      const dateKey = date.toISOString().slice(0, 10);
      const dayGoals = allDailyGoals[dateKey];
      if (!dayGoals) return;
      const updatedGoalsForDay = dayGoals.map(g => g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g);
      setAllDailyGoals(prev => ({ ...prev, [dateKey]: updatedGoalsForDay }));
  };


  // View rendering logic
  const renderView = () => {
      if (selectedSubject && activeView === 'subjectDetail') {
          return <SubjectDetailView 
              subject={selectedSubject} 
              onBack={() => {
                  setSelectedSubjectId(null);
                  setActiveView('subjects');
              }}
              onUpdateSubject={handleUpdateSubject}
              subjects={subjects}
              onStartSession={handleStartSession}
          />;
      }

      switch(activeView) {
          case 'home':
              return <HomeView 
                subjects={subjects} 
                allTodos={allTodos} 
                onUpdateSubject={handleUpdateSubject}
                studyBlocks={studyBlocks}
                onAddStudyBlock={handleAddStudyBlock}
                onUpdateStudyBlock={handleUpdateStudyBlock}
                onDeleteStudyBlock={handleDeleteStudyBlock}
                onStartSession={handleStartSession}
                allDailyGoals={allDailyGoals}
                onAddGoal={handleAddGoal}
                onToggleGoal={handleToggleGoal}
              />;
          case 'subjects':
              return <SubjectsView 
                  subjects={subjects} 
                  onSelectSubject={handleSelectSubject}
                  onAddSubject={handleAddSubject}
                  onUpdateSubject={handleUpdateSubject}
                  onDeleteSubject={handleDeleteSubject}
                  setSubjects={setSubjects}
              />;
          case 'planner':
              return <PlannerView 
                subjects={subjects}
                studyBlocks={studyBlocks}
                exams={exams}
                onAddStudyBlock={handleAddStudyBlock}
                onUpdateStudyBlock={handleUpdateStudyBlock}
                onDeleteStudyBlock={handleDeleteStudyBlock}
                onAddExam={handleAddExam}
                onUpdateExam={handleUpdateExam}
                onDeleteExam={handleDeleteExam}
                allDailyGoals={allDailyGoals}
              />;
          case 'stats':
              return <StatsView subjects={subjects} />;
          default:
              return <HomeView 
                subjects={subjects} 
                allTodos={allTodos} 
                onUpdateSubject={handleUpdateSubject}
                studyBlocks={studyBlocks}
                onAddStudyBlock={handleAddStudyBlock}
                onUpdateStudyBlock={handleUpdateStudyBlock}
                onDeleteStudyBlock={handleDeleteStudyBlock}
                onStartSession={handleStartSession}
                allDailyGoals={allDailyGoals}
                onAddGoal={handleAddGoal}
                onToggleGoal={handleToggleGoal}
              />;
      }
  };

  if (focusSessionConfig) {
      const subjectForSession = subjects.find(s => s.id === focusSessionConfig.subjectId);
      if (subjectForSession) {
          return <FocusView 
              sessionConfig={focusSessionConfig}
              onSessionEnd={handleSessionEnd}
              subject={subjectForSession}
          />;
      }
  }
  
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
        <div className="p-4 md:p-8 mb-20 lg:mb-0">
          {renderView()}
        </div>
        
        {!focusSessionConfig && <BottomNav activeView={activeView} setActiveView={(view) => {
            if(view !== 'subjectDetail') {
                setSelectedSubjectId(null);
            }
            setActiveView(view);
        }} />}

        {sessionReport && <SessionReportModal report={sessionReport} onClose={() => setSessionReport(null)} />}
    </div>
  );
}