'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Workspace {
    id: string;
    name: string;
    genre: string | null;
    board_state?: any;
}

interface WorkspaceContextType {
    activeWorkspace: Workspace | null;
    setActiveWorkspace: (workspace: Workspace | null) => void;
    previewContent: string;
    setPreviewContent: React.Dispatch<React.SetStateAction<string>>;
    isPreviewing: boolean;
    setIsPreviewing: (val: boolean) => void;
    selectedText: string;
    setSelectedText: React.Dispatch<React.SetStateAction<string>>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
    const [selectedText, setSelectedText] = useState<string>('');

    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const res = await fetch('/api/workspaces/active');
                if (res.ok) {
                    const data = await res.json();
                    setActiveWorkspace(data);
                } else if (res.status === 401) {
                    // Not authenticated
                    console.log('User not authenticated, skipping workspace fetch.');
                }
            } catch (err) {
                console.error('Failed to fetch active workspace:', err);
            }
        };

        fetchWorkspace();
    }, []);

    return (
        <WorkspaceContext.Provider value={{
            activeWorkspace, setActiveWorkspace,
            previewContent, setPreviewContent,
            isPreviewing, setIsPreviewing,
            selectedText, setSelectedText
        }}>
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
