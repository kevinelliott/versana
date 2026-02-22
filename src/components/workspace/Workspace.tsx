'use client';

import React, { useState, MouseEvent, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, Wand2, MessageSquare, Scissors, Eye, Zap, Wind, FileText, Plus, GripVertical, History, Layout, Check, X, Loader2, Activity } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { LoreTag } from './editor/LoreTagExtension';
import HoverCard from './HoverCard';
import PacingHeatmap from './PacingHeatmap';
import styles from './Workspace.module.css';
import './editor/editor.css'; // We'll need a tiny bit of CSS for TipTap



export default function Workspace() {
    const { activeWorkspace, isPreviewing, setIsPreviewing, previewContent, setPreviewContent, setSelectedText, chapters, setChapters, currentChapterId, setCurrentChapterId } = useWorkspace();
    const [hoverState, setHoverState] = useState<{
        entity: any | null;
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
    const [loreDatabase, setLoreDatabase] = useState<any[]>([]);

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
                        const terms = [entity.name, ...entity.aliases];
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

    // Handle hovering via Event Delegation on the editor container
    useEffect(() => {
        const handleMouseOver = (e: Event) => {
            const mouseEvent = e as globalThis.MouseEvent;
            const target = mouseEvent.target as HTMLElement;
            if (target && target.hasAttribute('data-lore-tag')) {
                if (hideTags) return; // Don't show if tags are hidden

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

        const documentWrapper = document.querySelector('.ProseMirror');
        if (documentWrapper) {
            documentWrapper.addEventListener('mouseover', handleMouseOver);
        }

        return () => {
            if (documentWrapper) {
                documentWrapper.removeEventListener('mouseover', handleMouseOver);
            }
        };
    }, [editor, hideTags]);

    const handleEntityLeave = () => {
        setHoverState(prev => ({ ...prev, visible: false }));
    };

    return (
        <div className={styles.workspace} onClick={hoverState.visible ? handleEntityLeave : undefined}>
            {/* Chapter Manager Sidebar */}
            <div className={styles.chapterSidebar}>
                <div className={styles.chapterSidebarHeader}>
                    <div className={styles.chapterSidebarTitle}>Manuscript</div>
                    {isSaving && <Loader2 size={12} className={styles.spinner} style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />}
                    <button className={styles.addChapterBtn} onClick={async () => {
                        if (!activeWorkspace) return;
                        const res = await fetch('/api/chapters', {
                            method: 'POST',
                            body: JSON.stringify({ workspaceId: activeWorkspace.id, title: `Chapter ${chapters.length + 1}`, orderIndex: chapters.length })
                        });
                        const newCh = await res.json();
                        setChapters([...chapters, newCh]);
                        setCurrentChapterId(newCh.id);
                    }}>
                        <Plus size={16} />
                    </button>
                </div>
                <div className={styles.chapterList}>
                    {chapters.map((chapter) => (
                        <div
                            key={chapter.id}
                            className={`${styles.chapterItem} ${currentChapterId === chapter.id ? styles.chapterItemActive : ''}`}
                            onClick={() => setCurrentChapterId(chapter.id)}
                        >
                            <GripVertical size={14} className={styles.chapterItemIcon} />
                            <FileText size={14} className={styles.chapterItemIcon} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chapter.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Left/Center: Editor Area */}
            <div className={styles.editorMain}>
                <div className={`${styles.editorContainer} ${hideTags ? 'hide-lore-tags' : ''}`} style={{ flex: 1 }}>
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
                                        <div className={styles.historyItem}>
                                            <div className={styles.historyTime}>Today, 2:45 PM</div>
                                            <div className={styles.historyDesc}>AI "Expand Description" applied</div>
                                        </div>
                                        <div className={styles.historyItem}>
                                            <div className={styles.historyTime}>Today, 1:12 PM</div>
                                            <div className={styles.historyDesc}>Manual Save</div>
                                        </div>
                                        <div className={styles.historyItem}>
                                            <div className={styles.historyTime}>Yesterday, 4:30 PM</div>
                                            <div className={styles.historyDesc}>Beat-to-Scene Generation</div>
                                        </div>
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
                    </div>

                    <div className={styles.documentHeader}>
                        <h1
                            className={styles.documentTitle}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleTitleBlur}
                        >
                            {chapterTitle}
                        </h1>
                    </div>

                    {isLoading ? (
                        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Loader2 size={16} className={styles.spinner} /> Loading document...
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
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



            <HoverCard
                entity={hoverState.entity || loreDatabase[0]}
                x={hoverState.x}
                y={hoverState.y}
                visible={hoverState.visible}
                onClose={handleEntityLeave}
            />
        </div>
    );
}
