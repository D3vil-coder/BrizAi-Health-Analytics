import React from 'react';
import { Home, Droplets, Moon, Utensils, Activity, Calendar, MessageSquare, User, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'water', icon: Droplets, label: 'Water' },
        { id: 'sleep', icon: Moon, label: 'Sleep' },
        { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
        { id: 'activity', icon: Activity, label: 'Activity' },
        { id: 'fitness', icon: Activity, label: 'Fitness' },
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="h-screen w-64 bg-bg-secondary/50 backdrop-blur-xl border-r border-white/10 flex flex-col p-4 fixed left-0 top-0 z-50">
            <div className="flex items-center gap-3 px-4 py-6 mb-6">
                <div className="w-8 h-8 rounded-full bg-accent-primary shadow-neon animate-pulse"></div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-accent-primary">
                    BrizAi
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[0_0_20px_rgba(0,255,157,0.1)]'
                                    : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary shadow-neon"></div>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-primary to-blue-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-text-secondary">Premium Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
