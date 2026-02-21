'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type PhaseContextType = {
    activePhase: string;
    setActivePhase: (id: string) => void;
};

const PhaseContext = createContext<PhaseContextType | undefined>(undefined);

export function PhaseProvider({ children }: { children: ReactNode }) {
    const [activePhase, setActivePhase] = useState('4');

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
