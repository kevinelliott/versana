'use client';

import React, { useEffect, useState } from 'react';
import {
    Lightbulb, Shield, Map, Type,
    LayoutTemplate, Image as ImageIcon,
    Rocket, LibraryBig, CheckSquare,
    ChevronDown, ChevronRight, ChevronLeft,
    User, MapPin, Hash, Bookmark, BookOpen,
    Check, X, Globe, Plus, Settings, Trash2, Loader2
} from 'lucide-react';
import styles from './LeftSidebar.module.css';
import { usePhase } from '@/context/PhaseContext';
import { useWorkspace, Workspace, Book } from '@/context/WorkspaceContext';

const getPhases = (isNonFic: boolean) => [
    { id: '1', icon: Lightbulb, label: isNonFic ? 'Topic & Thesis' : 'Concept & Ideation' },
    { id: '2', icon: Shield, label: isNonFic ? 'Outline & Structure' : 'Planning & Outlining' },
    { id: '3', icon: Map, label: isNonFic ? 'Research & Sourcing' : 'Research Assistant' },
    { id: '4', icon: Type, label: isNonFic ? 'Drafting & Content' : 'Drafting & Writing' },
    { id: '5', icon: CheckSquare, label: isNonFic ? 'Review & Fact-Checking' : 'Revisions & Deep Edits' },
    { id: '6', icon: LayoutTemplate, label: 'Layout & Formatting' },
    { id: '7', icon: ImageIcon, label: 'Cover Design' },
    { id: '8', icon: Rocket, label: 'Publishing Prep' },
];

const checkIsNonFiction = (genre?: string | null) => genre?.toLowerCase().includes('[non-fiction]') ?? false;
const cleanDisplayGenre = (genre?: string | null) => genre?.replace(/\[non-fiction\]/gi, '').replace(/\[fiction\]/gi, '').trim() || 'Unspecified Genre';

