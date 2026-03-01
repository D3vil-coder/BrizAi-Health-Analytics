import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };

    return (
        <div
            className={`
                ${sizes[size]} 
                border-accent-primary border-t-transparent 
                rounded-full animate-spin 
                ${className}
            `}
        />
    );
};

export const LoadingOverlay = ({ message = 'Loading...' }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="card text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-white font-medium">{message}</p>
        </div>
    </div>
);

export const SkeletonCard = ({ className = '' }) => (
    <div className={`card animate-pulse ${className}`}>
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-white/10 rounded w-2/3 mb-2"></div>
        <div className="h-2 bg-white/10 rounded w-full"></div>
    </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
    <div className={`animate-pulse space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className={`h-3 bg-white/10 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
            />
        ))}
    </div>
);

export const ButtonLoading = ({ isLoading, children, ...props }) => (
    <button {...props} disabled={isLoading || props.disabled}>
        {isLoading ? (
            <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading...
            </span>
        ) : children}
    </button>
);

export default LoadingSpinner;
