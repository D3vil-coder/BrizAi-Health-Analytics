import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeSection } from '../../services/aiService';
import { Plus, Brain, Trash2, X, Clock } from 'lucide-react';
import { format, differenceInMinutes, parse, startOfToday } from 'date-fns';

const ActivityLog = () => {
  const { userProfile, getTodayLog, updateDailyLog } = useApp();
  const todayLog = getTodayLog();
  const activityLog = todayLog.activity || { history: [] };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', start: '', end: '', color: '#00ff9d' });

  // Manual Entry Logic
  const addManualActivity = () => {
    if (!manualForm.title || !manualForm.start || !manualForm.end) return;

    const today = startOfToday();
    const start = parse(manualForm.start, 'HH:mm', today);
    const end = parse(manualForm.end, 'HH:mm', today);
    const duration = differenceInMinutes(end, start);

    if (duration <= 0) return;

    const newActivity = {
      id: Date.now(),
      title: manualForm.title,
      start: manualForm.start,
      end: manualForm.end,
      duration: duration,
      type: 'Manual',
      color: manualForm.color || '#00ff9d'
    };

    const newLog = {
      ...activityLog,
      history: [...(activityLog.history || []), newActivity].sort((a, b) => a.start.localeCompare(b.start))
    };
    updateDailyLog('activity', newLog);
    setManualForm({ title: '', start: '', end: '', color: '#00ff9d' });
    setShowModal(false);
  };

  const deleteActivity = (id) => {
    const newLog = {
      ...activityLog,
      history: activityLog.history.filter(a => a.id !== id)
    };
    updateDailyLog('activity', newLog);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSection('Activity', {
        history: activityLog.history,
        profile: userProfile
      }, userProfile);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Could not generate analysis.");
    }
    setIsAnalyzing(false);
  };

  // Timeline Construction
  const timelineHours = Array.from({ length: 13 }, (_, i) => i * 2); // 0, 2, 4... 24

  return (
    <div className="space-y-6 animate-fade-in pb-4 h-[calc(100vh-100px)] flex flex-col">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Day Timeline</h2>
          <p className="text-text-secondary">Track your flow</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Log Block
          </button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? '...' : <Brain size={20} />}
          </button>
        </div>
      </header>

      {/* Analysis Result */}
      {analysis && (
        <div className="card border-accent-primary/50 bg-accent-primary/5 shrink-0 mb-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-accent-primary mb-2 flex items-center gap-2">
              <Brain size={20} /> AI Insights
            </h3>
            <button onClick={() => setAnalysis(null)} className="text-text-secondary hover:text-white"><X size={16} /></button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {analysis}
          </p>
        </div>
      )}

      {/* Full Width Timeline - Fit to Screen */}
      <div className="card relative flex-1 overflow-hidden flex flex-col p-0 border-none bg-transparent">
        <div className="flex-1 relative bg-[#0a0a0a]/50 rounded-xl border border-white/5 flex flex-col">
          {/* Time Grid */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            {timelineHours.map(hour => (
              <div key={hour} className="flex-1 border-b border-white/5 flex items-start relative">
                <span className="absolute -top-2 left-2 text-[10px] text-text-secondary bg-[#0a0a0a] px-1">
                  {format(new Date().setHours(hour, 0), 'hh:mm a')}
                </span>
              </div>
            ))}
          </div>

          {/* Activity Blocks */}
          <div className="absolute inset-0 ml-12 mr-2 my-2">
            {(activityLog.history || []).map((activity) => {
              const startHour = parseInt(activity.start.split(':')[0]);
              const startMin = parseInt(activity.start.split(':')[1]);

              const startTotalMinutes = (startHour * 60) + startMin;
              const durationMinutes = activity.duration;

              // Calculate percentage positions
              const topPercent = (startTotalMinutes / 1440) * 100;
              const heightPercent = (durationMinutes / 1440) * 100;

              return (
                <div
                  key={activity.id}
                  className={`absolute left-0 right-0 rounded-md border-l-4 hover:brightness-110 transition-all group overflow-hidden z-10 shadow-lg`}
                  style={{
                    top: `${topPercent}%`,
                    height: `${Math.max(heightPercent, 2)}%`,
                    minHeight: '28px',
                    borderLeftColor: activity.color || '#00ff9d',
                    backgroundColor: `${activity.color || '#00ff9d'}E6`
                  }}
                >
                  <div className="flex justify-between items-center h-full px-2 py-1 bg-black/40">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <div className="font-bold text-white text-xs truncate">{activity.title}</div>
                      <div className="text-[10px] text-white/70 shrink-0">{format(parse(activity.start, 'HH:mm', new Date()), 'hh:mm a')}</div>
                    </div>
                    <button
                      onClick={() => deleteActivity(activity.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-red-400 transition-opacity shrink-0 ml-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Current Time Indicator */}
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
              style={{ top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 100}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="card w-full max-w-md m-4 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-text-secondary hover:text-white">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock size={24} className="text-accent-primary" /> Log Activity Block
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Activity</label>
                <input
                  type="text"
                  placeholder="Deep Work, Meeting, etc."
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="input-field"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm text-text-secondary mb-1">Start Time</label>
                  <div
                    className="input-field flex items-center justify-between cursor-pointer relative hover:border-accent-primary/50 transition-colors bg-bg-secondary/80"
                    onClick={() => document.getElementById('manual-start-time').showPicker()}
                  >
                    <span className="text-white font-medium">
                      {manualForm.start
                        ? format(parse(manualForm.start, 'HH:mm', new Date()), 'hh:mm a')
                        : '--:-- --'}
                    </span>
                    <Clock size={16} className="text-accent-primary" />
                    <input
                      id="manual-start-time"
                      type="time"
                      value={manualForm.start}
                      onChange={(e) => setManualForm({ ...manualForm, start: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm text-text-secondary mb-1">End Time</label>
                  <div
                    className="input-field flex items-center justify-between cursor-pointer relative hover:border-accent-primary/50 transition-colors bg-bg-secondary/80"
                    onClick={() => document.getElementById('manual-end-time').showPicker()}
                  >
                    <span className="text-white font-medium">
                      {manualForm.end
                        ? format(parse(manualForm.end, 'HH:mm', new Date()), 'hh:mm a')
                        : '--:-- --'}
                    </span>
                    <Clock size={16} className="text-accent-primary" />
                    <input
                      id="manual-end-time"
                      type="time"
                      value={manualForm.end}
                      onChange={(e) => setManualForm({ ...manualForm, end: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: 'green', value: '#00ff9d' },
                  { name: 'blue', value: '#3b82f6' },
                  { name: 'purple', value: '#a855f7' },
                  { name: 'pink', value: '#ec4899' },
                  { name: 'orange', value: '#f97316' },
                  { name: 'cyan', value: '#06b6d4' },
                  { name: 'red', value: '#ef4444' },
                  { name: 'yellow', value: '#eab308' }
                ].map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setManualForm({ ...manualForm, color: color.value })}
                    className={`w-8 h-8 rounded-full transition-all ${manualForm.color === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] scale-110' : 'opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>

            <button onClick={addManualActivity} className="w-full btn-primary mt-4 py-3">
              Add to Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
