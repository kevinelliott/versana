'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Workspace {
    id: string;
    name: string;
    genre: string | null;
    custom_instructions?: string | null;
    board_state?: Record<string, unknown>;
}

export interface Book {
    id: string;
    workspace_id: string;
    title: string;
    genre: string | null;
    blurb: string;
    cover_image_url: string;
    is_public?: boolean;
    total_views?: number;
    total_likes?: number;
    pen_name_id?: string;
    target_word_count?: number;
    target_date?: string;
}

export interface Chapter {
    id: string;
    workspace_id: string;
    title: string;
    content: Record<string, unknown> | null; // TipTap JSON
    word_count: number;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface TypographySettings {
    fontFamily: 'serif' | 'sans' | 'mono';
    fontSize: number;
    lineHeight: number;
    maxWidth: number;
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
    chapters: Chapter[];
    setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
    currentChapterId: string | null;
    setCurrentChapterId: React.Dispatch<React.SetStateAction<string | null>>;
    isLeftSidebarOpen: boolean;
    setIsLeftSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isManuscriptNavOpen: boolean;
    setIsManuscriptNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isRightSidebarOpen: boolean;
    setIsRightSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    activeBook: Book | null;
    setActiveBook: (book: Book | null) => void;
    books: Book[];
    setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contextToggles: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setContextToggles: React.Dispatch<React.SetStateAction<any[]>>;
    isContextMatrixDetached: boolean;
    setIsContextMatrixDetached: React.Dispatch<React.SetStateAction<boolean>>;
    isFocusMode: boolean;
    setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
    isTypewriterMode: boolean;
    setIsTypewriterMode: React.Dispatch<React.SetStateAction<boolean>>;
    selectedLoreId: string | null;
    setSelectedLoreId: React.Dispatch<React.SetStateAction<string | null>>;
    wordCount: number;
    setWordCount: React.Dispatch<React.SetStateAction<number>>;
    readabilityScore: string;
    setReadabilityScore: React.Dispatch<React.SetStateAction<string>>;
    aiChatInitialPrompt: string | null;
    setAiChatInitialPrompt: React.Dispatch<React.SetStateAction<string | null>>;
    needsOnboarding: boolean;
    setNeedsOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
    typography: TypographySettings;
    setTypography: React.Dispatch<React.SetStateAction<TypographySettings>>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
    const [selectedText, setSelectedText] = useState<string>('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
    const [isManuscriptNavOpen, setIsManuscriptNavOpen] = useState<boolean>(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
    const [isContextMatrixDetached, setIsContextMatrixDetached] = useState<boolean>(false);
    const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
    const [isTypewriterMode, setIsTypewriterMode] = useState<boolean>(false);
    const [activeBook, setActiveBook] = useState<Book | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [contextToggles, setContextToggles] = useState<any[]>([]);
    const [selectedLoreId, setSelectedLoreId] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState<number>(0);
    const [readabilityScore, setReadabilityScore] = useState<string>('N/A');
    const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string | null>(null);
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
    
    // Load typography from localStorage
    const [typography, setTypography] = useState<TypographySettings>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('versana_typography');
            if (saved) return JSON.parse(saved);
        }
        return {
            fontFamily: 'serif',
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 800
        };
    });

    // Save typography on change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('versana_typography', JSON.stringify(typography));
        }
    }, [typography]);

    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const res = await fetch('/api/workspaces/active');
                if (res.ok) {
                    const data = await res.json();
                    if (data.noWorkspaces) {
                        setNeedsOnboarding(true);
                    } else {
                        setActiveWorkspace(data);
                    }
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

    // Load initial context toggles when workspace changes
    useEffect(() => {
        if (!activeWorkspace) {
            setContextToggles([]);
            return;
        }
        const fetchLore = async () => {
            try {
                const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setContextToggles(data.map((l: any) => ({
                    id: l.id,
                    label: l.name,
                    active: true, // all active by default
                    type: l.type.toLowerCase().replace(/[^a-z0-9]/g, ''),
                    synopsis: l.synopsis
                })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchLore();
    }, [activeWorkspace]);

    // Load Books when Workspace changes
    useEffect(() => {
        if (!activeWorkspace) {
            setBooks([]);
            setActiveBook(null);
            return;
        }

        const loadBooks = async () => {
            try {
                const res = await fetch(`/api/books?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setBooks(data);
                    if (data.length > 0) {
                        // Keep current activeBook if it belongs here, or set first
                        if (!activeBook || !data.some(b => b.id === activeBook.id)) {
                            setActiveBook(data[0]);
                        }
                    } else {
                        // Auto-create a book if none exists, this gracefully hits the new POST endpoint
                        const createRes = await fetch('/api/books', {
                            method: 'POST',
                            body: JSON.stringify({ workspaceId: activeWorkspace.id, title: `${activeWorkspace.name} - Book 1` })
                        });
                        const newBook = await createRes.json();
                        setBooks([newBook]);
                        setActiveBook(newBook);
                    }
                }
            } catch (err) {
                console.error("Failed to load books:", err);
            }
        };
        loadBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    useEffect(() => {
        if (!activeWorkspace || !activeBook) {
            setChapters([]);
            return;
        }

        const loadChapters = async () => {
            try {
                const res = await fetch(`/api/chapters?bookId=${activeBook.id}`);
                const data = await res.json();

                if (Array.isArray(data) && data.length === 0) {
                    const createRes = await fetch('/api/chapters', {
                        method: 'POST',
                        body: JSON.stringify({ workspaceId: activeWorkspace.id, bookId: activeBook.id, title: 'Chapter 1', orderIndex: 0 })
                    });
                    const newChapter = await createRes.json();
                    setChapters([newChapter]);
                    setCurrentChapterId(newChapter.id);
                } else if (Array.isArray(data)) {
                    setChapters(data);
                    if (!currentChapterId || !data.some(c => c.id === currentChapterId)) {
                        setCurrentChapterId(data[data.length - 1].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load chapters in context:", err);
            }
        };

        loadChapters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace, activeBook]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+Shift+F toggles Focus Mode
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                setIsFocusMode(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <WorkspaceContext.Provider value={{
            activeWorkspace, setActiveWorkspace,
            previewContent, setPreviewContent,
            isPreviewing, setIsPreviewing,
            selectedText, setSelectedText,
            chapters, setChapters,
            currentChapterId, setCurrentChapterId,
            isLeftSidebarOpen, setIsLeftSidebarOpen,
            isManuscriptNavOpen, setIsManuscriptNavOpen,
            isRightSidebarOpen, setIsRightSidebarOpen,
            isContextMatrixDetached, setIsContextMatrixDetached,
            isFocusMode, setIsFocusMode,
            isTypewriterMode, setIsTypewriterMode,
            activeBook, setActiveBook,
            books, setBooks,
            contextToggles, setContextToggles,
            selectedLoreId, setSelectedLoreId,
            wordCount, setWordCount,
            readabilityScore, setReadabilityScore,
            aiChatInitialPrompt, setAiChatInitialPrompt,
            needsOnboarding, setNeedsOnboarding,
            typography, setTypography
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
