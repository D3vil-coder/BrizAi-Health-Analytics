import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
