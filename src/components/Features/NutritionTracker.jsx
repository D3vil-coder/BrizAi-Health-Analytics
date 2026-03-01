import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeSection } from '../../services/aiService';
import { Utensils, Plus, Search, ChefHat } from 'lucide-react';

const NutritionTracker = () => {
    const { userProfile, getTodayLog, updateDailyLog } = useApp();
    const todayLog = getTodayLog();
    const nutritionLog = todayLog.nutrition || { meals: [] };
    const meals = nutritionLog.meals || [];

    const [newMeal, setNewMeal] = useState({ type: 'Lunch', items: '', time: '' });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const mealTypes = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

    const addMeal = () => {
        if (!newMeal.items) return;
        const meal = {
            ...newMeal,
            id: Date.now(),
            time: newMeal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const newLog = {
            ...nutritionLog,
            meals: [...meals, meal]
        };
        updateDailyLog('nutrition', newLog);
        setNewMeal({ ...newMeal, items: '', time: '' });
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeSection('Nutrition', {
                meals: meals,
                profile: userProfile
            }, userProfile);
            setAnalysis(result);
        } catch (error) {
            setAnalysis("Could not generate analysis. Please check your API settings.");
        }
        setIsAnalyzing(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Nutrition Tracker</h2>
                    <p className="text-text-secondary">Log meals and get AI diet suggestions</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyse Diet'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Meal Entry */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card space-y-4">
                        <h3 className="text-lg font-semibold text-white">Add Meal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <select
                                value={newMeal.type}
                                onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                                className="input-field"
                            >
                                {mealTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input
                                type="time"
                                value={newMeal.time}
                                onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                                className="input-field"
                            />
                            <input
                                type="text"
                                placeholder="e.g. 2 Rotis, Dal, Salad..."
                                value={newMeal.items}
                                onChange={(e) => setNewMeal({ ...newMeal, items: e.target.value })}
                                className="input-field md:col-span-2"
                            />
                        </div>
                        <button onClick={addMeal} className="w-full btn-primary flex items-center justify-center gap-2">
                            <Plus size={20} /> Add Meal
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Today's Meals</h3>
                        {meals.length === 0 ? (
                            <p className="text-text-secondary text-center py-8">No meals logged yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {meals.map((meal) => (
                                    <div key={meal.id} className="card p-4 flex justify-between items-center hover:bg-white/5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-accent-primary font-medium">{meal.type}</span>
                                                <span className="text-xs text-text-secondary">• {meal.time}</span>
                                            </div>
                                            <p className="text-white">{meal.items}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis Side */}
                <div className="space-y-6">
                    {analysis ? (
                        <div className="card border-green-500/50 bg-green-500/5 h-full">
                            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                <ChefHat size={20} /> Diet Analysis
                            </h3>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center text-center p-8 border-dashed border-white/20">
                            <Search size={48} className="text-text-secondary mb-4" />
                            <p className="text-text-secondary">
                                Log your meals and click "Analyse Diet" to get personalized nutrition advice and missing nutrients.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionTracker;