export default function LeftSidebar() {
    const { activePhase, setActivePhase } = usePhase();
    const {
        activeWorkspace, isLeftSidebarOpen, setIsLeftSidebarOpen, isFocusMode, setActiveWorkspace,
        books, setBooks, activeBook, setActiveBook, selectedLoreId, setSelectedLoreId
    } = useWorkspace();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lore, setLore] = useState<any[]>([]);

    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editName, setEditName] = useState('');
    const [editGenre, setEditGenre] = useState('');
    const [isSavingProject, setIsSavingProject] = useState(false);

    const [isEditingBook, setIsEditingBook] = useState(false);
    const [editBookTitle, setEditBookTitle] = useState('');
    const [isSavingBook, setIsSavingBook] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'workspace' | 'book'>('workspace');
    const [modalInputValue, setModalInputValue] = useState('');
    const [modalGenreValue, setModalGenreValue] = useState('');
    const [modalProjectType, setModalProjectType] = useState<'fiction' | 'non-fiction'>('fiction');
    const [bookCreationType, setBookCreationType] = useState<'blank' | 'scaffold' | 'generate'>('blank');
    const [bookCreationPrompt, setBookCreationPrompt] = useState('');
    const [bookGenerationCount, setBookGenerationCount] = useState(5);
    const [isSubmittingModal, setIsSubmittingModal] = useState(false);
    const [isGeneratingBook, setIsGeneratingBook] = useState(false);

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: 'workspace' | 'book', item: Workspace | Book } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Dropdown state
    const [isUniverseDropdownOpen, setIsUniverseDropdownOpen] = useState(false);
    const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const res = await fetch('/api/workspaces');
                const data = await res.json();
                if (Array.isArray(data)) setWorkspaces(data);
            } catch (err) {
                console.error("Failed to fetch workspaces", err);
            }
        };
        fetchWorkspaces();
    }, []);

    const handleCreateProject = () => {
        setModalType('workspace');
        setModalInputValue('');
        setModalGenreValue('');
        setModalProjectType('fiction');
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleCreateBook = () => {
        setModalType('book');
        setModalInputValue('');
        setBookCreationType('blank');
        setBookCreationPrompt('');
        setBookGenerationCount(5);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = modalInputValue.trim();
        if (!value) return;

        setModalError(null);
        setIsSubmittingModal(true);

        try {
            if (modalType === 'workspace') {
                const genrePrefix = modalProjectType === 'non-fiction' ? '[Non-Fiction] ' : '[Fiction] ';
                const finalGenre = `${genrePrefix}${modalGenreValue.trim()}`.trim();

                const res = await fetch('/api/workspaces', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: value, genre: finalGenre })
                });
                const data = await res.json();
                if (res.ok) {
                    setWorkspaces([data, ...workspaces]);
                    setActiveWorkspace(data);
                    setIsModalOpen(false);
                } else {
                    setModalError(data.error || "Failed to create project");
                }
            } else if (modalType === 'book' && activeWorkspace) {
                const isAI = bookCreationType === 'scaffold' || bookCreationType === 'generate';
                if (isAI) setIsGeneratingBook(true);

                const res = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ workspaceId: activeWorkspace.id, title: value, type: bookCreationType, prompt: bookCreationPrompt, count: bookGenerationCount })
                });

                if (isAI) setIsGeneratingBook(false);

                if (res.ok) {
                    const newBook = await res.json();
                    setBooks(prev => [...prev, newBook]);
                    setActiveBook(newBook);
                    setIsModalOpen(false);
                } else {
                    setModalError("Failed to create book");
                }
            }
        } catch (err: unknown) {
            console.error(err);
            setModalError((err as Error).message || 'An unexpected error occurred');
            setIsGeneratingBook(false);
        } finally {
            setIsSubmittingModal(false);
        }
    };

    const handleDeleteProject = () => {
        if (!activeWorkspace) return;
        setDeleteConfirmation({ type: 'workspace', item: activeWorkspace });
    };

    const handleDeleteBook = () => {
        if (!activeBook) return;
        setDeleteConfirmation({ type: 'book', item: activeBook });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        setIsDeleting(true);
        try {
            if (deleteConfirmation.type === 'workspace') {
                setIsSavingProject(true);
                const res = await fetch(`/api/workspaces?workspaceId=${deleteConfirmation.item.id}`, { method: 'DELETE' });
                if (res.ok) {
                    const filtered = workspaces.filter(w => w.id !== deleteConfirmation.item.id);
                    setWorkspaces(filtered);
                    if (filtered.length > 0) {
                        setActiveWorkspace(filtered[0]);
                    } else {
                        window.location.reload(); // Reload to clear visual state if no workspaces left
                    }
                }
            } else if (deleteConfirmation.type === 'book') {
                setIsSavingBook(true);
                const res = await fetch(`/api/books?bookId=${deleteConfirmation.item.id}`, { method: 'DELETE' });
                if (res.ok) {
                    const filtered = books.filter(b => b.id !== deleteConfirmation.item.id);
                    setBooks(filtered);
                    setActiveBook(filtered[0] || null);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmation(null);

            if (deleteConfirmation.type === 'workspace') {
                setIsSavingProject(false);
                setIsEditingProject(false);
            } else {
                setIsSavingBook(false);
                setIsEditingBook(false);
            }
        }
    };

    // Default open state for categories
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        'character': true,
        'place': true,
        'plot hook': true,
        'setting': true
    });

    useEffect(() => {
        if (!activeWorkspace) return;

        const fetchLore = async () => {
            try {
                const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();
                setLore(data || []);
            } catch (err) {
                console.error("Failed to fetch lore:", err);
            }
        };

        fetchLore();
        // Optionally poll to keep sidebar fresh since the context matrix is dynamic
        const intervalId = setInterval(fetchLore, 10000);
        return () => clearInterval(intervalId);
    }, [activeWorkspace]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const getIconForType = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'character') return <User size={14} />;
        if (t === 'place' || t === 'setting') return <MapPin size={14} />;
        if (t === 'plot hook') return <Bookmark size={14} />;
        if (t === 'lore' || t === 'rule') return <BookOpen size={14} />;
        return <Hash size={14} />;
    };

    const getCategoryDisplay = (key: string, isNonFic: boolean) => {
        if (!isNonFic) return key;
        const lower = key.toLowerCase();
        if (lower === 'character') return 'Key Figures / Subjects';
        if (lower === 'place' || lower === 'setting') return 'Locations / Contexts';
        if (lower === 'plot hook' || lower === 'plot') return 'Data Points / KPIs';
        if (lower === 'lore' || lower === 'rule') return 'Concepts & Frameworks';
        return 'References';
    };

    const isNonFicProject = checkIsNonFiction(activeWorkspace?.genre);

    // Group lore by type
    const groupedLore = lore.reduce((acc, item) => {
        const typeStr = getCategoryDisplay(item.type || 'Other', isNonFicProject);
        if (!acc[typeStr]) acc[typeStr] = [];
        acc[typeStr].push(item);
        return acc;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any[]>);

    const handleEditProjectClick = () => {
        if (!activeWorkspace) return;
        setEditName(activeWorkspace.name);
        setEditGenre(activeWorkspace.genre || '');
        setIsEditingProject(true);
    };

    const handleSaveProject = async () => {
        if (!activeWorkspace) return;
        setIsSavingProject(true);
        try {
            const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, genre: editGenre })
            });

            if (res.ok) {
                const updated = await res.json();
                setActiveWorkspace(updated);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsEditingProject(false);
            setIsSavingProject(false);
        }
    };

    const handleEditBookClick = () => {
        if (!activeBook) return;
        setEditBookTitle(activeBook.title);
        setIsEditingBook(true);
    };

    const handleSaveBook = async () => {
        if (!activeBook) return;
        setIsSavingBook(true);
        try {
            const res = await fetch(`/api/books/${activeBook.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editBookTitle })
            });

            if (res.ok) {
                const updated = await res.json();
                setActiveBook(updated);
                setBooks(books.map((b: Book) => b.id === updated.id ? updated : b));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsEditingBook(false);
            setIsSavingBook(false);
        }
    };

    if (isFocusMode) return null;

    return (
        <>
            {isGeneratingBook && (
                <div className={styles.modalOverlay} style={{ zIndex: 9999 }}>
                    <div className={styles.modalContent} style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '400px' }}>
                        <Loader2 size={48} className={styles.spinner} style={{ color: 'var(--accent-blue)', margin: '0 auto 1.5rem auto' }} />
                        <h2 className={styles.modalTitle} style={{ marginBottom: '0.5rem' }}>
                            {bookCreationType === 'generate' ? 'Writing Your Draft...' : 'Scaffolding Structure...'}
                        </h2>
                        <p className={styles.modalDesc}>
                            This might take a minute depending on the complexity of your request and knowledge base. Please don&apos;t refresh the page.
                        </p>
                    </div>
                </div>
            )}
            {deleteConfirmation && (
                <div className={styles.modalOverlay} style={{ zIndex: 10000 }}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                        <h2 className={styles.modalTitle} style={{ color: 'var(--text-danger, #ef4444)', marginBottom: '1rem' }}>
                            Delete {deleteConfirmation.type === 'workspace' ? 'Project' : 'Book'}
                        </h2>
                        <p className={styles.modalDesc} style={{ marginBottom: '2rem' }}>
                            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>&quot;{deleteConfirmation.type === 'workspace' ? (deleteConfirmation.item as Workspace).name : (deleteConfirmation.item as Book).title}&quot;</strong>? This action is permanent and cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setDeleteConfirmation(null)}
                                disabled={isDeleting}
                                style={{ padding: '0.6rem 1.2rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.modalActionBtn}
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                style={{ padding: '0.6rem 1.2rem', background: 'var(--text-danger, #ef4444)', borderColor: 'var(--text-danger, #ef4444)' }}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
            <aside className={`${styles.sidebar} ${!isLeftSidebarOpen ? styles.collapsed : ''}`}>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    title="Toggle Left Sidebar"
                >
                    {isLeftSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className={styles.sidebarContent}>
                    {activeWorkspace && (
                        <>
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span>{isNonFicProject ? 'Project Details' : 'Universe Details'}</span>
                                    {!isEditingProject && (
                                        <button onClick={handleEditProjectClick} className={styles.editBtn}>
                                            <Settings size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className={styles.projectDetailsText}>
                                    {isEditingProject ? (
                                        <div className={styles.editForm}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className={styles.editInput}
                                                placeholder="Universe Name"
                                                disabled={isSavingProject}
                                            />
                                            <input
                                                type="text"
                                                value={editGenre}
                                                onChange={(e) => setEditGenre(e.target.value)}
                                                className={styles.editInput}
                                                placeholder={isNonFicProject ? "e.g. Cooking, Business" : "Genre (e.g. Sci-Fi)"}
                                                disabled={isSavingProject}
                                            />
                                            <div className={styles.editActions}>
                                                <button onClick={handleSaveProject} disabled={isSavingProject || !editName.trim()} className={styles.saveBtn}><Check size={14} /></button>
                                                <button onClick={() => setIsEditingProject(false)} disabled={isSavingProject} className={styles.cancelBtn}><X size={14} /></button>
                                                <div style={{ flex: 1 }} />
                                                <button onClick={handleDeleteProject} disabled={isSavingProject} className={styles.cancelBtn} style={{ color: 'var(--text-danger, #ff4d4f)' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ position: 'relative' }}>
                                                <div
                                                    className={styles.projectSelector}
                                                    onClick={() => setIsUniverseDropdownOpen(!isUniverseDropdownOpen)}
                                                >
                                                    <div className={styles.projectSelectorInner}>
                                                        <div className={styles.selectorImg}>
                                                            <Globe size={14} className={styles.selectorIcon} />
                                                        </div>
                                                        <span className={styles.projectName}>{activeWorkspace.name}</span>
                                                    </div>
                                                    <ChevronDown size={14} className={styles.selectorChevron} />
                                                </div>

                                                {isUniverseDropdownOpen && (
                                                    <div className={styles.dropdownMenu}>
                                                        {workspaces.map(w => (
                                                            <div
                                                                key={w.id}
                                                                className={`${styles.dropdownItem} ${activeWorkspace.id === w.id ? styles.dropdownItemActive : ''}`}
                                                                onClick={() => {
                                                                    setActiveWorkspace(w);
                                                                    setIsUniverseDropdownOpen(false);
                                                                }}
                                                            >
                                                                {/* Checkmark placeholder to match spacing */}
                                                                <div style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {activeWorkspace.id === w.id && <Check size={14} color="var(--text-primary)" />}
                                                                </div>
                                                                {/* Placeholder generic image (could be randomly colored orb or icon) */}
                                                                <div className={styles.dropdownItemImg}>
                                                                    <Globe size={18} color="var(--text-secondary)" />
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                                    <span className={styles.dropdownItemTitle}>{w.name}</span>
                                                                    <span className={styles.dropdownItemGenre}>{cleanDisplayGenre(w.genre) || 'Unspecified Genre'}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className={styles.dropdownDivider}></div>
                                                        <div
                                                            className={styles.dropdownItem}
                                                            onClick={() => {
                                                                handleCreateProject();
                                                                setIsUniverseDropdownOpen(false);
                                                            }}
                                                            style={{ justifyContent: 'center', gap: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                                                        >
                                                            <Plus size={14} />
                                                            <span style={{ fontWeight: 500 }}>Create New Project</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Active Book Selector */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span>Active Book</span>
                                    {!isEditingBook && (
                                        <button onClick={handleEditBookClick} className={styles.editBtn}>
                                            <Settings size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className={styles.projectDetailsText}>
                                    {isEditingBook ? (
                                        <div className={styles.editForm}>
                                            <input
                                                type="text"
                                                value={editBookTitle}
                                                onChange={(e) => setEditBookTitle(e.target.value)}
                                                className={styles.editInput}
                                                placeholder="Book Title"
                                                disabled={isSavingBook}
                                            />
                                            <div className={styles.editActions}>
                                                <button onClick={handleSaveBook} disabled={isSavingBook || !editBookTitle.trim()} className={styles.saveBtn}><Check size={14} /></button>
                                                <button onClick={() => setIsEditingBook(false)} disabled={isSavingBook} className={styles.cancelBtn}><X size={14} /></button>
                                                <div style={{ flex: 1 }} />
                                                <button onClick={handleDeleteBook} disabled={isSavingBook} className={styles.cancelBtn} style={{ color: 'var(--text-danger, #ff4d4f)' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <div
                                                className={styles.projectSelector}
                                                onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
                                            >
                                                <div className={styles.projectSelectorInner}>
                                                    <div className={styles.selectorImg}>
                                                        <BookOpen size={14} className={styles.selectorIcon} />
                                                    </div>
                                                    <span className={styles.projectName}>{activeBook?.title || 'Select a Book'}</span>
                                                </div>
                                                <ChevronDown size={14} className={styles.selectorChevron} />
                                            </div>

                                            {isBookDropdownOpen && (
                                                <div className={styles.dropdownMenu}>
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {books.map((b: any) => (
                                                        <div
                                                            key={b.id}
                                                            className={`${styles.dropdownItem} ${activeBook?.id === b.id ? styles.dropdownItemActive : ''}`}
                                                            onClick={() => {
                                                                setActiveBook(b);
                                                                setIsBookDropdownOpen(false);
                                                            }}
                                                        >
                                                            <div style={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {activeBook?.id === b.id && <Check size={14} color="var(--text-primary)" />}
                                                            </div>
                                                            <div className={styles.dropdownItemImg}>
                                                                <BookOpen size={18} color="var(--text-secondary)" />
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                                <span className={styles.dropdownItemTitle}>{b.title}</span>
                                                                <span className={styles.dropdownItemGenre}>Book in {activeWorkspace.name}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className={styles.dropdownDivider}></div>
                                                    <div
                                                        className={styles.dropdownItem}
                                                        onClick={() => {
                                                            handleCreateBook();
                                                            setIsBookDropdownOpen(false);
                                                        }}
                                                        style={{ justifyContent: 'center', gap: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                                                    >
                                                        <Plus size={14} />
                                                        <span style={{ fontWeight: 500 }}>Create New Book</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.divider} />
                        </>
                    )}

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>Guided Workflow</div>
                        <nav className={styles.nav}>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {getPhases(isNonFicProject).map((phase: any) => (
                                <button
                                    key={phase.id}
                                    onClick={() => setActivePhase(phase.id)}
                                    className={`${styles.navItem} ${activePhase === phase.id ? styles.active : ''}`}
                                    title={phase.label}
                                >
                                    <phase.icon size={16} className={styles.navIcon} />
                                    <span>
                                        <span style={{ opacity: 0.5, marginRight: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phase {phase.id}</span>
                                        <span>{phase.label}</span>
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>{isNonFicProject ? 'Knowledge Base' : 'World Building'}</div>
                        <nav className={styles.nav}>
                            <button
                                className={`${styles.navItem} ${activePhase === 'lore' && !selectedLoreId ? styles.active : ''}`}
                                title={isNonFicProject ? "Knowledge Base" : "Lore Bible"}
                                onClick={() => {
                                    setActivePhase('lore');
                                    setSelectedLoreId(null);
                                }}
                            >
                                <LibraryBig size={16} className={styles.navIcon} />
                                <span>{isNonFicProject ? 'Knowledge Base' : 'Lore Bible'}</span>
                            </button>
                        </nav>

                        <div className={styles.divider} style={{ margin: '0.5rem 0', opacity: 0.5 }} />

                        {/* Display Dynamic Lore Matrix */}
                        <div style={{ marginTop: '0.25rem' }}>
                            {Object.keys(groupedLore).map(category => (
                                <div key={category} className={styles.categoryGroup}>
                                    <button
                                        className={styles.categoryHeader}
                                        onClick={() => toggleCategory(category.toLowerCase())}
                                    >
                                        {expandedCategories[category.toLowerCase()] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        {category} ({groupedLore[category].length})
                                    </button>

                                    {expandedCategories[category.toLowerCase()] && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {groupedLore[category].map((item: any) => (
                                                <button
                                                    key={item.id}
                                                    className={`${styles.loreItem} ${activePhase === 'lore' && selectedLoreId === item.id ? styles.active : ''}`}
                                                    title={item.synopsis}
                                                    onClick={() => {
                                                        setActivePhase('lore');
                                                        setSelectedLoreId(item.id);
                                                    }}
                                                >
                                                    <span style={{ color: 'var(--text-muted)' }}>{getIconForType(item.type)}</span>
                                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {Object.keys(groupedLore).length === 0 && (
                                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    No entries found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Creation Modal */}
                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <h2 className={styles.modalTitle}>
                                {modalType === 'workspace' ? 'Create New Project' : 'Create New Book'}
                            </h2>
                            {modalError && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-danger, #ef4444)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    {modalError}
                                </div>
                            )}
                            <form onSubmit={handleModalSubmit}>
                                {modalType === 'workspace' && (
                                    <>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div
                                                style={{
                                                    flex: 1, padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px',
                                                    cursor: 'pointer', background: modalProjectType === 'fiction' ? 'var(--bg-secondary)' : 'transparent',
                                                    borderColor: modalProjectType === 'fiction' ? 'var(--accent-blue)' : 'var(--border-light)'
                                                }}
                                                onClick={() => setModalProjectType('fiction')}
                                            >
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Fiction</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Novels, World-Building, etc.</div>
                                            </div>
                                            <div
                                                style={{
                                                    flex: 1, padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px',
                                                    cursor: 'pointer', background: modalProjectType === 'non-fiction' ? 'var(--bg-secondary)' : 'transparent',
                                                    borderColor: modalProjectType === 'non-fiction' ? 'var(--accent-blue)' : 'var(--border-light)'
                                                }}
                                                onClick={() => setModalProjectType('non-fiction')}
                                            >
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Non-Fiction</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cookbooks, Business, etc.</div>
                                            </div>
                                        </div>
                                        <p className={styles.modalDesc} style={{ marginTop: '-0.5rem' }}>
                                            A <strong>Project Hub</strong> acts as the central home for {modalProjectType === 'fiction' ? 'your world-building lore and stories' : 'all your knowledge bases and resources'}.
                                        </p>
                                    </>
                                )}

                                {modalType === 'book' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Select Starting Point</div>
                                        <div
                                            style={{
                                                padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px',
                                                cursor: 'pointer', background: bookCreationType === 'blank' ? 'var(--bg-secondary)' : 'transparent',
                                                borderColor: bookCreationType === 'blank' ? 'var(--accent-blue)' : 'var(--border-light)',
                                                display: 'flex', flexDirection: 'column', gap: '0.25rem'
                                            }}
                                            onClick={() => setBookCreationType('blank')}
                                        >
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>New Blank Book</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start from scratch with a blank canvas.</div>
                                        </div>
                                        <div
                                            style={{
                                                padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px',
                                                cursor: 'pointer', background: bookCreationType === 'scaffold' ? 'var(--bg-secondary)' : 'transparent',
                                                borderColor: bookCreationType === 'scaffold' ? 'var(--accent-blue)' : 'var(--border-light)',
                                                display: 'flex', flexDirection: 'column', gap: '0.25rem'
                                            }}
                                            onClick={() => setBookCreationType('scaffold')}
                                        >
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Scaffold Book</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI will generate a structural outline based on your {isNonFicProject ? 'knowledge base' : 'universe'}.</div>
                                        </div>
                                        <div
                                            style={{
                                                padding: '1rem', border: '1px solid var(--border-light)', borderRadius: '8px',
                                                cursor: 'pointer', background: bookCreationType === 'generate' ? 'var(--bg-secondary)' : 'transparent',
                                                borderColor: bookCreationType === 'generate' ? 'var(--accent-blue)' : 'var(--border-light)',
                                                display: 'flex', flexDirection: 'column', gap: '0.25rem'
                                            }}
                                            onClick={() => setBookCreationType('generate')}
                                        >
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Generate Entire Book</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Let AI draft the complete {isNonFicProject ? 'manuscript' : 'story'} from your {isNonFicProject ? 'knowledge base' : 'lore'}.</div>
                                        </div>

                                        {(bookCreationType === 'scaffold' || bookCreationType === 'generate') && (
                                            <>
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <label className={styles.modalLabel}>{isNonFicProject ? 'Number of Sections to Generate' : 'Number of Chapters to Generate'}</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        className={styles.modalInput}
                                                        value={bookGenerationCount}
                                                        onChange={(e) => setBookGenerationCount(Number(e.target.value))}
                                                        disabled={isSubmittingModal}
                                                        style={{ marginBottom: '1rem' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={styles.modalLabel}>AI Generation Prompt</label>
                                                    <textarea
                                                        className={styles.modalInput}
                                                        style={{ minHeight: '80px', resize: 'vertical', marginBottom: 0 }}
                                                        placeholder={isNonFicProject ? "Provide a specific topic, angle, or thesis you want the book to focus on..." : "Provide a specific plot, themes, or core conflict you want the book to focus on..."}
                                                        value={bookCreationPrompt}
                                                        onChange={(e) => setBookCreationPrompt(e.target.value)}
                                                        disabled={isSubmittingModal}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className={styles.modalLabel}>
                                        {modalType === 'workspace' ? 'Project Name' : 'Target Book Title'}
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.modalInput}
                                        placeholder={modalType === 'workspace' ? (modalProjectType === 'fiction' ? 'e.g. The Obsidian Crown...' : 'e.g. Keto Recipes...') : 'Enter book title...'}
                                        value={modalInputValue}
                                        onChange={(e) => setModalInputValue(e.target.value)}
                                        autoFocus
                                        disabled={isSubmittingModal}
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>

                                {modalType === 'workspace' && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label className={styles.modalLabel}>Primary Genre (Optional)</label>
                                        <input
                                            type="text"
                                            className={styles.modalInput}
                                            placeholder="e.g. High Fantasy, Cyberpunk..."
                                            value={modalGenreValue}
                                            onChange={(e) => setModalGenreValue(e.target.value)}
                                            disabled={isSubmittingModal}
                                            style={{ marginBottom: 0 }}
                                        />
                                    </div>
                                )}

                                <div className={styles.modalActions} style={{ marginTop: modalType === 'book' ? '2rem' : 0 }}>
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isSubmittingModal}
                                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={styles.modalActionBtn}
                                        disabled={isSubmittingModal || !modalInputValue.trim()}
                                    >
                                        {isSubmittingModal ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
