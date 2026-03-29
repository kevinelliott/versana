'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import * as Y from 'yjs';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import SupabaseProvider from 'y-supabase';
import { IndexeddbPersistence } from 'y-indexeddb';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, ArrowRight, Wand2, MessageSquare, Scissors, Zap, FileText, Plus, GripVertical, History, Layout, Check, X, Loader2, Activity, ChevronLeft, ChevronRight, Maximize2, Minimize2, Search, Image as ImageIcon, Users, TextCursorInput , Type as TypeIcon } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LoreTag } from './editor/LoreTagExtension';
import { CommentMark } from './editor/CommentMarkExtension';
import CommentSidebar from './CommentSidebar';
import HoverCard, { EntityData } from './HoverCard';
import PacingHeatmap from './PacingHeatmap';
import InviteModal from './InviteModal';
import TypographyModal from './TypographyModal';
import styles from './Workspace.module.css';
import './editor/editor.css'; // We'll need a tiny bit of CSS for TipTap




function SortableChapterItem({ chapter, currentChapterId, setCurrentChapterId, handleContextMenu, wordCount }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.chapterItem} ${currentChapterId === chapter.id ? styles.chapterItemActive : ''}`}
            onClick={() => setCurrentChapterId(chapter.id)}
            onContextMenu={(e) => handleContextMenu(e, chapter.id)}
        >
            <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                <GripVertical size={14} className={styles.chapterItemIcon} />
            </div>
            <FileText size={14} className={styles.chapterItemIcon} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{chapter.title}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.5, flexShrink: 0 }}>{currentChapterId === chapter.id ? wordCount : (chapter.word_count || 0)}w</span>
        </div>
    );
}

export default function Workspace() {
    const {
        activeWorkspace, setActiveWorkspace, isPreviewing, setIsPreviewing, previewContent, setPreviewContent,
        selectedText, setSelectedText, chapters, setChapters, currentChapterId, setCurrentChapterId,
        isManuscriptNavOpen, setIsManuscriptNavOpen, isFocusMode, setIsFocusMode,
        setIsLeftSidebarOpen, setIsRightSidebarOpen, activeBook, wordCount, setWordCount, setReadabilityScore,
        setAiChatInitialPrompt, isTypewriterMode, setIsTypewriterMode, typography
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
    const [isScanningLore, setIsScanningLore] = useState(false);
    const [showTypography, setShowTypography] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [chapterTitle, setChapterTitle] = useState('');
    const [loreDatabase, setLoreDatabase] = useState<EntityData[]>([]);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    const [chapterPrompt, setChapterPrompt] = useState('');
    const [chapterLength, setChapterLength] = useState('medium');
    const [genTone, setGenTone] = useState('Standard');
    const [genPOV, setGenPOV] = useState('3rd Person Limited');
    const [genAgeRange, setGenAgeRange] = useState('Adult');
    const [isGeneratingChapter, setIsGeneratingChapter] = useState(false);
    const [refinePrompt, setRefinePrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Inline Image Generation State
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    // Collaboration & Sharing State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, chapterId: string } | null>(null);
    const [editorContextMenu, setEditorContextMenu] = useState<{ x: number, y: number } | null>(null);
    const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

    // Modal state for HoverCard actions
    const [quickEditEntity, setQuickEditEntity] = useState<EntityData | null>(null);
    const [quickEditSynopsis, setQuickEditSynopsis] = useState('');
    const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);

    const [askAiEntity, setAskAiEntity] = useState<EntityData | null>(null);
    const [askAiInput, setAskAiInput] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [historyItems, setHistoryItems] = useState<{ id: string, created_at: string, snapshot_note: string, content?: any, yjs_state?: any }[]>([]);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

        const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const activeChapters = chapters.filter(c => c.order_index >= 0).sort((a,b) => a.order_index - b.order_index);
            const oldIndex = activeChapters.findIndex((c) => c.id === active.id);
            const newIndex = activeChapters.findIndex((c) => c.id === over.id);
            const reordered = arrayMove(activeChapters, oldIndex, newIndex);
            
            // Re-assign order_index based on visual position
            const updated = reordered.map((ch, idx) => ({ ...ch, order_index: idx }));
            
            // Merge back with deleted chapters
            const deleted = chapters.filter(c => c.order_index < 0);
            setChapters([...updated, ...deleted]);
            
            // Sync new order silently
            for (const ch of updated) {
                 fetch(`/api/chapters/${ch.id}`, {
                     method: 'PATCH',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ order_index: ch.order_index })
                 }).catch(console.error);
            }
        }
    };

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

        // Mock snapshot note for soft-deleting
        setHistoryItems(prev => [{
            id: `del-${Date.now()}`,
            created_at: new Date().toISOString(),
            snapshot_note: `Deleted: "${ch?.title}"`,
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

        setCurrentChapterId(chapterId);
        setIsSaving(false);
    };

	const fetchSnapshots = async () => {
		if (!currentChapterId) return;
		setIsLoadingHistory(true);
		try {
			const res = await fetch(`/api/chapters/${currentChapterId}/snapshots`);
			if (res.ok) {
				const data = await res.json();
				setHistoryItems(data);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	useEffect(() => {
		if (showHistory && currentChapterId) {
			fetchSnapshots();
		}
	}, [showHistory, currentChapterId]);

	const handleAddCommentAction = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!editor || !currentChapterId || !activeWorkspace) return;
        
        const { from, to } = editor.state.selection;
        if (from === to) return;

        const text = editor.state.doc.textBetween(from, to, ' ');
        const body = window.prompt("Enter comment for: '" + text.substring(0, 30) + "...'");
        if (!body) return;

        // Generate a pseudo-id or let DB handle it, but we need it for the mark right now!
        const tempId = crypto.randomUUID();
        
        // Add Mark
        editor.chain().focus().setComment(tempId).run();
        
        // Post to API
        try {
            await fetch(`/api/chapters/${currentChapterId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commentId: tempId,
                    workspaceId: activeWorkspace.id,
                    fromPos: from,
                    toPos: to,
                    highlightedText: text,
                    commentBody: body
                })
            });
            // trigger refresh of comments
            window.dispatchEvent(new CustomEvent('VERSANA_REFRESH_COMMENTS'));
        } catch (err) {
            console.error("Failed to post comment", err);
        }
    };

    const handleTakeSnapshot = async (note: string) => {
		if (!currentChapterId || !editor) return;
		setIsSaving(true);
		try {
			const content = editor.getJSON();
			const res = await fetch(`/api/chapters/${currentChapterId}/snapshots`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content, note })
			});
			if (res.ok) {
				fetchSnapshots();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsSaving(false);
		}
	};

	const handleRestoreSnapshot = async (snapshotId: string) => {
		if (!currentChapterId || !editor) return;
		if (!window.confirm("Are you sure you want to restore this snapshot? This will overwrite your current progress.")) return;
		
		try {
			const res = await fetch(`/api/chapters/${currentChapterId}/snapshots/${snapshotId}`);
			if (res.ok) {
				const snapshot = await res.json();
				if (snapshot && snapshot.content) {
					editor.commands.setContent(snapshot.content);
					window.dispatchEvent(new CustomEvent('VERSANA_AUTO_DRAFT'));
				}
			}
		} catch (err) {
			console.error(err);
		}
	};

    const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
    const [syncProvider, setSyncProvider] = useState<any>(null);

    useEffect(() => {
        if (!currentChapterId || !activeWorkspace) return;

        console.log("Initializing Yjs and SupabaseProvider for chapter", currentChapterId);
        const doc = new Y.Doc();
        setYDoc(doc);
        const client = createClient();

        const provider = new SupabaseProvider(doc, client, {
            channel: `workspace-${activeWorkspace.id}-chapter-${currentChapterId}`,
            id: currentChapterId,
            tableName: 'chapters',
            columnName: 'yjs_state',
            resyncInterval: 5000
        });

        const indexeddbProvider = new IndexeddbPersistence(
            `mythos-offline-chapter-${currentChapterId}`,
            doc
        );

        const fetchUserForAwareness = async () => {
            try {
                const userRes = await fetch('/api/user/profile');
                if (userRes.ok) {
                    const u = await userRes.json();
                    provider.awareness.setLocalStateField('user', {
                        name: u.full_name || 'Co-Author', 
                        color: '#' + Math.floor(Math.random()*16777215).toString(16)
                    });
                }
            } catch {
                provider.awareness.setLocalStateField('user', {
                    name: 'Co-Author', 
                    color: '#' + Math.floor(Math.random()*16777215).toString(16)
                });
            }
        };
        fetchUserForAwareness();

        setSyncProvider(provider);

        return () => {
            provider.destroy();
            indexeddbProvider.destroy();
            doc.destroy();
        };
    }, [currentChapterId, activeWorkspace]);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    style: 'max-width: 100%; border-radius: 8px; margin: 1.5rem auto; display: block;'
                }
            }),
            Placeholder.configure({
                placeholder: 'Write your masterpiece...',
            }),
            Underline,
            LoreTag,
            CommentMark,
            ...(syncProvider && yDoc ? [
                Collaboration.configure({
                    document: yDoc,
                }),
                CollaborationCursor.configure({
                    provider: syncProvider,
                    user: syncProvider.awareness.getLocalState().user,
                })
            ] : [])
        ],
        immediatelyRender: false,
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

    // Typewriter Mode Effect
    useEffect(() => {
        if (!editor || !isTypewriterMode) return;

        const handleTypewriter = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Only scroll if we have a valid rect (not 0,0) and the editor is focused
                if (rect.top !== 0 && editor.isFocused) {
                    const targetY = window.innerHeight / 2;
                    const diff = rect.top - targetY;
                    
                    const scrollContainer = document.querySelector('main');
                    if (scrollContainer && Math.abs(diff) > 25) {
                        scrollContainer.scrollBy({ top: diff, behavior: 'smooth' });
                    }
                }
            }
        };

        editor.on('selectionUpdate', handleTypewriter);
        return () => {
            editor.off('selectionUpdate', handleTypewriter);
        };
    }, [editor, isTypewriterMode]);


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

                setTimeout(() => {
                    // Backwards compatibility migration:
                    // If Yjs state and local indexedDB are both empty, but we have legacy `content` JSON in the DB, 
                    // we inject it into the editor so Yjs picks it up and pushes it to Supabase.
                    if (editor.isEmpty || editor.getText().trim() === '') {
                        if (data.content && Object.keys(data.content).length > 0) {
                            editor.commands.setContent(data.content);
                        }
                    }
                }, 1000); // Wait 1s for Yjs IndexedDB & Supabase to potentially load
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
                // We save JSON as a read-model explicitly for non-Yjs readers (like AI generation or PDF export)
                const contentJson = editor.getJSON();

                // 1. Save chapter plain JSON
                await fetch(`/api/chapters/${currentChapterId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: contentJson })
                });

                // Background NER has been moved to manual scan mode
            } catch (err: unknown) {
                console.error("Auto-save failed:", err);
            } finally {
                setIsSaving(false);
            }
        };

        const onTransaction = () => {
            clearTimeout(debounceTimer);
            // Save after 1 second of typing inactivity
            debounceTimer = setTimeout(saveContent, 1000);

            // Calculate metrics (debounce this heavily for performance)
            if (editor.state.doc.textContent) {
                const text = editor.state.doc.textContent;
                const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
                setWordCount(words);

                // Very simple approximation of Flesch-Kincaid Grade Level 
                // Alternatively, simply hardcode a mock for now if syllable counting is too complex, 
                // but since they requested "actual not mock", let's approximate:
                const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
                // Rough syllable estimation: English words average ~1.5 syllables.
                // A true Flesch-Kincaid requires counting vowels per word. 
                // For a highly performant IDE we can do a quick syllable regex:
                const syllableCount = (text.match(/[aeiouy]+/gi) || []).length;

                const rawGrade = 0.39 * (words / sentences) + 11.8 * (syllableCount / (words || 1)) - 15.59;

                let letterGrade = 'A';
                if (rawGrade > 12) letterGrade = 'University';
                else if (rawGrade > 10) letterGrade = 'College';
                else if (rawGrade > 8) letterGrade = 'High School';
                else if (rawGrade > 6) letterGrade = '8th Grade';
                else letterGrade = '5th Grade';

                setReadabilityScore(letterGrade);
            } else {
                setWordCount(0);
                setReadabilityScore('N/A');
            }
        };

        editor.on('transaction', onTransaction);
        return () => {
            editor.off('transaction', onTransaction);
            clearTimeout(debounceTimer);
        }
    }, [editor, currentChapterId, activeWorkspace, setWordCount, setReadabilityScore]);

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

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate edit';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Co-Pilot failed:", err);
            setPreviewContent(err.message || "An error occurred during generation.");
        } finally {
            setIsGeneratingTitle(false);
        }
    };
    useEffect(() => {
        const trigger = () => {
             // Small delay to ensure state and context have been fully settled
             setTimeout(() => handleGenerateChapter(), 1000);
        };
        window.addEventListener('VERSANA_AUTO_DRAFT', trigger);
        return () => window.removeEventListener('VERSANA_AUTO_DRAFT', trigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace, chapters, currentChapterId]);

    const handleGenerateChapter = async () => {
        if (!activeWorkspace || isGeneratingChapter) return;
        setIsGeneratingChapter(true);
        setIsPreviewing(true);
        setPreviewContent('');

        // Helper to extract text from previous chapters
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extractTextFromTipTap = (node: any): string => {
            if (!node) return '';
            if (node.type === 'text') return node.text || '';
            if (node.content && Array.isArray(node.content)) {
                return node.content.map(extractTextFromTipTap).join(node.type === 'paragraph' ? '\n\n' : '');
            }
            return '';
        };

        const currentChapter = chapters.find(c => c.id === currentChapterId);
        const currentOrderIndex = currentChapter?.order_index || 999;
        const pastChapters = chapters.filter(c => c.order_index < currentOrderIndex).sort((a, b) => a.order_index - b.order_index).slice(-2);
        const currentContentStr = extractTextFromTipTap(currentChapter?.content).trim();

        // Provide Context Matrix
        const contextText = loreDatabase.map(e => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');
        const summaryStr = Array.isArray(chapters)
            ? chapters.map(c => `Chapter ${c.order_index}: ${c.title}`).join('\n')
            : '';

        const pastContentStr = pastChapters.map(c => `--- Chapter ${c.order_index}: ${c.title} ---\n${extractTextFromTipTap(c.content)}`).join('\n\n');

        const systemPrompt = isNonFicProject
            ? `You are an elite non-fiction writer and SME. Generate a complete draft for the new section roughly titled "${chapterTitle}".

PARAMETERS:
- Tone: ${genTone}
- POV/Style: ${genPOV}
- Target Audience: ${genAgeRange}
- Target length: ${chapterLength} (short: ~500 words, medium: ~1500 words, long: ~3000 words).

IMPORTANT RULES:
1. Generate a suitable, professional title at the very beginning of your response on the first line, exactly formatted as: TITLE: Your New Title
2. Do not include any other markdown formatting or pleasantries.
3. Simply output the exact prose paragraph by paragraph.
4. Smoothly transition from the previous section.

KNOWLEDGE BASE:
${contextText}

SECTION PROGRESSION SO FAR:
${summaryStr}
${currentContentStr ? `\nCURRENT SECTION OUTLINE/BEATS (Strictly incorporate these plot points into your prose):\n${currentContentStr}\n` : ''}
RECENT PREVIOUS SECTION TEXT (for seamless continuation and ensuring you do NOT repeat the same sentence structures or themes):
---
${pastContentStr}
---`
            : `You are a master fiction author and elite literary stylist. Generate a complete draft for the new chapter roughly titled "${chapterTitle}".

PARAMETERS:
- Tone: ${genTone}
- POV: ${genPOV}
- Audience Age Range: ${genAgeRange}
- Target length: ${chapterLength} (short: ~500 words, medium: ~1500 words, long: ~3000 words).

IMPORTANT LITERARY RULES (CRITICAL):
1. Generate a suitable, creative title at the very beginning of your response on the first line, exactly formatted as: TITLE: Your New Title
2. Do not include markdown formatting, bullet points, or pleasantries. Output final prose paragraph by paragraph.
3. NEVER start the chapter with a simple "[Character] did [action]" sentence (e.g. "Aris looked out the window." or "Elara sighed.").
4. VARY YOUR SENTENCE STRUCTURES. Intertwine sensory description, introspection, and atmospheric scene-setting into your opening hook.
5. Emulate the prose quality of literary fiction or high-end genre fiction, utilizing &quot;Show, Don't Tell&quot; principles. 
6. Do NOT reuse the same tropes, opening structures, or patterns as the previous chapters. We need a fresh hook (e.g., start with dialogue, in media res, a sweeping atmospheric description, or a philosophical reflection closely tied to the POV character).

CONTEXT MATRIX (LORE BIBLE):
${contextText}

OVERALL CHAPTER OUTLINE:
${summaryStr}
${currentContentStr ? `\nCURRENT CHAPTER NOTES/BEATS (Strictly incorporate these plot points or outlines into your opening hook and prose):\n${currentContentStr}\n` : ''}
RECENT PREVIOUS CHAPTER TEXT (Ensure you match the timeline and do not contradict what just happened. Do not repeat the same events.):
---
${pastContentStr}
---`;

        try {
            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: `Please write the draft. ${chapterPrompt ? `User's guiding instructions: ${chapterPrompt}` : ''}` }]
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate chapter';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let fullText = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk;
                setPreviewContent(prev => prev + chunk);
            }

            // Post-process to extract title
            const titleMatch = fullText.match(/^TITLE:\s*([^\n]+)\n+/i) || fullText.match(/^\*TITLE:\s*([^\n\*]+)\*\n+/i);
            if (titleMatch) {
                const extractedTitle = titleMatch[1].trim();
                const remainingText = fullText.replace(/^TITLE:\s*[^\n]+\n+/i, '').replace(/^\*TITLE:\s*[^\n\*]+\*\n+/i, '').trim();

                setChapterTitle(extractedTitle);
                setPreviewContent(remainingText);

                if (currentChapterId) {
                    setChapters(prev => prev.map(ch => ch.id === currentChapterId ? { ...ch, title: extractedTitle } : ch));
                    fetch(`/api/chapters/${currentChapterId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: extractedTitle })
                    });
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Chapter Generation failed:", err);
            setPreviewContent(err.message || "An error occurred during generation.");
        } finally {
            setIsGeneratingChapter(false);
            setChapterPrompt('');
        }
    };

    const handleRefineDraft = async () => {
        if (!activeWorkspace || !previewContent || !refinePrompt) return;
        setIsRefining(true);

        const systemPrompt = isNonFicProject
            ? `You are an elite non-fiction editor. Revise the provided draft according to the user's specific request.
IMPORTANT RULES:
1. Maintain the exact formatting of the TITLE: Your Title header if it exists.
2. Return ONLY the fully revised prose paragraph by paragraph. Do not include pleasantries or meta-commentary.`
            : `You are a master fiction editor. Revise the provided chapter draft according to the user's specific request.
IMPORTANT RULES:
1. Maintain the exact formatting of the TITLE: Your Title header if it exists.
2. Return ONLY the fully revised prose paragraph by paragraph. Do not include pleasantries or meta-commentary.`;

        try {
            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [
                        { role: 'user', content: `Here is the current draft:\n\n${previewContent}\n\nPlease revise it based on this request: ${refinePrompt}` }
                    ]
                })
            });

            if (!res.ok) throw new Error('Refinement failed');
            if (!res.body) throw new Error('No body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            
            setPreviewContent(''); // Clear to stream the new version
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                setPreviewContent(prev => prev + decoder.decode(value, { stream: true }));
            }
        } catch (err: any) {
            console.error("Refinement failed:", err);
            setPreviewContent("An error occurred during refinement. " + (err.message || ""));
        } finally {
            setIsRefining(false);
            setRefinePrompt('');
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
        setError(null);
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

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate title';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error('Failed to generate title', e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const handleScanLore = async () => {
        if (!editor || !activeWorkspace) return;
        const textContent = editor.getText();
        if (textContent.trim().length <= 50) return;

        setIsScanningLore(true);
        setError(null);
        try {
            const res = await fetch('/api/jobs/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    jobType: 'lore_ner_scan', 
                    workspaceId: activeWorkspace.id,
                    payload: { textLength: textContent.length }
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                throw new Error(`Failed to schedule job: ${errText}`);
            }
            // Job is scheduled! The floating pill will track it automatically.
        } catch (e: any) {
            console.error("Failed to queue lore scan", e);
            setError(e.message || "An error occurred");
        } finally {
            setIsScanningLore(false);
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

    const handleSaveQuickEdit = async () => {
        if (!quickEditEntity) return;
        setIsSavingQuickEdit(true);
        try {
            const res = await fetch(`/api/lore/${quickEditEntity.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ synopsis: quickEditSynopsis })
            });
            if (res.ok) {
                // Optimistic update
                setLoreDatabase(prev => prev.map(l => l.id === quickEditEntity.id ? { ...l, synopsis: quickEditSynopsis } : l));
                setQuickEditEntity(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingQuickEdit(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!activeWorkspace || !imagePrompt.trim() || !editor) return;

        setIsGeneratingImage(true);
        setImageError(null);

        try {
            const res = await fetch('/api/ai/generate-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    type: isNonFicProject ? "Informational Graphic" : "Book Illustration",
                    workspaceId: activeWorkspace.id,
                    style: isNonFicProject ? "clean vector illustration, minimalist, corporate, white background" : "cinematic lighting, vivid colors, detailed illustration"
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate image';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            if (data.url) {
                editor.chain().focus().setImage({ src: data.url }).run();
                setIsImageModalOpen(false);
                setImagePrompt('');
            }
        } catch (err: unknown) {
            console.error("Image generation failed:", err);
            setImageError((err as Error).message || "An error occurred");
        } finally {
            setIsGeneratingImage(false);
        }
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
                    <h1 className={styles.phaseTitle} style={{ flex: 1 }}>
                        <span className={styles.phaseLabel}>Phase 4</span>
                        {isNonFicProject ? 'Drafting & Content' : 'Drafting & Writing'}
                    </h1>
                    <button 
                        className={styles.btnPrimary} 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <Users size={16} /> Share & Co-Author
                    </button>
                    <button
                        className={styles.headerActionBtn}
                        onClick={handleToggleFocusMode}
                        title="Focus Mode"
                    >
                        {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
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
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={chapters.filter(ch => ch.order_index >= 0).map(c => c.id)} strategy={verticalListSortingStrategy}>
                                        {chapters.filter(ch => ch.order_index >= 0).map((chapter) => (
                                            <SortableChapterItem
                                                key={chapter.id}
                                                chapter={chapter}
                                                currentChapterId={currentChapterId}
                                                setCurrentChapterId={setCurrentChapterId}
                                                handleContextMenu={handleContextMenu}
                                                wordCount={wordCount}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
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
                                <button
                                    className={styles.toolBtn}
                                    onClick={() => setShowComments(!showComments)}
                                    style={showComments ? { background: 'var(--bg-hover)', color: 'var(--text-primary)' } : {}}
                                >
                                    <MessageSquare size={16} style={{ marginRight: '0.5rem' }} /> Comments
                                </button>
                                {showHistory && (
                                    <div className={styles.historyPanel}>
                                        <div className={styles.historyHeader}>
                                            Document History
                                            <X size={16} style={{ cursor: 'pointer' }} onClick={() => setShowHistory(false)} />
                                        </div>
										<div style={{ padding: '0.5rem 1rem' }}>
											<button 
												className={styles.btnPrimary} 
												style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}
												onClick={() => handleTakeSnapshot('Manual Snapshot')}
											>
												<History size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Take Snapshot
											</button>
										</div>
                                        <div className={styles.historyList}>
											{isLoadingHistory && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}><Loader2 size={16} className="spinner" /></div>}
                                            {!isLoadingHistory && historyItems.length === 0 && (
												<div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No snapshots yet.</div>
											)}
											{historyItems.map((item) => (
                                                <div key={item.id} className={styles.historyItem}>
                                                    <div className={styles.historyTime}>{new Date(item.created_at).toLocaleString()}</div>
                                                    <div className={styles.historyDesc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span>{item.snapshot_note}</span>
                                                        <button
                                                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer' }}
                                                            onClick={() => handleRestoreSnapshot(item.id)}
                                                        >
                                                            Restore
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                className={styles.toolBtn}
                                onClick={handleScanLore}
                                disabled={isScanningLore}
                            >
                                {isScanningLore ? <Loader2 size={16} className="spinner" style={{ marginRight: '0.5rem' }} /> : <Search size={16} style={{ marginRight: '0.5rem' }} />}
                                Scan Lore
                            </button>
                            <button
                                className={styles.toolBtn}
                                onClick={() => setIsImageModalOpen(true)}
                            >
                                <ImageIcon size={16} style={{ marginRight: '0.5rem' }} /> Insert Image
                            </button>
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
                            <button
                                className={styles.toolBtn}
                                onClick={() => setIsTypewriterMode(!isTypewriterMode)}
                                style={isTypewriterMode ? { background: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-text)' } : {}}
                            >
                                <TextCursorInput size={16} style={{ marginRight: '0.5rem' }} /> Typewriter
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button
                                    className={styles.toolBtn}
                                    onClick={() => setShowTypography(!showTypography)}
                                    style={showTypography ? { background: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-text)' } : {}}
                                >
                                    <TypeIcon size={16} style={{ marginRight: '0.5rem' }} /> Typography
                                </button>
                                {showTypography && <TypographyModal onClose={() => setShowTypography(false)} />}
                            </div>
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
                                            <div className={styles.emptyStateColumn}>
                                                <div className={styles.emptyStateTitle}>
                                                    <FileText size={18} color="var(--accent-blue)" /> Start Writing
                                                </div>
                                                <div className={styles.emptyStateDesc}>
                                                    Begin drafting your {isNonFicProject ? 'section' : 'chapter'} manually. New to Versana? We recommend following the 8 Phases in the left panel. Scaffold your universe in Phases 1-3 so the AI can generate a highly-contextualized first draft for you here in Phase 4.
                                                </div>
                                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', width: '100%', padding: '0.6rem 1rem' }}
                                                        onClick={() => editor.commands.focus()}
                                                    >
                                                        Click here to start typing
                                                    </button>
                                                </div>
                                            </div>

                                            <div className={styles.emptyStateColumn}>
                                                <div className={styles.emptyStateTitle}>
                                                    <Wand2 size={18} color="var(--tag-purple-text)" /> AI First Draft
                                                </div>
                                                <div className={styles.emptyStateDesc}>
                                                    Let Versana generate a structurally sound first draft based on your {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}.
                                                </div>
                                                <textarea
                                                    className={styles.emptyStateInput}
                                                    placeholder={isNonFicProject ? "e.g., 'Discuss the implications of a high-carb diet...'" : "e.g., 'Aris investigates the old fort and is ambushed by mechs...'"}
                                                    value={chapterPrompt}
                                                    onChange={(e) => setChapterPrompt(e.target.value)}
                                                    style={{ minHeight: '60px', marginBottom: '0.5rem' }}
                                                />
                                                <div className={styles.emptyStateRow}>
                                                    <select className={styles.emptyStateSelect} value={chapterLength} onChange={(e) => setChapterLength(e.target.value)}>
                                                        <option value="short">Short (~500 words)</option>
                                                        <option value="medium">Standard (~1500 words)</option>
                                                        <option value="long">Long (~3000 words)</option>
                                                    </select>
                                                    <select className={styles.emptyStateSelect} value={genTone} onChange={(e) => setGenTone(e.target.value)}>
                                                        <option value="Standard">Standard Tone</option>
                                                        <option value="Dark">Dark & Gritty</option>
                                                        <option value="Lighthearted">Lighthearted</option>
                                                        <option value="Action-Packed">Action-Packed</option>
                                                        <option value="Melancholy">Melancholy</option>
                                                    </select>
                                                </div>
                                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        style={{ background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid var(--tag-purple-text)', width: '100%', padding: '0.6rem 1rem' }}
                                                        onClick={handleGenerateChapter}
                                                        disabled={isGeneratingChapter}
                                                    >
                                                        {isGeneratingChapter ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                                                        {isGeneratingChapter ? 'Generating...' : `Generate Draft`}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {wordCount === 0 && !isGeneratingChapter && (
                                        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)', margin: '2rem 3rem' }}>
                                            <Sparkles size={32} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--tag-blue-text)' }} />
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>This chapter is empty</h3>
                                            <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                                Start typing below to draft your chapter manually, or generate an AI draft above. For best results, build out your {isNonFicProject ? 'Knowledge Base' : 'Lore Bible'} in Phase 3 first.
                                            </p>
                                        </div>
                                    )}
                                    <div style={{
                                        fontFamily: typography.fontFamily === 'serif' ? '"EB Garamond", "Georgia", serif' : typography.fontFamily === 'sans' ? '"Inter", system-ui, sans-serif' : 'monospace',
                                        fontSize: `${typography.fontSize}px`,
                                        lineHeight: typography.lineHeight,
                                        maxWidth: `${typography.maxWidth}px`,
                                        margin: '0 auto',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <EditorContent editor={editor} />
                                    </div>
                                    {editor && (
                                        <BubbleMenu editor={editor} className={styles.bubbleMenu}>
                                            <button
                                                onClick={() => editor.chain().focus().toggleBold().run()}
                                                className={editor.isActive('bold') ? styles.bubbleBtnActive : styles.bubbleBtn}
                                            >
                                                Bold
                                            </button>
                                            <button
                                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                                className={editor.isActive('italic') ? styles.bubbleBtnActive : styles.bubbleBtn}
                                            >
                                                Italic
                                            </button>
                                            <button
                                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                                className={editor.isActive('strike') ? styles.bubbleBtnActive : styles.bubbleBtn}
                                            >
                                                Strike
                                            </button>
                                            <button
                                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                                className={editor.isActive('underline') ? styles.bubbleBtnActive : styles.bubbleBtn}
                                            >
                                                Underline
                                            </button>
                                            <div className={styles.bubbleDivider} />
                                            <button
                                                onClick={handleAddCommentAction}
                                                className={styles.bubbleBtn}
                                            >
                                                <MessageSquare size={14} style={{ marginRight: '4px' }} />
                                                Add Comment
                                            </button>
                                            <div className={styles.bubbleDivider} />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedText(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' '));
                                                    setEditorContextMenu({ x: e.clientX, y: e.clientY });
                                                }}
                                                className={styles.bubbleBtnAi}
                                            >
                                                <Sparkles size={14} style={{ marginRight: '4px' }} />
                                                AI Actions
                                            </button>
                                        </BubbleMenu>
                                    )}
                                    {editor && (
                                        <FloatingMenu editor={editor} className={styles.floatingMenu}>
                                            <button
                                                className={editor.isActive('heading', { level: 1 }) ? styles.floatingBtnActive : styles.floatingBtn}
                                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                            >
                                                H1
                                            </button>
                                            <button
                                                className={editor.isActive('heading', { level: 2 }) ? styles.floatingBtnActive : styles.floatingBtn}
                                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                            >
                                                H2
                                            </button>
                                            <button
                                                className={editor.isActive('bulletList') ? styles.floatingBtnActive : styles.floatingBtn}
                                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                            >
                                                Bullet List
                                            </button>
                                            <button
                                                className={editor.isActive('orderedList') ? styles.floatingBtnActive : styles.floatingBtn}
                                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                            >
                                                Numbered List
                                            </button>
                                            <button
                                                className={editor.isActive('blockquote') ? styles.floatingBtnActive : styles.floatingBtn}
                                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                            >
                                                Quote
                                            </button>
                                            <button
                                                className={styles.floatingBtnAi}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--tag-purple-text)' }}
                                                onClick={() => setIsImageModalOpen(true)}
                                            >
                                                <ImageIcon size={14} /> AI Art
                                            </button>
                                        </FloatingMenu>
                                    )}

                                </div>
                                {showHeatmap && editor && (
                                    <div style={{ flexShrink: 0 }}>
                                        <PacingHeatmap text={editor.getText()} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                
                    {showComments && currentChapterId && (
                        <CommentSidebar 
                            currentChapterId={currentChapterId} 
                            onResolve={(commentId) => {
                                if (editor) {
                                    editor.chain().focus().unsetComment(commentId).run();
                                }
                                fetch(`/api/chapters/${currentChapterId}/comments`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ commentId, resolved: true })
                                });
                            }} 
                        />
                    )}

                    {isPreviewing && (
                        <div className={styles.previewPane}>
                            <div className={styles.previewHeader}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <div className={styles.previewTitle}><Sparkles size={18} /> AI Draft Preview</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--tag-purple-text)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Zap size={12} /> Guided by your Phase 2 Beats
                                    </div>
                                </div>
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
                                    onClick={async () => {
                                        if (editor && previewContent) {
                                            let finalContent = previewContent;

                                            // Parse the generated title out and save it
                                            const titleMatch = previewContent.match(/^TITLE:\s*(.+)$/m);
                                            if (titleMatch && titleMatch[1]) {
                                                const newTitle = titleMatch[1].trim();
                                                setChapterTitle(newTitle);

                                                // Sync title over to Supabase immediately
                                                if (activeWorkspace) {
                                                    await fetch(`/api/chapters/${currentChapterId}`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ title: newTitle })
                                                    });
                                                }
                                                // Strip the title from the inserted content
                                                finalContent = finalContent.replace(/^TITLE:\s*(.+)$\n*/m, '').trim();
                                            }

                                            editor.commands.insertContent(`<p>${finalContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`);
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
                                        setIsRefining(false);
                                        setRefinePrompt('');
                                        setIsPreviewing(false);
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                            {/* Refine Draft Loop */}
                            {previewContent && !isGeneratingChapter && (
                                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 'Make it scarier' or 'Expand on the sensory details'" 
                                        className={styles.emptyStateInput} 
                                        style={{ flex: 1, minHeight: 'auto', padding: '0.5rem 0.75rem', marginBottom: 0 }}
                                        value={refinePrompt}
                                        onChange={e => setRefinePrompt(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && refinePrompt.trim()) {
                                                handleRefineDraft();
                                            }
                                        }}
                                        disabled={isRefining}
                                    />
                                    <button 
                                        className={styles.actionBtn} 
                                        onClick={handleRefineDraft} 
                                        disabled={!refinePrompt.trim() || isRefining}
                                        style={{ whiteSpace: 'nowrap', border: '1px solid var(--tag-blue-text)', background: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)' }}
                                    >
                                        {isRefining ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                                        Refine Draft
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {contextMenu && (
                    <div 
                        className={styles.contextMenu}
                        style={{
                            left: contextMenu.x,
                            top: contextMenu.y
                        }}
                    >
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
                    <div 
                        className={styles.contextMenu}
                        style={{
                            left: editorContextMenu.x,
                            top: editorContextMenu.y
                        }}
                    >
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
                                if (editor) {
                                    const { from, to } = editor.state.selection;
                                    const text = editor.state.doc.textBetween(from, to, ' ');
                                    // Normally we would pop a little UI asking for their comment string before confirming it.
                                    // For a slick demo flow, let's just trigger a generic JS prompt if they are testing
                                    const body = window.prompt("Enter your comment on: '" + text.substring(0, 30) + "...'");
                                    if (body) {
                                        const commentId = crypto.randomUUID();
                                        editor.chain().focus().setComment(commentId).run();
                                        fetch(`/api/chapters/${currentChapterId}/comments`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                commentId,
                                                workspaceId: activeWorkspace?.id,
                                                fromPos: from,
                                                toPos: to,
                                                highlightedText: text,
                                                commentBody: body
                                            })
                                        }).then(() => {
                                            setShowComments(true);
                                        });
                                    }
                                }
                            }}
                        >
                            <MessageSquare size={14} /> Add Comment
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
                    onQuickEdit={() => {
                        setQuickEditSynopsis(hoverState.entity?.synopsis || '');
                        setQuickEditEntity(hoverState.entity);
                        handleEntityLeave();
                    }}
                    onAskAI={() => {
                        setAskAiInput('');
                        setAskAiEntity(hoverState.entity);
                        handleEntityLeave();
                    }}
                />
            </div>

            {quickEditEntity && (
                <div className={styles.modalOverlay} onClick={() => setQuickEditEntity(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Quick Edit: {quickEditEntity.name}</h2>
                        <textarea
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                margin: '1rem 0',
                                fontFamily: 'inherit',
                                fontSize: '0.9rem',
                                resize: 'vertical'
                            }}
                            value={quickEditSynopsis}
                            onChange={(e) => setQuickEditSynopsis(e.target.value)}
                            placeholder="Add synopsis details..."
                            autoFocus
                        />
                        <div className={styles.modalActions}>
                            <button className={styles.btnCancel} onClick={() => setQuickEditEntity(null)}>Cancel</button>
                            <button
                                className={styles.actionBtn}
                                style={{ background: 'var(--tag-green-text)', color: 'white' }}
                                onClick={handleSaveQuickEdit}
                                disabled={isSavingQuickEdit}
                            >
                                {isSavingQuickEdit ? 'Saving...' : 'Save to Vector DB'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {askAiEntity && (
                <div className={styles.modalOverlay} onClick={() => setAskAiEntity(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={18} color="var(--accent-blue)" /> Ask AI about {askAiEntity.name}
                        </h2>
                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', margin: '1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {isNonFicProject ? "I'm ready to answer any questions about this concept, framework, or reference data from your Knowledge Base." : "I'm ready to answer any questions about this lore entity based on your Context Matrix."}
                        </div>
                        <input
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontFamily: 'inherit',
                                fontSize: '0.95rem'
                            }}
                            placeholder={`Ask something about ${askAiEntity.name}...`}
                            value={askAiInput}
                            onChange={(e) => setAskAiInput(e.target.value)}
                            autoFocus
                        />
                        <div className={styles.modalActions} style={{ marginTop: '1.5rem' }}>
                            <button className={styles.btnCancel} onClick={() => setAskAiEntity(null)}>Close</button>
                            <button
                                className={styles.actionBtn}
                                style={{ background: 'var(--accent-blue)', color: 'white' }}
                                onClick={() => {
                                    setIsRightSidebarOpen(true);
                                    setAiChatInitialPrompt(askAiInput);
                                    setAskAiEntity(null);
                                }}
                            >
                                Send to Co-Pilot <Sparkles size={14} style={{ marginLeft: '0.25rem' }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isImageModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsImageModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ImageIcon size={18} color="var(--accent-blue)" /> {isNonFicProject ? 'Generate Diagram/Graphic' : 'Generate Asset/Illustration'}
                        </h2>
                        <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', margin: '1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {isNonFicProject ? "Describe the graphic you want to generate. Powered by DALL-E 3." : "Describe the character, item, or place. Powered by DALL-E 3."}
                        </div>
                        <textarea
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                fontFamily: 'inherit',
                                fontSize: '0.95rem',
                                minHeight: '80px',
                                resize: 'vertical'
                            }}
                            placeholder={isNonFicProject ? "e.g. A minimalist timeline showing exponential growth..." : "e.g. A sketch of an ornate dwarven battleaxe..."}
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            disabled={isGeneratingImage}
                            autoFocus
                        />
                        {imageError && (
                            <div style={{ padding: '0.75rem', marginTop: '0.5rem', background: 'var(--tag-red-bg)', color: 'var(--tag-red-text)', borderRadius: '4px', fontSize: '0.85rem' }}>
                                {imageError}
                            </div>
                        )}
                        <div className={styles.modalActions} style={{ marginTop: '1.5rem' }}>
                            <button className={styles.btnCancel} disabled={isGeneratingImage} onClick={() => setIsImageModalOpen(false)}>Cancel</button>
                            <button
                                className={styles.actionBtn}
                                style={{ background: 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage || !imagePrompt.trim()}
                            >
                                {isGeneratingImage ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />}
                                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
            <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>
    );
}
