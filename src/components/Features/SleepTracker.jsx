import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeSection } from '../../services/aiService';
import { Moon, Sun, Clock, Activity, Save, Plus, Trash2 } from 'lucide-react';
import { format, differenceInMinutes, parse, addDays, isBefore } from 'date-fns';

const SleepTracker = () => {
    const { userProfile, getTodayLog, updateDailyLog } = useApp();
    const todayLog = getTodayLog();
    const sleepLog = todayLog.sleep || { bedtime: '', wakeTime: '', quality: 'Neutral', naps: [] };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [napForm, setNapForm] = useState({ start: '', end: '' });
    const [showSaved, setShowSaved] = useState(false);

    // Calculate Duration with Cross-Day Logic OR use synced duration
    const duration = useMemo(() => {
        // Check for synced duration from Google Fit first
        if (sleepLog.duration && !sleepLog.bedtime && !sleepLog.wakeTime) {
            const totalMinutes = Math.round(sleepLog.duration * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return { hours, minutes, totalMinutes };
        }

        // Manual entry calculation
        if (!sleepLog.bedtime || !sleepLog.wakeTime) return null;

        const today = new Date();
        const bedDate = parse(sleepLog.bedtime, 'HH:mm', today);
        let wakeDate = parse(sleepLog.wakeTime, 'HH:mm', today);

        // If wake time is before bedtime, assume it's the next day
        if (isBefore(wakeDate, bedDate)) {
            wakeDate = addDays(wakeDate, 1);
        }

        const diffMinutes = differenceInMinutes(wakeDate, bedDate);
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;

        return { hours, minutes, totalMinutes: diffMinutes };
    }, [sleepLog.bedtime, sleepLog.wakeTime, sleepLog.duration]);

    const handleUpdate = (field, value) => {
        const newLog = { ...sleepLog, [field]: value };
        updateDailyLog('sleep', newLog);
    };

    const addNap = () => {
        if (!napForm.start || !napForm.end) return;

        const start = parse(napForm.start, 'HH:mm', new Date());
        const end = parse(napForm.end, 'HH:mm', new Date());
        const diff = differenceInMinutes(end, start);

        if (diff <= 0) return; // Invalid nap

        const newNap = {
            id: Date.now(),
            start: napForm.start,
            end: napForm.end,
            duration: diff
        };

        const newLog = {
            ...sleepLog,
            naps: [...(sleepLog.naps || []), newNap]
        };
        updateDailyLog('sleep', newLog);
        setNapForm({ start: '', end: '' });
    };

    const removeNap = (id) => {
        const newLog = {
            ...sleepLog,
            naps: sleepLog.naps.filter(n => n.id !== id)
        };
        updateDailyLog('sleep', newLog);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeSection('Sleep', {
                ...sleepLog,
                duration,
                profile: userProfile
            }, userProfile);
            setAnalysis(result);
        } catch (error) {
            setAnalysis("Could not generate analysis. Please check your API settings.");
        }
        setIsAnalyzing(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Sleep Tracker</h2>
                    <p className="text-text-secondary">Monitor your rest and recovery</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyse Sleep'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Sleep Log */}
                <div className="card space-y-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Moon className="text-purple-400" /> Night Sleep
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm text-text-secondary">Bedtime</label>
                            <div
                                className="input-field flex items-center justify-center gap-3 cursor-pointer relative p-3 hover:border-purple-500/50 transition-colors bg-bg-secondary/80"
                                onClick={() => document.getElementById('sleep-bedtime').showPicker()}
                            >
                                <Clock size={20} className="text-purple-400" />
                                <span className="text-white text-2xl font-medium">
                                    {sleepLog.bedtime
                                        ? format(parse(sleepLog.bedtime, 'HH:mm', new Date()), 'hh:mm a')
                                        : '--:-- --'}
                                </span>
                                <input
                                    id="sleep-bedtime"
                                    type="time"
                                    value={sleepLog.bedtime}
                                    onChange={(e) => handleUpdate('bedtime', e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm text-text-secondary">Wake Up</label>
                            <div
                                className="input-field flex items-center justify-center gap-3 cursor-pointer relative p-3 hover:border-purple-500/50 transition-colors bg-bg-secondary/80"
                                onClick={() => document.getElementById('sleep-waketime').showPicker()}
                            >
                                <Clock size={20} className="text-purple-400" />
                                <span className="text-white text-2xl font-medium">
                                    {sleepLog.wakeTime
                                        ? format(parse(sleepLog.wakeTime, 'HH:mm', new Date()), 'hh:mm a')
                                        : '--:-- --'}
                                </span>
                                <input
                                    id="sleep-waketime"
                                    type="time"
                                    value={sleepLog.wakeTime}
                                    onChange={(e) => handleUpdate('wakeTime', e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-sm font-medium text-text-secondary mb-3">Sleep Quality</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Poor', 'Neutral', 'Good', 'Excellent'].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleUpdate('quality', q)}
                                    className={`py-2 rounded-lg text-xs font-medium transition-all border
                    ${sleepLog.quality === q
                                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                                            : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-4">
                        {showSaved && <span className="text-green-400 text-sm animate-fade-in">Sleep logged successfully!</span>}
                        <button
                            onClick={() => {
                                setShowSaved(true);
                                setTimeout(() => setShowSaved(false), 3000);
                            }}
                            className="btn-primary flex items-center gap-2 bg-green-500 hover:bg-green-600"
                        >
                            <Save size={18} /> Log Sleep
                        </button>
                    </div>
                </div>

                {/* Stats & Naps */}
                <div className="space-y-6">
                    <div className="card flex flex-col items-center justify-center min-h-[180px] bg-gradient-to-br from-purple-900/20 to-bg-secondary">
                        <Clock size={40} className="text-purple-400 mb-3" />
                        <div className="text-center">
                            <h3 className="text-text-secondary mb-1">Total Duration</h3>
                            {duration ? (
                                <div className="text-4xl font-bold text-white">
                                    {duration.hours}<span className="text-xl text-text-secondary">h</span> {duration.minutes}<span className="text-xl text-text-secondary">m</span>
                                </div>
                            ) : (
                                <div className="text-xl text-text-secondary">-- h -- m</div>
                            )}
                        </div>
                    </div>

                    {/* Nap Section */}
                    <div className="card space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Sun size={20} className="text-yellow-400" /> Power Naps
                        </h3>

                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-text-secondary mb-1 block">Start</label>
                                <div
                                    className="input-field flex items-center justify-between cursor-pointer relative py-1 hover:border-accent-primary/50 transition-colors bg-bg-secondary/80"
                                    onClick={() => document.getElementById('nap-start').showPicker()}
                                >
                                    <span className="text-white text-sm font-medium">
                                        {napForm.start
                                            ? format(parse(napForm.start, 'HH:mm', new Date()), 'hh:mm a')
                                            : '--:-- --'}
                                    </span>
                                    <Clock size={14} className="text-accent-primary" />
                                    <input
                                        id="nap-start"
                                        type="time"
                                        value={napForm.start}
                                        onChange={(e) => setNapForm({ ...napForm, start: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-text-secondary mb-1 block">End</label>
                                <div
                                    className="input-field flex items-center justify-between cursor-pointer relative py-1 hover:border-accent-primary/50 transition-colors bg-bg-secondary/80"
                                    onClick={() => document.getElementById('nap-end').showPicker()}
                                >
                                    <span className="text-white text-sm font-medium">
                                        {napForm.end
                                            ? format(parse(napForm.end, 'HH:mm', new Date()), 'hh:mm a')
                                            : '--:-- --'}
                                    </span>
                                    <Clock size={14} className="text-accent-primary" />
                                    <input
                                        id="nap-end"
                                        type="time"
                                        value={napForm.end}
                                        onChange={(e) => setNapForm({ ...napForm, end: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>
                            <button onClick={addNap} className="btn-primary p-2 h-[38px] w-[38px] flex items-center justify-center">
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                            {sleepLog.naps?.map(nap => (
                                <div key={nap.id} className="flex justify-between items-center p-2 rounded bg-white/5 text-sm">
                                    <span className="text-white">{nap.start} - {nap.end}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-purple-400 font-medium">{nap.duration}m</span>
                                        <button onClick={() => removeNap(nap.id)} className="text-text-secondary hover:text-red-400">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(!sleepLog.naps || sleepLog.naps.length === 0) && (
                                <p className="text-xs text-text-secondary text-center py-2">No naps recorded.</p>
                            )}
                        </div>
                    </div>

                    {analysis && (
                        <div className="card border-purple-500/50 bg-purple-500/5">
                            <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
                                <Activity size={20} /> Sleep Insights
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {analysis}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SleepTracker;
