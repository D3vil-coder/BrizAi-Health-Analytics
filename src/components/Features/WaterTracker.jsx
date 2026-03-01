import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeSection } from '../../services/aiService';
import { Droplets, Plus, Minus, Coffee, Calendar as CalendarIcon, X, History, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, subDays, addDays, isSameDay, parseISO, isAfter, startOfToday } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WaterTracker = () => {
    const { userProfile, dailyLogs, updateDailyLog } = useApp();

    // State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customEntry, setCustomEntry] = useState({ amount: 250, time: format(new Date(), 'HH:mm'), date: format(new Date(), 'yyyy-MM-dd') });
    const [refillTime, setRefillTime] = useState(format(new Date(), 'HH:mm'));

    // Constants
    const STANLEY_CUP_SIZE = 1180;

    // Calculate Goal based on weight (Scientific: ~35ml per kg)
    const DAILY_GOAL = useMemo(() => {
        if (userProfile.weight) {
            return Math.round(userProfile.weight * 35);
        }
        return 2500; // Default fallback
    }, [userProfile.weight]);

    // Get data for selected date
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const dayLog = dailyLogs[dateKey]?.water || { refills: 0, custom: 0, history: [] };

    const totalWater = useMemo(() => {
        return (dayLog.refills * STANLEY_CUP_SIZE) + dayLog.custom;
    }, [dayLog]);

    const progress = Math.min((totalWater / DAILY_GOAL) * 100, 100);

    // Actions
    const updateLog = (newLog, date = dateKey) => {
        updateDailyLog('water', newLog, date);
    };

    const addRefill = () => {
        const newLog = {
            ...dayLog,
            refills: dayLog.refills + 1,
            history: [...dayLog.history, {
                type: 'Refill',
                amount: STANLEY_CUP_SIZE,
                time: refillTime,
                timestamp: Date.now()
            }]
        };
        updateLog(newLog);
    };

    const removeRefill = () => {
        if (dayLog.refills > 0) {
            // Find last refill to remove
            const lastRefillIndex = [...dayLog.history].reverse().findIndex(h => h.type === 'Refill');
            if (lastRefillIndex !== -1) {
                const realIndex = dayLog.history.length - 1 - lastRefillIndex;
                const newHistory = [...dayLog.history];
                newHistory.splice(realIndex, 1);

                const newLog = {
                    ...dayLog,
                    refills: dayLog.refills - 1,
                    history: newHistory
                };
                updateLog(newLog);
            }
        }
    };

    const handleCustomSubmit = () => {
        const entryDateKey = customEntry.date;
        const targetLog = dailyLogs[entryDateKey]?.water || { refills: 0, custom: 0, history: [] };

        const newLog = {
            ...targetLog,
            custom: targetLog.custom + parseInt(customEntry.amount),
            history: [...targetLog.history, {
                type: 'Custom',
                amount: parseInt(customEntry.amount),
                time: customEntry.time,
                timestamp: Date.now()
            }]
        };

        updateLog(newLog, entryDateKey);
        setShowCustomModal(false);
        // Reset form but keep date/time current
        setCustomEntry({ ...customEntry, amount: 250 });
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeSection('Water Intake', {
                total: totalWater,
                goal: DAILY_GOAL,
                history: dayLog.history,
                profile: userProfile
            }, userProfile);
            setAnalysis(result);
        } catch (error) {
            setAnalysis("Could not generate analysis. Please check your API settings.");
        }
        setIsAnalyzing(false);
    };

    // Chart Data (Last 7 Days)
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const k = format(d, 'yyyy-MM-dd');
            const log = dailyLogs[k]?.water;
            const total = log ? (log.refills * STANLEY_CUP_SIZE) + log.custom : 0;
            data.push({ name: format(d, 'EEE'), amount: total });
        }
        return data;
    }, [dailyLogs]);

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Hydration Tracker</h2>
                    <p className="text-text-secondary">Goal: {DAILY_GOAL}ml {userProfile.weight && '(Based on weight)'}</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center bg-bg-secondary rounded-lg p-1 border border-white/10">
                        <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:text-white text-text-secondary"><ChevronLeft size={16} /></button>
                        <span className="px-4 font-medium text-white min-w-[100px] text-center">{format(selectedDate, 'MMM dd')}</span>
                        <button
                            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                            disabled={isSameDay(selectedDate, startOfToday())}
                            className="p-2 hover:text-white text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => updateLog({ refills: 0, custom: 0, history: [] })}
                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                        Reset Day
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? '...' : 'Analyse'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Visual */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Visual */}
                    <div className="card flex flex-col items-center justify-center relative overflow-hidden min-h-[350px]">
                        <div className="absolute inset-0 bg-blue-900/10 z-0"></div>
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-1000 ease-out z-0"
                            style={{ height: `${progress}%` }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400/50 blur-md"></div>
                        </div>

                        <div className="z-10 text-center space-y-6">
                            <div className="text-7xl font-bold text-white drop-shadow-[0_0_15px_rgba(0,112,243,0.5)]">
                                {totalWater} <span className="text-3xl text-text-secondary">ml</span>
                            </div>

                            <div className="flex items-center gap-8 mt-8">
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={removeRefill} className="p-4 rounded-full bg-bg-primary/50 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all group">
                                        <Minus size={24} className="text-text-secondary group-hover:text-red-400" />
                                    </button>
                                    <span className="text-xs text-text-secondary">Undo Refill</span>
                                </div>

                                <div className="flex flex-col items-center gap-3">
                                    <button onClick={addRefill} className="w-28 h-28 rounded-full bg-accent-primary shadow-[0_0_30px_rgba(0,255,157,0.3)] flex items-center justify-center hover:scale-105 transition-transform active:scale-95 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <Droplets size={48} className="text-bg-primary relative z-10" />
                                    </button>

                                    {/* Clickable Time Input Block */}
                                    <div className="relative w-28">
                                        <div
                                            className="input-field flex items-center justify-center gap-2 cursor-pointer relative py-2 px-0 text-center hover:border-accent-primary/50 transition-colors"
                                            onClick={() => document.getElementById('refill-time-input').showPicker()}
                                        >
                                            <Clock size={14} className="text-text-secondary" />
                                            <span className="text-white font-medium text-sm">{refillTime}</span>
                                            <input
                                                id="refill-time-input"
                                                type="time"
                                                value={refillTime}
                                                onChange={(e) => setRefillTime(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                    </div>

                                    <span className="font-bold text-accent-primary">Stanley Refill</span>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={() => setShowCustomModal(true)} className="p-4 rounded-full bg-bg-primary/50 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group">
                                        <Plus size={24} className="text-text-secondary group-hover:text-blue-400" />
                                    </button>
                                    <span className="text-xs text-text-secondary">Custom Add</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="card h-[300px]">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <History size={20} /> Weekly Trends
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0070f3" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0070f3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <ReferenceLine y={DAILY_GOAL} stroke="red" strokeDasharray="3 3" label={{ value: 'Goal', position: 'insideTopRight', fill: 'red' }} />
                                <Area type="monotone" dataKey="amount" stroke="#0070f3" fillOpacity={1} fill="url(#colorWater)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar: Stats & History */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-white mb-4">Today's Log</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {dayLog.history.filter(item => item.type !== 'Undo').length > 0 ? (
                                dayLog.history.slice().reverse().filter(item => item.type !== 'Undo').map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <div className="font-medium text-white">{item.type}</div>
                                            <div className="text-xs text-text-secondary">{item.time}</div>
                                        </div>
                                        <div className={`font-bold ${item.amount > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount}ml
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-text-secondary py-8">
                                    No water logged yet today.
                                </div>
                            )}
                        </div>
                    </div>

                    {analysis && (
                        <div className="card border-accent-primary/50 bg-accent-primary/5">
                            <h3 className="text-lg font-semibold text-accent-primary mb-2 flex items-center gap-2">
                                <Coffee size={20} /> AI Insights
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {analysis}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Entry Modal */}
            {showCustomModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="card w-full max-w-md m-4 relative">
                        <button onClick={() => setShowCustomModal(false)} className="absolute top-4 right-4 text-text-secondary hover:text-white">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-6">Add Water Intake</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Amount (ml)</label>
                                <input
                                    type="number"
                                    value={customEntry.amount}
                                    onChange={(e) => setCustomEntry({ ...customEntry, amount: e.target.value })}
                                    className="input-field text-lg"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={customEntry.date}
                                        onChange={(e) => setCustomEntry({ ...customEntry, date: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={customEntry.time}
                                        onChange={(e) => setCustomEntry({ ...customEntry, time: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <button onClick={handleCustomSubmit} className="w-full btn-primary mt-4 py-3">
                                Add Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaterTracker;
