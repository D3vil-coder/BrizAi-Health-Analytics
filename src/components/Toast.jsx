import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Return a no-op toast if not inside provider (for safety)
        return {
            success: () => { },
            error: () => { },
            warning: () => { },
            info: () => { }
        };
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration || 6000), // Errors stay longer
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {toasts.map(({ id, message, type }) => (
                    <Toast key={id} message={message} type={type} onClose={() => removeToast(id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ message, type, onClose }) => {
    const icons = {
        success: <CheckCircle size={20} className="text-green-400 shrink-0" />,
        error: <AlertCircle size={20} className="text-red-400 shrink-0" />,
        warning: <AlertTriangle size={20} className="text-orange-400 shrink-0" />,
        info: <Info size={20} className="text-blue-400 shrink-0" />
    };

    const colors = {
        success: 'border-green-500/50 bg-green-500/10',
        error: 'border-red-500/50 bg-red-500/10',
        warning: 'border-orange-500/50 bg-orange-500/10',
        info: 'border-blue-500/50 bg-blue-500/10'
    };

    return (
        <div
            className={`
                ${colors[type]} 
                bg-bg-secondary border rounded-lg p-4 shadow-lg 
                animate-slide-in-right flex items-start gap-3
                backdrop-blur-sm
            `}
        >
            {icons[type]}
            <p className="flex-1 text-white text-sm">{message}</p>
            <button
                onClick={onClose}
                className="text-text-secondary hover:text-white transition-colors shrink-0"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default ToastProvider;
