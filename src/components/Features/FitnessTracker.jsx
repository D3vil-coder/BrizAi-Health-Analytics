import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeSection } from '../../services/aiService';
import { Dumbbell, Play, Save, Activity, Footprints, Plus, Trash2 } from 'lucide-react';

const FitnessTracker = () => {
    const { userProfile, getTodayLog, updateDailyLog } = useApp();
    const todayLog = getTodayLog();
    const fitnessLog = todayLog.fitness || { workouts: [], steps: 0 };
    const workouts = fitnessLog.workouts || [];

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    // Form State
    const [mode, setMode] = useState('gym'); // 'gym' or 'walk'
    const [exerciseCategory, setExerciseCategory] = useState('Strength');
    const [exerciseType, setExerciseType] = useState('Custom');
    const [customExercise, setCustomExercise] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [duration, setDuration] = useState(''); // Manual duration input
    const [intensity, setIntensity] = useState('moderate'); // light, moderate, vigorous
    const [stepsInput, setStepsInput] = useState('');

    // Comprehensive Exercise Library with METs values from Compendium of Physical Activities
    const exerciseLibrary = {
        'Strength': {
            'Custom': 4.0,
            'Pushups': 3.8,
            'Pullups': 8.0,
            'Squats (Bodyweight)': 5.0,
            'Squats (Weighted)': 6.0,
            'Bench Press': 6.0,
            'Deadlift': 6.0,
            'Shoulder Press': 6.0,
            'Lunges': 4.0,
            'Plank': 3.0,
            'Dumbbell Rows': 5.0,
            'Bicep Curls': 3.5,
            'Tricep Dips': 4.0,
            'Leg Press': 5.0,
            'Lat Pulldown': 5.0,
            'Chest Fly': 4.0,
        },
        'Cardio': {
            'Custom': 6.0,
            'Running (Slow - 10 min/mile)': 9.8,
            'Running (Moderate - 8 min/mile)': 11.8,
            'Running (Fast - 6 min/mile)': 16.0,
            'Cycling (Leisurely)': 4.0,
            'Cycling (Moderate)': 8.0,
            'Cycling (Vigorous)': 12.0,
            'Swimming (Leisurely)': 6.0,
            'Swimming (Moderate)': 8.3,
            'Swimming (Vigorous)': 11.0,
            'Rowing Machine': 7.0,
            'Elliptical': 5.0,
            'Stair Climber': 9.0,
            'Jump Rope': 12.3,
            'Walking (Brisk)': 4.3,
            'Hiking': 6.0,
        },
        'HIIT & Functional': {
            'Custom': 8.0,
            'Burpees': 8.0,
            'Mountain Climbers': 8.0,
            'Jumping Jacks': 8.0,
            'Box Jumps': 8.0,
            'Kettlebell Swings': 9.5,
            'Battle Ropes': 10.3,
            'HIIT Circuit': 9.0,
            'CrossFit WOD': 9.0,
            'Tabata': 9.0,
        },
        'Sports': {
            'Custom': 6.0,
            'Basketball': 6.5,
            'Soccer': 7.0,
            'Tennis': 7.3,
            'Badminton': 5.5,
            'Volleyball': 4.0,
            'Table Tennis': 4.0,
            'Cricket': 5.0,
            'Golf (Walking)': 4.3,
        },
        'Yoga & Flexibility': {
            'Custom': 2.5,
            'Yoga (Hatha)': 2.5,
            'Yoga (Vinyasa)': 4.0,
            'Yoga (Power)': 5.5,
            'Pilates': 3.0,
            'Stretching': 2.3,
            'Foam Rolling': 2.0,
        }
    };

    const intensityMultipliers = {
        'light': 0.8,
        'moderate': 1.0,
        'vigorous': 1.2
    };

    const currentExercises = exerciseLibrary[exerciseCategory] || exerciseLibrary['Strength'];

    const addWorkout = () => {
        const name = exerciseType === 'Custom' ? customExercise : exerciseType;
        if (!name) return;

        // Get METs for this exercise
        const baseMets = currentExercises[exerciseType] || 4.0;

        const newWorkout = {
            id: Date.now(),
            name,
            category: exerciseCategory,
            sets: sets || '-',
            reps: reps || '-',
            weight: weight || '-',
            duration: duration || '',
            intensity: intensity,
            mets: baseMets
        };

        const newLog = {
            ...fitnessLog,
            workouts: [...workouts, newWorkout]
        };
        updateDailyLog('fitness', newLog);

        // Reset form
        if (exerciseType === 'Custom') setCustomExercise('');
        setSets('');
        setReps('');
        setWeight('');
        setDuration('');
        setIntensity('moderate');
    };

    const updateSteps = () => {
        if (!stepsInput) return;
        const newLog = {
            ...fitnessLog,
            steps: parseInt(stepsInput)
        };
        updateDailyLog('fitness', newLog);
        setStepsInput('');
    };

    const removeWorkout = (id) => {
        const newLog = {
            ...fitnessLog,
            workouts: workouts.filter(w => w.id !== id)
        };
        updateDailyLog('fitness', newLog);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeSection('Fitness', {
                workouts: fitnessLog.workouts,
                steps: fitnessLog.steps,
                profile: userProfile
            }, userProfile);
            setAnalysis(result);
        } catch (error) {
            setAnalysis("Could not generate analysis.");
        }
        setIsAnalyzing(false);
    };

    // Scientific Metrics Calculation - Updated to use stored data
    const calculateMetrics = (workout) => {
        const userWeight = userProfile.weight || 70; // Default 70kg

        // Use stored METs or fall back to estimation
        let baseMets = workout.mets || 4.0;

        // Apply intensity modifier
        const intensityMod = intensityMultipliers[workout.intensity] || 1.0;
        const mets = baseMets * intensityMod;

        // Calculate Duration (mins)
        // Priority: 1. Manual duration, 2. Estimate from sets/reps, 3. Default
        let durationMin = 10;

        if (workout.duration && parseInt(workout.duration) > 0) {
            // Use manual duration if provided
            durationMin = parseInt(workout.duration);
        } else {
            const sets = parseInt(workout.sets) || 0;
            const reps = parseInt(workout.reps) || 0;

            if (sets > 0 && reps > 0) {
                // Strength training: 3s per rep + 90s rest per set
                durationMin = sets * ((reps * 3 / 60) + 1.5);
            } else if (sets > 0) {
                // Assume sets are minutes for cardio if reps is empty/dash
                durationMin = sets;
            }
        }

        // Calorie formula: (METs × 3.5 × body weight in kg / 200) × duration in minutes
        const calories = Math.round((mets * 3.5 * userWeight / 200) * durationMin);

        // Step Equivalent: ~0.04 kcal per step
        const stepEquivalent = Math.round(calories / 0.04);

        return { calories, stepEquivalent };
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Fitness Tracker</h2>
                    <p className="text-text-secondary">Log your workouts and movement</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyse Workout'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mode Switcher */}
                    <div className="flex bg-white/5 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setMode('gym')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${mode === 'gym' ? 'bg-accent-primary text-bg-primary shadow-lg' : 'text-text-secondary hover:text-white'}
              `}
                        >
                            <Dumbbell size={18} /> Gym / Workout
                        </button>
                        <button
                            onClick={() => setMode('walk')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${mode === 'walk' ? 'bg-accent-primary text-bg-primary shadow-lg' : 'text-text-secondary hover:text-white'}
              `}
                        >
                            <Footprints size={18} /> Walk / Steps
                        </button>
                    </div>

                    {mode === 'gym' ? (
                        <div className="card border-t-4 border-t-accent-primary">
                            <h3 className="text-lg font-semibold text-white mb-4">Log Exercise</h3>

                            {/* Category Tabs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.keys(exerciseLibrary).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setExerciseCategory(cat); setExerciseType('Custom'); }}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all 
                                            ${exerciseCategory === cat
                                                ? 'bg-accent-primary text-bg-primary'
                                                : 'bg-white/10 text-text-secondary hover:bg-white/20 hover:text-white'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm text-text-secondary mb-1 block">Exercise</label>
                                    <select
                                        value={exerciseType}
                                        onChange={(e) => setExerciseType(e.target.value)}
                                        className="input-field mb-2"
                                    >
                                        {Object.keys(currentExercises).map(ex => (
                                            <option key={ex} value={ex}>{ex} ({currentExercises[ex]} METs)</option>
                                        ))}
                                    </select>
                                    {exerciseType === 'Custom' && (
                                        <input
                                            type="text"
                                            placeholder="Enter exercise name"
                                            value={customExercise}
                                            onChange={(e) => setCustomExercise(e.target.value)}
                                            className="input-field"
                                        />
                                    )}
                                </div>

                                {/* Sets and Reps for Strength exercises */}
                                {(exerciseCategory === 'Strength' || exerciseCategory === 'HIIT & Functional') && (
                                    <>
                                        <div>
                                            <label className="text-sm text-text-secondary mb-1 block">Sets</label>
                                            <input
                                                type="number"
                                                placeholder="3"
                                                value={sets}
                                                onChange={(e) => setSets(e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-text-secondary mb-1 block">Reps</label>
                                            <input
                                                type="number"
                                                placeholder="12"
                                                value={reps}
                                                onChange={(e) => setReps(e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-text-secondary mb-1 block">Weight (kg/lbs)</label>
                                            <input
                                                type="text"
                                                placeholder="20kg"
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Duration for Cardio, Sports, Yoga */}
                                <div>
                                    <label className="text-sm text-text-secondary mb-1 block">
                                        Duration (min) {exerciseCategory !== 'Strength' && <span className="text-accent-primary">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="30"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                {/* Intensity Selector */}
                                <div>
                                    <label className="text-sm text-text-secondary mb-1 block">Intensity</label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: 'light', label: 'Light', color: 'bg-blue-500' },
                                            { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
                                            { value: 'vigorous', label: 'Vigorous', color: 'bg-red-500' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setIntensity(opt.value)}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                                                    ${intensity === opt.value
                                                        ? `${opt.color} text-white`
                                                        : 'bg-white/10 text-text-secondary hover:bg-white/20'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-text-secondary mt-1">
                                        Intensity affects calorie calculation ({intensityMultipliers[intensity]}x)
                                    </p>
                                </div>
                            </div>

                            <button onClick={addWorkout} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Plus size={20} /> Add to Session
                            </button>
                        </div>
                    ) : (
                        <div className="card border-t-4 border-t-green-500">
                            <h3 className="text-lg font-semibold text-white mb-4">Daily Steps</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-sm text-text-secondary mb-1 block">Total Steps Today</label>
                                    <input
                                        type="number"
                                        placeholder={fitnessLog.steps || "0"}
                                        value={stepsInput}
                                        onChange={(e) => setStepsInput(e.target.value)}
                                        className="input-field text-2xl"
                                    />
                                </div>
                                <button onClick={updateSteps} className="btn-primary h-[50px] mt-6">
                                    Update
                                </button>
                            </div>
                            <div className="mt-6 p-4 bg-white/5 rounded-lg flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-full text-green-400">
                                    <Footprints size={24} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{fitnessLog.steps.toLocaleString()}</div>
                                    <div className="text-sm text-text-secondary">Steps Recorded (Goal: 10,000)</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Session History */}
                <div className="space-y-6">
                    <div className="card h-full flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4">Today's Session</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {/* Daily Steps Summary at Top */}
                            {fitnessLog.steps > 0 && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                                            <Footprints size={16} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">Daily Steps</div>
                                            <div className="text-xs text-text-secondary">{fitnessLog.steps} steps</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-green-400 font-medium">
                                        🔥 ~{Math.round(fitnessLog.steps * 0.04)} kcal
                                    </div>
                                </div>
                            )}

                            {workouts.map((workout) => {
                                const metrics = calculateMetrics(workout);
                                return (
                                    <div key={workout.id} className="p-3 rounded-lg bg-white/5 border border-white/5 group relative">
                                        <div className="font-medium text-white pr-6">{workout.name}</div>
                                        <div className="text-sm text-text-secondary mt-1 flex flex-wrap gap-3">
                                            <span>{workout.sets} sets</span>
                                            <span>×</span>
                                            <span>{workout.reps} reps</span>
                                            {workout.weight !== '-' && (
                                                <>
                                                    <span>@</span>
                                                    <span className="text-accent-primary">{workout.weight}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                            <span className="flex items-center gap-1">🔥 ~{metrics.calories} kcal</span>
                                            <span className="flex items-center gap-1">👣 ~{metrics.stepEquivalent} steps (eq)</span>
                                        </div>
                                        <button
                                            onClick={() => removeWorkout(workout.id)}
                                            className="absolute top-3 right-3 text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                            {workouts.length === 0 && (fitnessLog.steps || 0) === 0 && (
                                <p className="text-text-secondary text-center py-10">No activity logged.</p>
                            )}
                        </div>
                    </div>

                    {analysis && (
                        <div className="card border-accent-primary/50 bg-accent-primary/5">
                            <h3 className="text-lg font-semibold text-accent-primary mb-2 flex items-center gap-2">
                                <Activity size={20} /> Coach Insights
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

export default FitnessTracker;
