'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Workspace {
    id: string;
    name: string;
    genre: string | null;
}

interface WorkspaceContextType {
    activeWorkspace: Workspace | null;
    setActiveWorkspace: (workspace: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    // For now, default to a mock workspace ID for early development testing
    // In production, this will load from the Supabase Workspaces table on mount
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>({
        id: 'mock-ws-1234',
        name: 'The Obsidian Crown',
        genre: 'Sci-Fi Fantasy',
    });

    return (
        <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
