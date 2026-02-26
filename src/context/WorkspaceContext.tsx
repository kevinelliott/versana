'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Workspace {
    id: string;
    name: string;
    genre: string | null;
    board_state?: Record<string, unknown>;
}

export interface Book {
    id: string;
    workspace_id: string;
    title: string;
    genre: string | null;
}

export interface Chapter {
    id: string;
    workspace_id: string;
    title: string;
    content: Record<string, unknown> | null; // TipTap JSON
    order_index: number;
    created_at: string;
    updated_at: string;
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
    isFocusMode: boolean;
    setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
    selectedLoreId: string | null;
    setSelectedLoreId: React.Dispatch<React.SetStateAction<string | null>>;
    wordCount: number;
    setWordCount: React.Dispatch<React.SetStateAction<number>>;
    readabilityScore: string;
    setReadabilityScore: React.Dispatch<React.SetStateAction<string>>;
    aiChatInitialPrompt: string | null;
    setAiChatInitialPrompt: React.Dispatch<React.SetStateAction<string | null>>;
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
    const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
    const [activeBook, setActiveBook] = useState<Book | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedLoreId, setSelectedLoreId] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState<number>(0);
    const [readabilityScore, setReadabilityScore] = useState<string>('N/A');
    const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string | null>(null);

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
            isFocusMode, setIsFocusMode,
            activeBook, setActiveBook,
            books, setBooks,
            selectedLoreId, setSelectedLoreId,
            wordCount, setWordCount,
            readabilityScore, setReadabilityScore,
            aiChatInitialPrompt, setAiChatInitialPrompt
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
