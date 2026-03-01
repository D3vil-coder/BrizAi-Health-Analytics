import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import WaterTracker from './components/Features/WaterTracker';
import SleepTracker from './components/Features/SleepTracker';
import NutritionTracker from './components/Features/NutritionTracker';
import ActivityLog from './components/Features/ActivityLog';
import CalendarView from './components/Features/CalendarView';
import FitnessTracker from './components/Features/FitnessTracker';
import HealthChat from './components/Features/HealthChat';
import Settings from './components/Features/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'water': return <WaterTracker />;
      case 'sleep': return <SleepTracker />;
      case 'nutrition': return <NutritionTracker />;
      case 'activity': return <ActivityLog />;
      case 'calendar': return <CalendarView />;
      case 'fitness': return <FitnessTracker />;
      case 'chat': return <HealthChat />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
          </MainLayout>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

