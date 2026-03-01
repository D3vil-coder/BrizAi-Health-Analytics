import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, User, Cpu, TrendingUp, Target } from 'lucide-react';

const Settings = () => {
    const { userProfile, setUserProfile, disconnectGoogleFit, googleFitToken } = useApp();
    const [formData, setFormData] = useState(userProfile);
    const [saved, setSaved] = useState(false);

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);

        // Auto-save AI-related settings immediately
        const aiFields = ['aiModel', 'geminiKey', 'geminiModel', 'ollamaUrl', 'ollamaModel'];
        if (aiFields.includes(field)) {
            setUserProfile(newData);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            console.log(`[Settings] Auto-saved ${field}:`, field.includes('Key') ? '***' : value);
        } else {
            setSaved(false);
        }
    };

    const handleSave = () => {
        setUserProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-1">Settings</h2>
                    <p className="text-text-secondary">Manage your profile and AI preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-primary flex items-center gap-2"
                >
                    <Save size={20} /> {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Section */}
                <div className="card space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-accent-primary" /> Profile Details
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Height (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => handleChange('height', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-secondary mb-1">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => handleChange('weight', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">Dietary Preferences</label>
                            <textarea
                                value={formData.dietaryPreferences}
                                onChange={(e) => handleChange('dietaryPreferences', e.target.value)}
                                placeholder="e.g. Vegetarian, Vegan, Gluten-free..."
                                className="input-field min-h-[80px]"
                            />
                        </div>
                    </div>
                </div>

                {/* AI Configuration */}
                <div className="card space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Cpu className="text-purple-400" /> AI Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-text-secondary mb-1">AI Provider</label>
                            <div className="flex gap-2 p-1 bg-bg-primary rounded-lg border border-white/10">
                                <button
                                    onClick={() => handleChange('aiModel', 'gemini')}
                                    className={`flex-1 py-2 rounded-md font-medium transition-all
                    ${formData.aiModel === 'gemini' ? 'bg-blue-600 text-white' : 'text-text-secondary hover:text-white'}`}
                                >
                                    Gemini
                                </button>
                                <button
                                    onClick={() => handleChange('aiModel', 'ollama')}
                                    className={`flex-1 py-2 rounded-md font-medium transition-all
                    ${formData.aiModel === 'ollama' ? 'bg-orange-600 text-white' : 'text-text-secondary hover:text-white'}`}
                                >
                                    Ollama
                                </button>
                            </div>
                        </div>

                        {formData.aiModel === 'gemini' ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Gemini API Key</label>
                                    <input
                                        type="password"
                                        value={formData.geminiKey}
                                        onChange={(e) => handleChange('geminiKey', e.target.value)}
                                        placeholder="Enter your Gemini API Key"
                                        className="input-field"
                                        autoComplete="off"
                                    />
                                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-300 flex items-start gap-2">
                                        <span>🔒</span>
                                        <div>
                                            <strong>Secure Storage:</strong> Your API key is stored locally in your browser (localStorage) and never sent to any third-party servers. It's only used to communicate directly with Google's API.
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Model Selection</label>
                                    <select
                                        value={formData.geminiModel || 'gemini-2.0-flash-lite'}
                                        onChange={(e) => handleChange('geminiModel', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="gemini-2.0-flash-lite">Flash Lite 2.0 (Best for high volume, generous limits)</option>
                                        <option value="gemini-2.5-flash">Flash 2.5 (Latest, best performance)</option>
                                        <option value="gemini-2.0-flash">Flash 2.0 (Experimental, balanced)</option>
                                        <option value="gemini-1.5-flash-002">Flash 1.5 (Stable, proven)</option>
                                        <option value="gemini-1.5-pro-002">Pro 1.5 (Most capable, higher cost)</option>
                                        <option value="gemini-pro">Pro (Legacy)</option>
                                    </select>
                                    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
                                        <strong>💡 Recommendation:</strong> Use Flash Lite 2.0 for production ($0.10/M input, $0.40/M output) with generous free tier limits.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Ollama API Endpoint</label>
                                    <input
                                        type="text"
                                        value={formData.ollamaUrl}
                                        onChange={(e) => handleChange('ollamaUrl', e.target.value)}
                                        placeholder="http://localhost:11434/api/generate"
                                        className="input-field"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Default: http://localhost:11434/api/generate</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Model Selection</label>
                                    <select
                                        value={formData.ollamaModel || 'llama3'}
                                        onChange={(e) => handleChange('ollamaModel', e.target.value)}
                                        className="input-field"
                                    >
                                        <optgroup label="Recommended for Health Coaching">
                                            <option value="llama3.2">Llama 3.2 (Latest, Balanced)</option>
                                            <option value="llama3.1">Llama 3.1 (High Quality)</option>
                                            <option value="llama3">Llama 3 (Fast, Reliable)</option>
                                            <option value="mistral">Mistral 7B (Fast)</option>
                                        </optgroup>
                                        <optgroup label="Larger Models (More Accurate)">
                                            <option value="llama3.1:70b">Llama 3.1 70B (Best Quality)</option>
                                            <option value="mixtral">Mixtral 8x7B (Expert Mixture)</option>
                                            <option value="qwen2.5">Qwen 2.5 (Multilingual)</option>
                                        </optgroup>
                                        <optgroup label="Specialized">
                                            <option value="gemma2">Gemma 2 (Google)</option>
                                            <option value="phi3">Phi-3 (Microsoft)</option>
                                            <option value="codellama">Code Llama (Technical)</option>
                                        </optgroup>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Or type a custom model name below:</p>
                                    <input
                                        type="text"
                                        value={formData.ollamaModel || ''}
                                        onChange={(e) => handleChange('ollamaModel', e.target.value)}
                                        placeholder="custom-model:tag"
                                        className="input-field mt-2"
                                    />
                                </div>
                                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                                    <h4 className="font-semibold text-green-400 mb-2">💰 Cost Savings with Ollama</h4>
                                    <p className="text-sm text-green-300/80">Running AI locally means <strong>zero API costs</strong> and complete privacy. All your health data stays on your machine.</p>
                                </div>
                                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <h4 className="font-semibold text-orange-400 mb-2">📋 Ollama Setup Guide</h4>
                                    <ol className="text-sm text-orange-300/80 space-y-1 list-decimal list-inside">
                                        <li>Install Ollama: <a href="https://ollama.ai" target="_blank" rel="noopener" className="underline">ollama.ai</a></li>
                                        <li>Open terminal and run: <code className="bg-black/30 px-1 rounded">ollama pull llama3.2</code></li>
                                        <li>Start server: <code className="bg-black/30 px-1 rounded">ollama serve</code></li>
                                        <li>Select your model above and start chatting!</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Integrations Section */}
                <div className="card space-y-6 md:col-span-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-green-400" /> Integrations
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <img src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" alt="Google Fit" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Google Fit</h4>
                                    <p className="text-xs text-text-secondary">Sync steps, sleep, and weight automatically</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-1">Google Client ID</label>
                                    <input
                                        type="text"
                                        value={formData.googleFitClientId || ''}
                                        onChange={(e) => handleChange('googleFitClientId', e.target.value)}
                                        placeholder="Enter your Google OAuth Client ID"
                                        className="input-field"
                                    />
                                    <p className="text-[10px] text-text-secondary mt-1 italic">
                                        Required for secure authentication with Google Services.
                                    </p>
                                </div>

                                {googleFitToken && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <p className="text-xs text-green-400 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Connected to Google Fit
                                        </p>
                                        <p className="text-[10px] text-green-300/60 mt-1">
                                            Token expires in ~1 hour. Reconnect if sync fails.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (!formData.googleFitClientId) {
                                                alert("Please enter a Client ID first.");
                                                return;
                                            }
                                            import('../../services/googleFitService').then(({ googleFitService }) => {
                                                googleFitService.authorize(formData.googleFitClientId);
                                            });
                                        }}
                                        className="btn-primary flex-1 py-2 text-sm"
                                    >
                                        {googleFitToken ? 'Reconnect' : 'Connect Google Fit'}
                                    </button>
                                    <button
                                        onClick={disconnectGoogleFit}
                                        disabled={!googleFitToken}
                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm disabled:opacity-50"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 text-sm text-blue-200/80">
                            <h5 className="font-semibold mb-2 flex items-center gap-2 text-blue-300">
                                <Target size={14} /> How to setup:
                            </h5>
                            <ol className="list-decimal list-inside space-y-2 text-xs">
                                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-accent-primary underline">Google Cloud Console</a></li>
                                <li>Create a project & enable <strong>Fitness API</strong></li>
                                <li>Go to <strong>OAuth consent screen</strong> and set state to <strong>Testing</strong></li>
                                <li><strong>Important:</strong> Under "Test users", add your Gmail address</li>
                                <li>Create <strong>OAuth 2.0 Client ID</strong> (Web Application)</li>
                                <li>Add <code>{window.location.origin}</code> to Authorized Redirect URIs</li>
                                <li>Paste the Client ID here and click Connect</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
