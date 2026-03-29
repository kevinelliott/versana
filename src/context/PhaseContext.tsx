'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type PhaseContextType = {
    activePhase: string;
    setActivePhase: (id: string) => void;
};

const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export function PhaseProvider({ children }: { children: ReactNode }) {
    const [activePhase, setActivePhase] = useState('0');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Cmd (Mac) or Ctrl (Windows) + number keys
            // Ignore if we are typing inside an input/textarea unless we strictly catch Cmd+Num
            if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey) {
                const key = e.key;
                if (['0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(key)) {
                    e.preventDefault();
                    setActivePhase(key);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <PhaseContext.Provider value={{ activePhase, setActivePhase }}>
            {children}
        </PhaseContext.Provider>
    );
}

export function usePhase() {
    const context = useContext(PhaseContext);
    if (!context) {
        throw new Error('usePhase must be used within a PhaseProvider');
    }
    return context;
}
