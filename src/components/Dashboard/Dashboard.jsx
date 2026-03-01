import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Droplets, Moon, Flame, TrendingUp, Heart, Brain, Zap, Target, Plus, Utensils, Footprints, ArrowRight } from 'lucide-react';
import { format, parse, differenceInMinutes, addDays, isBefore } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { generateAIResponse } from '../../services/aiService';

const Dashboard = () => {
    const { userProfile, getTodayLog } = useApp();
    const todayLog = getTodayLog();
    const [isGenerating, setIsGenerating] = useState(false);
    const [dailyReport, setDailyReport] = useState(null);

    // --- Helper Functions ---
    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getGapMessage = (current, goal, unit) => {
        const gap = goal - current;
        if (gap <= 0) return { text: '🎉 Goal achieved!', color: 'text-green-400' };
        return { text: `${gap} ${unit} to goal`, color: 'text-orange-400' };
    };

    const getScoreMessage = (score) => {
        if (score >= 80) return { text: "Excellent! You're crushing it today! 💪", color: 'text-green-400' };
        if (score >= 60) return { text: "Good progress! Keep pushing forward! 🌟", color: 'text-blue-400' };
        if (score >= 40) return { text: "You're on your way - small steps matter! 🚀", color: 'text-yellow-400' };
        return { text: "Every journey starts somewhere - let's go! 🌱", color: 'text-orange-400' };
    };

    // --- Derived Stats & Calculations ---

    // 1. Water
    const waterGoal = userProfile.weight ? Math.round(userProfile.weight * 35) : 2500;
    const waterLog = todayLog.water || { refills: 0, custom: 0 };
    const waterCurrent = ((waterLog.refills || 0) * 1180) + (waterLog.custom || 0);
    const waterPercentage = Math.min(100, Math.round((waterCurrent / waterGoal) * 100));
    const waterGap = getGapMessage(waterCurrent, waterGoal, 'ml');

    // 2. Sleep
    const sleepLog = todayLog.sleep || {};
    let sleepDuration = 0;

    // Check for imported duration (from Google Fit) first
    if (sleepLog.duration) {
        sleepDuration = sleepLog.duration;
    } else if (sleepLog.bedtime && sleepLog.wakeTime) {
        // Manual entry with bedtime/wakeTime
        const today = new Date();
        const bedDate = parse(sleepLog.bedtime, 'HH:mm', today);
        let wakeDate = parse(sleepLog.wakeTime, 'HH:mm', today);

        if (isBefore(wakeDate, bedDate)) {
            wakeDate = addDays(wakeDate, 1);
        }

        const diffMinutes = differenceInMinutes(wakeDate, bedDate);
        sleepDuration = diffMinutes / 60;
    }

    const sleepGoal = 8;
    const sleepPercentage = Math.min(100, Math.round((sleepDuration / sleepGoal) * 100));
    const sleepGap = sleepDuration > 0
        ? (sleepDuration >= sleepGoal
            ? { text: '🎉 Well rested!', color: 'text-green-400' }
            : { text: `${(sleepGoal - sleepDuration).toFixed(1)}h more recommended`, color: 'text-orange-400' })
        : { text: 'Log your sleep!', color: 'text-text-secondary' };

    // 3. Nutrition
    const nutritionLog = todayLog.nutrition;
    const macros = useMemo(() => {
        const meals = nutritionLog?.meals || [];
        let p = 0, c = 0, f = 0, cal = 0;
        meals.forEach(meal => {
            p += parseInt(meal.protein || 0);
            c += parseInt(meal.carbs || 0);
            f += parseInt(meal.fats || 0);
            cal += parseInt(meal.calories || 0);
        });
        return { protein: p, carbs: c, fats: f, calories: cal };
    }, [nutritionLog]);

    const mealsLogged = nutritionLog?.meals ? nutritionLog.meals.length : 0;
    const mealsGap = mealsLogged >= 3
        ? { text: '🎉 Meals tracked!', color: 'text-green-400' }
        : { text: `${3 - mealsLogged} meals to log`, color: 'text-orange-400' };

    // 4. Activity / Fitness
    const fitnessLog = todayLog.fitness || { workouts: [], steps: 0 };
    const stepsGoal = 10000;
    const stepsPercentage = Math.min(100, Math.round(((fitnessLog.steps || 0) / stepsGoal) * 100));
    const stepsGap = getGapMessage((fitnessLog.steps || 0), stepsGoal, 'steps');

    const caloriesBurned = 400 + ((fitnessLog.steps || 0) * 0.04);

    // 5. Health Score
    const healthScore = useMemo(() => {
        let score = 0;

        // Hydration (30 points)
        const hydrationScore = Math.min(30, (waterCurrent / waterGoal) * 30);
        score += hydrationScore;

        // Sleep (30 points)
        let sleepScore = 0;
        if (sleepDuration >= 7 && sleepDuration <= 9) sleepScore = 30;
        else if (sleepDuration >= 6 && sleepDuration < 7) sleepScore = 20;
        else if (sleepDuration > 9 && sleepDuration <= 10) sleepScore = 25;
        else if (sleepDuration > 0 && sleepDuration < 6) sleepScore = 10;
        score += sleepScore;

        // Activity (20 points)
        let activityScore = 0;
        if (fitnessLog.steps >= 10000) activityScore = 20;
        else if (fitnessLog.steps >= 7500) activityScore = 15;
        else if (fitnessLog.steps >= 5000) activityScore = 10;
        else activityScore = (fitnessLog.steps / 5000) * 5;
        score += activityScore;

        // Nutrition (20 points)
        const nutritionScore = Math.min(20, mealsLogged * 7);
        score += nutritionScore;

        return Math.round(score);
    }, [waterCurrent, waterGoal, sleepDuration, fitnessLog.steps, mealsLogged]);

    const scoreMessage = getScoreMessage(healthScore);

    // Chart Data
    const macroData = [
        { name: 'Protein', value: macros.protein, color: '#8b5cf6' },
        { name: 'Carbs', value: macros.carbs, color: '#3b82f6' },
        { name: 'Fats', value: macros.fats, color: '#10b981' },
    ];
    const activeMacroData = macroData.filter(d => d.value > 0);
    const showMacroChart = activeMacroData.length > 0;

    // Generate Daily Report
    const handleGenerateReport = async () => {
        setIsGenerating(true);
        try {
            const context = `User: ${userProfile.name}, Weight: ${userProfile.weight}kg, Age: ${userProfile.age}
Today's Data:
- Water: ${waterCurrent}ml / ${waterGoal}ml (${waterPercentage}%)
- Sleep: ${sleepDuration.toFixed(1)} hours
- Steps: ${fitnessLog.steps} / ${stepsGoal}
- Calories In: ${macros.calories}, Calories Out: ~${Math.round(caloriesBurned)}
- Meals Logged: ${mealsLogged}
- Health Score: ${healthScore}/100`;

            const prompt = `Generate a brief, personalized daily health report. Include:
1. Overall assessment (2 sentences)
2. Top 2-3 specific recommendations for improvement
3. One encouraging message

Keep it concise, actionable, and friendly. Use emojis sparingly.`;

            const report = await generateAIResponse(prompt, context, userProfile);
            setDailyReport(report);
        } catch (error) {
            console.error('Report generation failed:', error);
            setDailyReport('Unable to generate report. Please check your AI settings.');
        }
        setIsGenerating(false);
    };

    const { googleFitToken, importHealthData, dailyLogs } = useApp();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        if (!googleFitToken) {
            alert("Please connect Google Fit in Settings first.");
            return;
        }
        setIsSyncing(true);
        try {
            console.log('[Sync] Starting with token:', googleFitToken?.substring(0, 20) + '...');
            const { googleFitService } = await import('../../services/googleFitService');

            // Always sync at least from start of today, or 3 days ago if never synced
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0);

            // Default to 3 days ago for first sync, or today midnight for subsequent syncs
            let startTime = todayMidnight.getTime() - (3 * 24 * 60 * 60 * 1000);

            const endTime = new Date().getTime();

            console.log('[Sync] Date range:', new Date(startTime).toISOString(), 'to', new Date(endTime).toISOString());

            const data = await googleFitService.fetchData(googleFitToken, startTime, endTime);

            console.log('[Sync] Raw API response:', JSON.stringify(data, null, 2));

            // Map the daily buckets
            const stepBuckets = data.steps || [];
            console.log('[Sync] Step buckets:', stepBuckets.length);
            console.log('[Sync] Calories buckets:', data.calories?.length || 0);
            console.log('[Sync] Sleep sessions:', data.sleep?.length || 0);

            if (stepBuckets.length === 0) {
                alert('No step data found. Check console for raw API response.');
                setIsSyncing(false);
                return;
            }

            stepBuckets.forEach((bucket, index) => {
                const dateKey = format(new Date(parseInt(bucket.startTimeMillis)), 'yyyy-MM-dd');

                const mappedData = {
                    steps: bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0,
                    calories: Math.round(data.calories?.[index]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0),
                    weight: data.weight?.[index]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || null,
                };

                // Add sleep if it matches this day
                if (data.sleep) {
                    const bStart = parseInt(bucket.startTimeMillis);
                    const bEnd = parseInt(bucket.endTimeMillis);
                    const dailySleep = data.sleep
                        .filter(s => {
                            const sStart = parseInt(s.startTimeMillis);
                            return sStart >= bStart && sStart < bEnd;
                        })
                        .reduce((acc, s) => acc + (parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis)), 0);

                    if (dailySleep > 0) {
                        mappedData.sleepDuration = dailySleep / (1000 * 60 * 60);
                    }
                }

                console.log('[Sync] Importing for', dateKey, ':', mappedData);
                importHealthData(dateKey, mappedData);
            });

            alert(`✅ Synced ${stepBuckets.length} day(s) successfully!`);
        } catch (error) {
            console.error('[Sync] Full error:', error);
            let msg = 'Sync failed. ';
            if (error.message?.includes('401') || error.message?.includes('403')) {
                msg += 'Token expired. Reconnect in Settings.';
            } else {
                msg += error.message || 'Unknown error';
            }
            alert(msg);
        }
        setIsSyncing(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Hero Section: Health Score */}
            <div className="card relative overflow-hidden bg-gradient-to-br from-bg-secondary to-bg-primary border border-white/10">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-4">
                    {/* Left: Welcome */}
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-4 mb-2 justify-center md:justify-start">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Hello, <span className="bg-gradient-to-r from-accent-primary to-green-400 bg-clip-text text-transparent">{userProfile.name || 'User'}</span>
                            </h1>
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all
                                    ${isSyncing ? 'bg-white/5 text-text-secondary cursor-not-allowed' : 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/20'}`}
                            >
                                <TrendingUp size={14} className={isSyncing ? 'animate-spin' : ''} />
                                {isSyncing ? 'Syncing...' : 'Sync Health'}
                            </button>
                        </div>
                        <p className="text-text-secondary">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
                        {todayLog.syncedAt && (
                            <p className="text-[10px] text-green-400/60 mt-1">
                                ✓ Last synced: {format(new Date(todayLog.syncedAt), 'HH:mm')}
                            </p>
                        )}
                        <p className={`mt-3 text-sm font-medium ${scoreMessage.color}`}>{scoreMessage.text}</p>
                    </div>

                    {/* Right: Health Score */}
                    <div className="flex flex-col items-center">
                        <div className="text-sm text-text-secondary mb-2 flex items-center gap-2">
                            <Target size={16} className="text-accent-primary" />
                            Daily Health Score
                        </div>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="64" cy="64" r="56" strokeWidth="8" stroke="rgba(255,255,255,0.1)" fill="none" />
                                <circle
                                    cx="64" cy="64" r="56" strokeWidth="8" stroke="url(#scoreGradient)" fill="none"
                                    strokeLinecap="round" strokeDasharray={`${healthScore * 3.52} 352`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#00ff9d" />
                                        <stop offset="100%" stopColor="#00cc7d" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">{healthScore}</div>
                                <div className="text-xs text-text-secondary">/100</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Water Widget */}
                <div className="card relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Droplets size={70} />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Droplets size={16} className="text-blue-400" />
                        </div>
                        <h3 className="text-text-secondary text-sm font-medium">Hydration</h3>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {waterCurrent} <span className="text-sm font-normal text-text-secondary">/ {waterGoal}ml</span>
                    </div>
                    <div className={`text-xs ${waterGap.color} mb-3`}>{waterGap.text}</div>
                    <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 ${getProgressColor(waterPercentage)} rounded-full transition-all duration-1000`}
                            style={{ width: `${waterPercentage}%` }}
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${waterPercentage > 50 ? 'text-white' : 'text-text-secondary'}`}>
                            {waterPercentage}%
                        </span>
                    </div>
                </div>

                {/* Sleep Widget */}
                <div className="card relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Moon size={70} />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Moon size={16} className="text-purple-400" />
                        </div>
                        <h3 className="text-text-secondary text-sm font-medium">Sleep</h3>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {sleepDuration > 0 ? `${Math.floor(sleepDuration)}h ${Math.round((sleepDuration % 1) * 60)}m` : '--'}
                        <span className="text-sm font-normal text-text-secondary"> / 8h</span>
                    </div>
                    <div className={`text-xs ${sleepGap.color} mb-3`}>{sleepGap.text}</div>
                    <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 ${getProgressColor(sleepPercentage)} rounded-full transition-all duration-1000`}
                            style={{ width: `${sleepPercentage}%` }}
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${sleepPercentage > 50 ? 'text-white' : 'text-text-secondary'}`}>
                            {sleepPercentage}%
                        </span>
                    </div>
                </div>

                {/* Calories Widget */}
                <div className="card relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Flame size={70} />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Flame size={16} className="text-orange-400" />
                        </div>
                        <h3 className="text-text-secondary text-sm font-medium">Calories</h3>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                        <div>
                            <div className="text-2xl font-bold text-white">{macros.calories}</div>
                            <div className="text-xs text-green-400">Consumed</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-orange-400">{Math.round(caloriesBurned)}</div>
                            <div className="text-xs text-orange-400/70">Burned</div>
                        </div>
                    </div>
                    <div className={`text-xs ${mealsGap.color} mb-1`}>{mealsGap.text}</div>
                    <div className="text-xs text-text-secondary border-t border-white/10 pt-2 mt-2">
                        Net: <span className={macros.calories - caloriesBurned > 0 ? 'text-green-400' : 'text-orange-400'}>
                            {Math.round(macros.calories - caloriesBurned)} kcal
                        </span>
                    </div>
                </div>

                {/* Steps Widget */}
                <div className="card relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={70} />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Footprints size={16} className="text-green-400" />
                        </div>
                        <h3 className="text-text-secondary text-sm font-medium">Activity</h3>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {fitnessLog.steps.toLocaleString()} <span className="text-sm font-normal text-text-secondary">steps</span>
                    </div>
                    <div className={`text-xs ${stepsGap.color} mb-3`}>{stepsGap.text}</div>
                    <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`absolute inset-y-0 left-0 ${getProgressColor(stepsPercentage)} rounded-full transition-all duration-1000`}
                            style={{ width: `${stepsPercentage}%` }}
                        />
                        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${stepsPercentage > 50 ? 'text-white' : 'text-text-secondary'}`}>
                            {stepsPercentage}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card h-[320px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Utensils size={18} className="text-purple-400" />
                        Nutrition Breakdown
                    </h3>
                    {showMacroChart ? (
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={activeMacroData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {activeMacroData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => `${value}g`}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
                            <Utensils size={40} className="mb-3 opacity-30" />
                            <p className="text-sm">No nutrition data logged today</p>
                            <p className="mt-2 text-xs text-accent-primary">Use the Nutrition tracker in sidebar →</p>
                        </div>
                    )}
                </div>

                <div className="card h-[320px] flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        <Activity size={18} className="text-green-400" />
                        Activity Progress
                    </h3>
                    <div className="flex-1 min-h-0 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-text-secondary">Steps</span>
                                    <span className="text-sm font-medium text-white">{fitnessLog.steps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
                                </div>
                                <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${stepsPercentage}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                        {stepsPercentage}%
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-text-secondary">Workouts</span>
                                    <span className="text-sm font-medium text-white">{fitnessLog.workouts?.length || 0} logged</span>
                                </div>
                                <div className="relative h-6 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (fitnessLog.workouts?.length || 0) * 50)}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                        {fitnessLog.workouts?.length || 0} / 2+
                                    </span>
                                </div>
                            </div>

                            <div className="text-center pt-2">
                                <p className="text-xs text-text-secondary">Use the Fitness tracker in sidebar to log workouts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Report Section */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Brain size={20} className="text-accent-primary" />
                        AI Health Report
                    </h3>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Brain size={16} />
                                Generate Report
                            </>
                        )}
                    </button>
                </div>

                {dailyReport ? (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                            {dailyReport}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-text-secondary">
                        <Brain size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Click "Generate Report" to get personalized AI insights based on today's data</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
