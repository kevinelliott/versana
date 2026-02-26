'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, Wand2, MessageSquare, Scissors, Zap, FileText, Plus, GripVertical, History, Layout, Check, X, Loader2, Activity, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { LoreTag } from './editor/LoreTagExtension';
import HoverCard, { EntityData } from './HoverCard';
import PacingHeatmap from './PacingHeatmap';
import styles from './Workspace.module.css';
import './editor/editor.css'; // We'll need a tiny bit of CSS for TipTap



export default function Workspace() {
    const {
        activeWorkspace, isPreviewing, setIsPreviewing, previewContent, setPreviewContent,
        selectedText, setSelectedText, chapters, setChapters, currentChapterId, setCurrentChapterId,
        isManuscriptNavOpen, setIsManuscriptNavOpen, isFocusMode, setIsFocusMode,
        setIsLeftSidebarOpen, setIsRightSidebarOpen, activeBook
    } = useWorkspace();

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;
    const [hoverState, setHoverState] = useState<{
        entity: EntityData | null;
        x: number;
        y: number;
        visible: boolean;
    }>({
        entity: null,
        x: 0,
        y: 0,
        visible: false,
    });

    const [hideTags, setHideTags] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [chapterTitle, setChapterTitle] = useState('');
    const [loreDatabase, setLoreDatabase] = useState<EntityData[]>([]);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    const [chapterPrompt, setChapterPrompt] = useState('');
    const [chapterLength, setChapterLength] = useState('medium');
    const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chapterId: string } | null>(null);
    const [editorContextMenu, setEditorContextMenu] = useState<{ x: number, y: number } | null>(null);
    const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
    const [historyItems, setHistoryItems] = useState<{ id: string, time: string, desc: string, revivable?: boolean, chapterId?: string }[]>([
        { id: 'h1', time: 'Today, 2:45 PM', desc: 'AI "Expand Description" applied' },
        { id: 'h2', time: 'Today, 1:12 PM', desc: 'Manual Save' },
        { id: 'h3', time: 'Yesterday, 4:30 PM', desc: 'Beat-to-Scene Generation' },
    ]);

    const handleContextMenu = (e: React.MouseEvent, chapterId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, chapterId });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
        setEditorContextMenu(null);
    };

    useEffect(() => {
        const handleClick = () => closeContextMenu();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleDeleteChapter = (chapterId: string) => {
        setChapterToDelete(chapterId);
        closeContextMenu();
    };

    const confirmDeleteChapter = async () => {
        if (!chapterToDelete) return;

        setIsSaving(true);
        const chapterId = chapterToDelete;
        setChapterToDelete(null);
        // Soft delete: set order_index to -1
        await fetch(`/api/chapters/${chapterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: -1 })
        });

        const ch = chapters.find(c => c.id === chapterId);
        setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, order_index: -1 } : c));

        // Add to history
        setHistoryItems(prev => [{
            id: `del-${Date.now()}`,
            time: 'Just now',
            desc: `Deleted: "${ch?.title}"`,
            revivable: true,
            chapterId
        }, ...prev]);

        if (currentChapterId === chapterId) {
            const nextCh = chapters.find(c => c.id !== chapterId && c.order_index >= 0);
            setCurrentChapterId(nextCh ? nextCh.id : null);
        }
        setIsSaving(false);
    };

    const handleRestoreChapter = async (chapterId: string, historyId: string) => {
        setIsSaving(true);
        const maxOrder = Math.max(0, ...chapters.map(c => c.order_index));

        await fetch(`/api/chapters/${chapterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: maxOrder + 1 })
        });

        setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, order_index: maxOrder + 1 } : c));

        setHistoryItems(prev => prev.filter(h => h.id !== historyId));
        setCurrentChapterId(chapterId);
        setIsSaving(false);
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write your masterpiece...',
            }),
            LoreTag,
        ],
        immediatelyRender: false,
        content: '', // Will be updated on load
        editorProps: {
            attributes: {
                class: styles.editorArea,
            },
            handleDOMEvents: {
                mousedown: (view, event) => {
                    if (event.button === 2 || event.ctrlKey) {
                        const { from, to } = view.state.selection;
                        if (from !== to) {
                            event.preventDefault(); // crucial to prevent native DOM selection change
                            return true; // Stop ProseMirror from clearing selection on right-click
                        }
                    }
                    return false;
                },
                contextmenu: (view, event) => {
                    const { from, to } = view.state.selection;
                    if (from !== to) {
                        event.preventDefault();
                        setEditorContextMenu({ x: event.clientX, y: event.clientY });
                        return true; // Tells ProseMirror we handled this completely
                    }
                    // Let default browser behavior happen if no text is selected
                    return false;
                }
            }
        },
        onSelectionUpdate: ({ editor }) => {
            const { from, to } = editor.state.selection;
            if (from !== to) {
                const text = editor.state.doc.textBetween(from, to, ' ');
                setSelectedText(text);
            } else {
                setSelectedText('');
            }
        },
    });

    // Fetch chapters for workspace
    useEffect(() => {
        if (!activeWorkspace) return;

        const loadLore = async () => {
            try {
                const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();
                setLoreDatabase(data || []);
            } catch (err) {
                console.error("Failed to load lore:", err);
            }
        };

        if (chapters.length > 0) {
            setIsLoading(false);
        }

        loadLore();
    }, [activeWorkspace, chapters]);

    // Switch Chapter and Load Content
    useEffect(() => {
        if (!currentChapterId || !editor) return;

        const loadChapterContent = async () => {
            try {
                const res = await fetch(`/api/chapters/${currentChapterId}`);
                const data = await res.json();
                setChapterTitle(data.title || 'Untitled Chapter');

                // If the json is empty object or array, fallback to paragraph
                if (!data.content || Object.keys(data.content).length === 0) {
                    editor.commands.setContent('<p></p>');
                } else {
                    editor.commands.setContent(data.content);
                }
            } catch (err) {
                console.error("Failed to load chapter content:", err);
            }
        };

        loadChapterContent();
    }, [currentChapterId, editor]);

    // Auto-save logic
    useEffect(() => {
        if (!editor || !currentChapterId || !activeWorkspace) return;

        let debounceTimer: NodeJS.Timeout;

        const saveContent = async () => {
            setIsSaving(true);
            try {
                const contentJson = editor.getJSON();
                const textContent = editor.getText();

                // 1. Save chapter content
                await fetch(`/api/chapters/${currentChapterId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: contentJson })
                });

                // 2. Run background NER for Smart Lore Tags extraction
                if (textContent.trim().length > 50) {
                    const nerRes = await fetch('/api/ai/ner', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: textContent, workspaceId: activeWorkspace.id })
                    });
                    if (nerRes.ok) {
                        const nerData = await nerRes.json();
                        if (nerData.entities && nerData.entities.length > 0) {
                            setLoreDatabase(nerData.entities);
                        }
                    }
                }

            } catch (err) {
                console.error("Auto-save failed:", err);
            } finally {
                setIsSaving(false);
            }
        };

        const onTransaction = () => {
            clearTimeout(debounceTimer);
            // Save after 1 second of typing inactivity
            debounceTimer = setTimeout(saveContent, 1000);
        };

        editor.on('transaction', onTransaction);
        return () => {
            editor.off('transaction', onTransaction);
            clearTimeout(debounceTimer);
        }
    }, [editor, currentChapterId, activeWorkspace]);

    const handleCopilot = async (action: 'expand' | 'rewrite' | 'shorten' | 'refine') => {
        if (!activeWorkspace || !selectedText.trim()) return;

        setIsGeneratingTitle(true); // Reusing as general generation lock
        setIsPreviewing(true);
        setPreviewContent(''); // Clear previous

        let actionPrompt = '';
        switch (action) {
            case 'expand': actionPrompt = 'Expand on the following draft text, providing more sensory details, setting the scene, and adding descriptive depth. Do not change the core narrative events.'; break;
            case 'rewrite': actionPrompt = 'Rewrite the following text to dramatically improve its prose, pacing, and emotional impact. Make it strictly better from a literary perspective without changing the core narrative.'; break;
            case 'shorten': actionPrompt = 'Shorten the following text, making it more concise and punchy while retaining all crucial information and tone.'; break;
            case 'refine': actionPrompt = 'Refine and polish the following text. Improve the prose, fix any awkward phrasing, enhance the vocabulary gently, and ensure a professional literary tone.'; break;
        }

        try {
            // Give Context Matrix to the AI
            const contextText = loreDatabase.map((e: EntityData) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');

            const systemPrompt = isNonFicProject
                ? `You are an elite business editor and domain expert. You are provided with a 'Knowledge Base'. Follow the user's specific editorial directive to rewrite their drafted text. Do not include markdown formatting, pleasantries, or explanations. Only output the revised text paragraph by paragraph.

KNOWLEDGE BASE:
${contextText}`
                : `You are a master fiction author and elite editor. You are provided with a 'Context Matrix' (Lore Bible). Follow the user's specific editorial directive to rewrite their drafted text. Do not include markdown formatting, pleasantries, or explanations. Only output the revised prose paragraph by paragraph.

CONTEXT MATRIX:
${contextText}`;

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: `EDITORIAL DIRECTIVE: ${actionPrompt}\n\nORIGINAL TEXT TO REWRITE:\n${selectedText}` }]
                })
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }

        } catch (err) {
            console.error("Co-Pilot failed:", err);
            setPreviewContent("An error occurred during generation.");
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleGenerateChapter = async () => {
        if (!activeWorkspace || isGeneratingChapter) return;
        setIsGeneratingChapter(true);
        setIsPreviewing(true);
        setPreviewContent('');

        // Provide Context Matrix
        const contextText = loreDatabase.map(e => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');
        const contextStr = Array.isArray(chapters)
            ? chapters.map(c => `Chapter ${c.order_index}: ${c.title}`).join('\n')
            : '';

        const systemPrompt = isNonFicProject
            ? `You are a master non-fiction writer and domain expert. Using the 'Knowledge Base' and the project's overall section list, generate a complete draft for the new section titled "${chapterTitle}". Do not include markdown formatting or pleasantries, just output the text paragraph by paragraph.

KNOWLEDGE BASE:
${contextText}

SECTION PROGRESSION SO FAR:
${contextStr}

Target length: ${chapterLength} (short: ~500 words, medium: ~1500 words, long: ~3000 words).`
            : `You are a master fiction author. Using the 'Context Matrix' (Lore Bible) and the project's overall chapter list, generate a complete draft for the new chapter titled "${chapterTitle}". Do not include markdown formatting or pleasantries, just output the prose paragraph by paragraph.

CONTEXT MATRIX:
${contextText}

CHAPTER PROGRESSION SO FAR:
${contextStr}

Target length: ${chapterLength} (short: ~500 words, medium: ~1500 words, long: ~3000 words).`;

        try {
            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: `Please write "${chapterTitle}". ${chapterPrompt ? `User's guiding instructions: ${chapterPrompt}` : ''}` }]
                })
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }
        } catch (err) {
            console.error("Chapter Generation failed:", err);
            setPreviewContent("An error occurred during generation.");
        } finally {
            setIsGeneratingChapter(false);
            setChapterPrompt('');
        }
    };

    // Update chapter title
    const handleTitleBlur = async (e: React.FocusEvent<HTMLHeadingElement>) => {
        const newTitle = e.target.innerText;
        setChapterTitle(newTitle);
        // update local list immediately
        setChapters(prev => prev.map(ch => ch.id === currentChapterId ? { ...ch, title: newTitle } : ch));

        if (currentChapterId) {
            setIsSaving(true);
            await fetch(`/api/chapters/${currentChapterId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            setIsSaving(false);
        }
    };

    const handleGenerateTitle = async () => {
        if (!editor || !currentChapterId) return;
        setIsGeneratingTitle(true);
        try {
            const content = editor.getText();
            const res = await fetch('/api/ai/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    currentChapterId,
                    workspaceId: activeWorkspace?.id,
                    chapters: chapters.map(c => ({ id: c.id, title: c.title, order: c.order_index }))
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.title) {
                    setChapterTitle(data.title);
                    setChapters(prev => prev.map(ch => ch.id === currentChapterId ? { ...ch, title: data.title } : ch));

                    // save to backend immediately
                    await fetch(`/api/chapters/${currentChapterId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: data.title })
                    });
                }
            }
        } catch (e) {
            console.error('Failed to generate title', e);
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    // Debounced NER matcher
    useEffect(() => {
        if (!editor) return;

        const updateTags = () => {
            // Very naive NER mock: scan text and apply LoreTag Marks
            // In reality, this would be a server action or background worker 
            // returning positions to update.
            const { state, view } = editor;
            const tr = state.tr;
            let docChanged = false;

            // Remove all existing LoreTags first to avoid overlap issues in this mock
            // This is unoptimized mock logic: 
            state.doc.descendants((node, pos) => {
                if (node.isText) {
                    node.marks.forEach(mark => {
                        if (mark.type.name === 'loreTag') {
                            tr.removeMark(pos, pos + node.nodeSize, mark.type);
                            docChanged = true;
                        }
                    });
                }
            });

            // Re-apply marks
            state.doc.descendants((node, pos) => {
                if (node.isText && node.text) {
                    loreDatabase.forEach(entity => {
                        const terms = [entity.name, ...(entity.aliases || [])];
                        terms.forEach(term => {
                            const regex = new RegExp(`\\b(${term})\\b`, 'gi');
                            let match;
                            while ((match = regex.exec(node.text!)) !== null) {
                                const start = pos + match.index;
                                const end = start + match[0].length;

                                const mark = state.schema.marks.loreTag.create({
                                    id: entity.id,
                                    entityType: entity.type,
                                    class: `${styles.loreTag} ${styles[entity.type]}`,
                                    'data-entity-str': JSON.stringify(entity)
                                });
                                tr.addMark(start, end, mark);
                                docChanged = true;
                            }
                        });
                    });
                }
            });

            if (docChanged) {
                view.dispatch(tr);
            }
        };

        // Run initially
        updateTags();

        // Listen for updates
        let timeout: NodeJS.Timeout;
        const onUpdate = () => {
            clearTimeout(timeout);
            timeout = setTimeout(updateTags, 500); // 500ms debounce
        };

        editor.on('update', onUpdate);
        return () => {
            editor.off('update', onUpdate);
            clearTimeout(timeout);
        };
    }, [editor, loreDatabase, hideTags]);

    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseOver = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.hasAttribute('data-lore-tag')) {
            if (hideTags) return; // Don't show if tags are hidden

            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }

            const entityStr = target.getAttribute('data-entity-str');
            if (entityStr) {
                const entity = JSON.parse(entityStr);
                const rect = target.getBoundingClientRect();
                setHoverState({
                    entity,
                    x: rect.left,
                    y: rect.top,
                    visible: true
                });
            }
        }
    };

    const handleMouseOut = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.hasAttribute('data-lore-tag')) {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            hoverTimeoutRef.current = setTimeout(() => {
                setHoverState(prev => ({ ...prev, visible: false }));
            }, 300);
        }
    };

    const handleEntityEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    const handleEntityLeave = () => {
        setHoverState(prev => ({ ...prev, visible: false }));
    };

    const handleToggleFocusMode = () => {
        if (!isFocusMode) {
            // Turning ON Focus Mode
            setIsLeftSidebarOpen(false);
            setIsRightSidebarOpen(false);
            setIsManuscriptNavOpen(false);
            setIsFocusMode(true);
        } else {
            // Turning OFF Focus Mode
            setIsLeftSidebarOpen(true);
            setIsRightSidebarOpen(true);
            setIsManuscriptNavOpen(true);
            setIsFocusMode(false);
        }
    };

    return (
        <div className={styles.workspaceContainer}>
            {!isFocusMode && (
                <div className={styles.workspaceGlobalHeader}>
                    <h1 className={styles.phaseTitle}>
                        <span className={styles.phaseLabel}>Phase 4</span>
                        {isNonFicProject ? 'Drafting & Content' : 'Drafting & Writing'}
                    </h1>
                </div>
            )}
            <div className={styles.workspace} onClick={hoverState.visible ? handleEntityLeave : undefined}>
                {/* Chapter Manager Sidebar */}
                {!isFocusMode && (
                    <div className={`${styles.chapterSidebarWrapper} ${!isManuscriptNavOpen ? styles.collapsed : ''}`}>
                        <button
                            className={styles.sidebarToggleBtn}
                            onClick={() => setIsManuscriptNavOpen(!isManuscriptNavOpen)}
                            title="Toggle Manuscript Sidebar"
                        >
                            {isManuscriptNavOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <div className={styles.chapterSidebar}>
                            <div className={styles.chapterSidebarHeader}>
                                <div className={styles.chapterSidebarTitle}>{isNonFicProject ? 'Manuscript Sections' : 'Manuscript'}</div>
                                {isSaving && <Loader2 size={12} className={styles.spinner} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />}
                                <button className={styles.addChapterBtn} onClick={async () => {
                                    if (!activeWorkspace || !activeBook) return;
                                    const res = await fetch('/api/chapters', {
                                        method: 'POST',
                                        body: JSON.stringify({ workspaceId: activeWorkspace.id, bookId: activeBook.id, title: isNonFicProject ? `Section ${chapters.length + 1}` : `Chapter ${chapters.length + 1}`, orderIndex: chapters.length })
                                    });
                                    const newCh = await res.json();
                                    setChapters([...chapters, newCh]);
                                    setCurrentChapterId(newCh.id);
                                }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className={styles.chapterList}>
                                {chapters.filter(ch => ch.order_index >= 0).map((chapter) => (
                                    <div
                                        key={chapter.id}
                                        className={`${styles.chapterItem} ${currentChapterId === chapter.id ? styles.chapterItemActive : ''}`}
                                        onClick={() => setCurrentChapterId(chapter.id)}
                                        onContextMenu={(e) => handleContextMenu(e, chapter.id)}
                                    >
                                        <GripVertical size={14} className={styles.chapterItemIcon} />
                                        <FileText size={14} className={styles.chapterItemIcon} />
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chapter.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Left/Center: Editor Area */}
                <div className={styles.editorMain}>
                    <div className={`${styles.editorContainer} ${hideTags ? 'hide-lore-tags' : ''}`} style={{ flex: 1 }} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                        <div className={styles.toolbar}>
                            <button
                                className={styles.toolBtn}
                                onClick={() => setIsPreviewing(!isPreviewing)}
                                style={isPreviewing ? { background: 'var(--bg-hover)', color: 'var(--text-primary)' } : {}}
                            >
                                <Layout size={16} style={{ marginRight: '0.5rem' }} /> Draft & Preview
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button
                                    className={styles.toolBtn}
                                    onClick={() => setShowHistory(!showHistory)}
                                    style={showHistory ? { background: 'var(--bg-hover)', color: 'var(--text-primary)' } : {}}
                                >
                                    <History size={16} style={{ marginRight: '0.5rem' }} /> Version History
                                </button>
                                {showHistory && (
                                    <div className={styles.historyPanel}>
                                        <div className={styles.historyHeader}>
                                            Document History
                                            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowHistory(false)} />
                                        </div>
                                        <div className={styles.historyList}>
                                            {historyItems.map((item) => (
                                                <div key={item.id} className={styles.historyItem}>
                                                    <div className={styles.historyTime}>{item.time}</div>
                                                    <div className={styles.historyDesc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>{item.desc}</span>
                                                        {item.revivable && item.chapterId && (
                                                            <button
                                                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'var(--accent-blue)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                                onClick={() => handleRestoreChapter(item.chapterId!, item.id)}
                                                            >
                                                                Restore
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                className={styles.toolBtn}
                                onClick={() => setHideTags(!hideTags)}
                            >
                                {hideTags ? 'Show Tags' : 'Hide Tags'}
                            </button>
                            <button
                                className={styles.toolBtn}
                                onClick={() => setShowHeatmap(!showHeatmap)}
                                style={showHeatmap ? { background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid var(--tag-purple-text)' } : {}}
                            >
                                <Activity size={16} style={{ marginRight: '0.5rem' }} /> Pacing Heatmap
                            </button>
                            <button
                                className={styles.toolBtn}
                                onClick={handleToggleFocusMode}
                                style={isFocusMode ? { background: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-text)' } : {}}
                            >
                                {isFocusMode ? <Minimize2 size={16} style={{ marginRight: '0.5rem' }} /> : <Maximize2 size={16} style={{ marginRight: '0.5rem' }} />}
                                {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
                            </button>
                        </div>

                        <div className={styles.documentHeader} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <h1
                                className={styles.documentTitle}
                                contentEditable
                                suppressContentEditableWarning
                                onFocus={() => setIsEditingTitle(true)}
                                onBlur={(e) => {
                                    // slight delay to allow the generate title button to be clicked before unmounting
                                    setTimeout(() => setIsEditingTitle(false), 200);
                                    handleTitleBlur(e);
                                }}
                            >
                                {chapterTitle}
                            </h1>
                            {isEditingTitle && (
                                <button
                                    className={styles.generateTitleBtn}
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        await handleGenerateTitle();
                                    }}
                                    disabled={isGeneratingTitle}
                                    onMouseDown={(e) => e.preventDefault()} // prevent blur on heading when clicking this button
                                >
                                    {isGeneratingTitle ? <Loader2 size={14} className={styles.spinner} /> : <Sparkles size={14} />}
                                    {isGeneratingTitle ? 'Generating...' : 'Generate Title'}
                                </button>
                            )}
                        </div>

                        {isLoading ? (
                            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                <Loader2 size={16} className={styles.spinner} /> Loading document...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    {editor && editor.getText().trim().length === 0 && !isPreviewing && (
                                        <div className={styles.emptyStateGen}>
                                            <div className={styles.emptyStateTitle}>
                                                <Wand2 size={16} color="var(--tag-purple-text)" /> AI {isNonFicProject ? 'Section' : 'Chapter'} Generation
                                            </div>
                                            <div className={styles.emptyStateDesc}>
                                                {isNonFicProject ? "This section is currently empty. Start drafting manually, or have Versana generate a first draft based on your Knowledge Base and the flow of prior sections." : "This chapter is currently empty. Start drafting manually, or have Versana generate a first draft based on your Context Matrix and the flow of prior chapters."}
                                            </div>
                                            <textarea
                                                className={styles.emptyStateInput}
                                                placeholder={isNonFicProject ? "Optional: Guide the generation (e.g., 'Discuss the implications of a high-carb diet...')" : "Optional: Guide the generation (e.g., 'Aris investigates the old fort and is ambushed by mechs...')"}
                                                value={chapterPrompt}
                                                onChange={(e) => setChapterPrompt(e.target.value)}
                                            />
                                            <div className={styles.emptyStateRow}>
                                                <select className={styles.emptyStateSelect} value={chapterLength} onChange={(e) => setChapterLength(e.target.value)}>
                                                    <option value="short">Short Section (~500 words)</option>
                                                    <option value="medium">Standard Section (~1500 words)</option>
                                                    <option value="long">Long Section (~3000 words)</option>
                                                </select>
                                                <button
                                                    className={styles.actionBtn}
                                                    style={{ background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid var(--tag-purple-text)', width: 'auto', padding: '0.4rem 1rem' }}
                                                    onClick={handleGenerateChapter}
                                                    disabled={isGeneratingChapter}
                                                >
                                                    {isGeneratingChapter ? <Loader2 size={14} className={styles.spinner} /> : <Sparkles size={14} />}
                                                    {isGeneratingChapter ? 'Generating...' : `Generate AI ${isNonFicProject ? 'Section' : 'Chapter'}`}
                                                </button>
                                                <button
                                                    className={styles.actionBtn}
                                                    style={{ background: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-text)', width: 'auto', padding: '0.4rem 1rem' }}
                                                    onClick={() => {
                                                        const seedText = `<p>The snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, the freezing wind biting at his exposed cheeks. He knew the Hegemony would be sending their mechs tonight. It was inevitable.</p><p>As he looked out over the tundras of <lore-tag data-id="123" data-entity-name="Kryok" data-aliases="[&quot;Ice Planet&quot;]" data-entity-type="place" data-synopsis="A frozen wasteland planet at the edge of the galaxy." data-status="Discovered" data-entity-str="{&quot;id&quot;:&quot;123&quot;,&quot;name&quot;:&quot;Kryok&quot;,&quot;aliases&quot;:[&quot;Ice Planet&quot;],&quot;type&quot;:&quot;place&quot;,&quot;synopsis&quot;:&quot;A frozen wasteland planet at the edge of the galaxy.&quot;,&quot;status&quot;:&quot;Discovered&quot;}">Kryok</lore-tag>, he thought about the ancient datacore hidden beneath the ice. The fate of the entire galaxy rested on protecting it from the <lore-tag data-id="456" data-entity-name="Hegemony" data-aliases="[&quot;Empire&quot;]" data-entity-type="faction" data-synopsis="An authoritarian interstellar empire." data-status="Discovered" data-entity-str="{&quot;id&quot;:&quot;456&quot;,&quot;name&quot;:&quot;Hegemony&quot;,&quot;aliases&quot;:[&quot;Empire&quot;],&quot;type&quot;:&quot;faction&quot;,&quot;synopsis&quot;:&quot;An authoritarian interstellar empire.&quot;,&quot;status&quot;:&quot;Discovered&quot;}">Hegemony's</lore-tag> grasp.</p><p>"Incoming signals," beeped his wrist-com. It was time.</p>`;
                                                        editor.commands.setContent(seedText);
                                                        setChapterPrompt('Aris investigates the old fort and is ambushed by mechs');
                                                    }}
                                                >
                                                    Seed Chapter 4 (Demo)
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <EditorContent editor={editor} />
                                </div>
                                {showHeatmap && editor && (
                                    <div style={{ flexShrink: 0 }}>
                                        <PacingHeatmap text={editor.getText()} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {isPreviewing && (
                        <div className={styles.previewPane}>
                            <div className={styles.previewHeader}>
                                <div className={styles.previewTitle}><Sparkles size={18} /> AI Draft Preview</div>
                                <button className={styles.toolBtn} onClick={() => setIsPreviewing(false)} style={{ border: 'none' }}><X size={16} /></button>
                            </div>
                            <div className={styles.previewContent}>
                                {previewContent ? (
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{previewContent}</p>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Generating draft...</p>
                                )}
                            </div>
                            <div className={styles.previewActions}>
                                <button
                                    className={styles.actionBtn}
                                    style={{ background: 'var(--tag-green-text)', color: 'white' }}
                                    onClick={() => {
                                        if (editor && previewContent) {
                                            editor.commands.insertContent(`<p>${previewContent.replace(/\n/g, '<br/>')}</p>`);
                                            setPreviewContent('');
                                            setIsPreviewing(false);
                                        }
                                    }}
                                >
                                    <Check size={16} /> Accept & Insert
                                </button>
                                <button
                                    className={styles.actionBtn}
                                    style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                                    onClick={() => {
                                        setPreviewContent('');
                                        setIsPreviewing(false);
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {contextMenu && (
                    <div style={{
                        position: 'fixed',
                        left: contextMenu.x,
                        top: contextMenu.y,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 1000,
                        borderRadius: '6px',
                        padding: '0.25rem 0',
                        minWidth: '150px'
                    }}>
                        <button
                            className={styles.contextMenuItem}
                            style={{ color: 'var(--accent-terracotta)' }}
                            onClick={() => handleDeleteChapter(contextMenu.chapterId)}
                        >
                            Delete Chapter
                        </button>
                    </div>
                )}

                {editorContextMenu && (
                    <div style={{
                        position: 'fixed',
                        left: editorContextMenu.x,
                        top: editorContextMenu.y,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 1000,
                        borderRadius: '6px',
                        padding: '0.25rem 0',
                        minWidth: '150px'
                    }}>
                        <button
                            className={styles.contextMenuItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                closeContextMenu();
                                handleCopilot('refine');
                            }}
                        >
                            <Sparkles size={14} /> Refine prose
                        </button>
                        <button
                            className={styles.contextMenuItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                closeContextMenu();
                                handleCopilot('rewrite');
                            }}
                        >
                            <MessageSquare size={14} /> Rewrite
                        </button>
                        <button
                            className={styles.contextMenuItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                closeContextMenu();
                                handleCopilot('expand');
                            }}
                        >
                            <Zap size={14} /> Expand
                        </button>
                        <button
                            className={styles.contextMenuItem}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                closeContextMenu();
                                handleCopilot('shorten');
                            }}
                        >
                            <Scissors size={14} /> Shorten
                        </button>
                    </div>
                )}

                <HoverCard
                    entity={hoverState.entity || loreDatabase[0]}
                    x={hoverState.x}
                    y={hoverState.y}
                    visible={hoverState.visible}
                    onClose={handleEntityLeave}
                    onMouseEnter={handleEntityEnter}
                />
            </div>

            {chapterToDelete && (
                <div className={styles.modalOverlay} onClick={() => setChapterToDelete(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Delete Chapter?</h2>
                        <p className={styles.modalBody}>
                            Are you sure you want to delete this chapter?
                            <br /><br />
                            You can restore it later from the Version History if needed.
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setChapterToDelete(null)}>Cancel</button>
                            <button className={styles.btnDelete} onClick={confirmDeleteChapter}>Delete Chapter</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
