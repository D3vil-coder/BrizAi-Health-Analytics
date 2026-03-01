import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Initial State
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : {
            name: 'User',
            height: '',
            weight: '',
            age: '',
            gender: '',
            dietaryPreferences: '',
            geminiKey: '',
            aiModel: 'gemini', // 'gemini' or 'ollama'
            geminiModel: 'gemini-2.0-flash-lite', // Selected Gemini model
            ollamaUrl: 'http://localhost:11434/api/generate',
            ollamaModel: 'llama3',
            googleFitClientId: '',
            syncStatus: { lastSynced: null, isSyncing: false, error: null }
        };
    });

    const [googleFitToken, setGoogleFitToken] = useState(() => {
        return localStorage.getItem('googleFitToken') || null;
    });

    const [dailyLogs, setDailyLogs] = useState(() => {
        const saved = localStorage.getItem('dailyLogs');
        return saved ? JSON.parse(saved) : {};
    });

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('googleFitToken', googleFitToken || '');
    }, [googleFitToken]);

    useEffect(() => {
        localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    }, [dailyLogs]);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Handle Google Fit Redirect
    useEffect(() => {
        const handleRedirect = () => {
            const hash = window.location.hash;
            if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1));
                const token = params.get('access_token');
                const expiresIn = params.get('expires_in'); // Usually 3600 seconds (1 hour)

                if (token) {
                    const expirationTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);

                    // Save token with expiration
                    setGoogleFitToken(token);
                    localStorage.setItem('googleFitTokenExpiry', expirationTime.toString());

                    // Update sync status
                    setUserProfile(prev => ({
                        ...prev,
                        syncStatus: { ...prev.syncStatus, lastSynced: new Date().toISOString() }
                    }));

                    // Clear hash for cleaner URL
                    window.history.replaceState(null, null, window.location.pathname);
                }
            }
        };
        handleRedirect();
    }, []);

    // Validate token on load
    useEffect(() => {
        if (googleFitToken) {
            const expiry = localStorage.getItem('googleFitTokenExpiry');
            if (expiry && Date.now() > parseInt(expiry)) {
                // Token expired, clear it
                setGoogleFitToken(null);
                localStorage.removeItem('googleFitTokenExpiry');
                setUserProfile(prev => ({
                    ...prev,
                    syncStatus: { ...prev.syncStatus, error: 'Token expired. Please reconnect Google Fit.' }
                }));
            }
        }
    }, []);

    // Helper to get today's log key
    const getTodayKey = () => new Date().toISOString().split('T')[0];

    // Log Actions
    const updateDailyLog = (section, data, date = getTodayKey()) => {
        setDailyLogs(prev => {
            const targetLog = prev[date] || {};
            return {
                ...prev,
                [date]: {
                    ...targetLog,
                    [section]: data
                }
            };
        });
    };

    const importHealthData = (date, healthData) => {
        setDailyLogs(prev => {
            const targetLog = prev[date] || {};

            // Map Fit data to BrizAi structure
            const fitnessData = {
                ...targetLog.fitness,
                steps: healthData.steps ?? targetLog.fitness?.steps ?? 0,
                caloriesExpended: healthData.calories ?? targetLog.fitness?.caloriesExpended ?? 0
            };

            const sleepData = healthData.sleepDuration ? {
                ...targetLog.sleep,
                duration: healthData.sleepDuration,
                quality: healthData.sleepQuality || targetLog.sleep?.quality || 'Good'
            } : targetLog.sleep;

            return {
                ...prev,
                [date]: {
                    ...targetLog,
                    fitness: fitnessData,
                    sleep: sleepData,
                    syncedAt: new Date().toISOString()
                }
            };
        });

        // Update profile if weight/height imported
        if (healthData.weight || healthData.height) {
            setUserProfile(prev => ({
                ...prev,
                weight: healthData.weight || prev.weight || '',
                height: healthData.height || prev.height || ''
            }));
        }
    };

    const disconnectGoogleFit = () => {
        setGoogleFitToken(null);
        setUserProfile(prev => ({
            ...prev,
            syncStatus: { ...prev.syncStatus, lastSynced: null }
        }));
    };

    const getTodayLog = () => {
        const dateKey = getTodayKey();
        return dailyLogs[dateKey] || {};
    };

    return (
        <AppContext.Provider value={{
            userProfile,
            setUserProfile,
            googleFitToken,
            setGoogleFitToken,
            dailyLogs,
            updateDailyLog,
            importHealthData,
            disconnectGoogleFit,
            getTodayLog,
            tasks,
            setTasks
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
