'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { InlineSuggestionMark } from './editor/InlineSuggestionExtension';
import { Zap, RefreshCw, Check, X, ShieldCheck, FileText } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './Workspace.module.css';
import deepEditsStyles from './DeepEdits.module.css';

export default function DeepEdits() {
    const { chapters, currentChapterId, activeWorkspace } = useWorkspace();
    const [isScanning, setIsScanning] = useState(false);
    
    const currentChapter = chapters.find(c => c.id === currentChapterId);
    
    // Internal Tiptap Editor strictly for Reviewing
    const editor = useEditor({
        extensions: [
            StarterKit,
            InlineSuggestionMark
        ],
        immediatelyRender: false,
        editable: false, 
        editorProps: {
            attributes: {
                class: styles.editorArea,
                style: 'padding: 2rem; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-light); min-height: 60vh;',
            },
        },
    });

    useEffect(() => {
        if (!editor || !currentChapter) return;
        
        // Wait briefly for editor to initialize
        setTimeout(() => {
            if (currentChapter.content && Object.keys(currentChapter.content).length > 0) {
                editor.commands.setContent(currentChapter.content);
            } else {
                editor.commands.setContent('<p class="text-secondary">This chapter is empty. Switch to Phase 4 to write the draft before reviewing.</p>');
            }
        }, 300);
        
    }, [currentChapterId, currentChapter, editor]);

    // Track active suggestions
    const [suggestions, setSuggestions] = useState<{id: string, text: string, suggestion: string, reason: string}[]>([]);

    useEffect(() => {
        if (!editor) return;
        const updateSuggestions = () => {
            const marks: any[] = [];
            editor.state.doc.descendants((node, pos) => {
                if (node.isText && node.marks) {
                    node.marks.forEach(mark => {
                        if (mark.type.name === 'inlineSuggestion') {
                            const { id, suggestion, reason } = mark.attrs;
                            // avoid duplicates if mark spans multiple text nodes
                            if (!marks.find(m => m.id === id)) {
                                marks.push({ id, text: node.text, suggestion, reason, pos });
                            } else {
                                const existing = marks.find(m => m.id === id);
                                existing.text += node.text;
                            }
                        }
                    });
                }
            });
            setSuggestions(marks);
        };

        editor.on('update', updateSuggestions);
        editor.on('transaction', updateSuggestions);
        
        // initial load
        setTimeout(updateSuggestions, 500);

        return () => {
            editor.off('update', updateSuggestions);
            editor.off('transaction', updateSuggestions);
        };
    }, [editor]);

    const handleAccept = async (id: string, newText: string) => {
        if (!editor) return;
        
        let targetPos = -1;
        let targetNodeSize = 0;
        
        editor.state.doc.descendants((node, pos) => {
            if (node.isText && node.marks) {
                const mark = node.marks.find(m => m.type.name === 'inlineSuggestion' && m.attrs.id === id);
                if (mark) {
                    if (targetPos === -1) {
                        targetPos = pos;
                    }
                    targetNodeSize += node.nodeSize;
                }
            }
        });

        if (targetPos > -1) {
            editor.chain().focus().deleteRange({ from: targetPos, to: targetPos + targetNodeSize }).insertContent(newText).run();
        }
        
        // In a real production app, we would push this change to Yjs.
        // For now, we save to DB.
        if (currentChapterId) {
             const contentJson = editor.getJSON();
             fetch(`/api/chapters/${currentChapterId}`, {
                 method: 'PATCH',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ content: contentJson })
             }).catch(console.error);
        }
    };

    const handleReject = async (id: string) => {
        if (!editor) return;
        editor.chain().focus().unsetInlineSuggestion(id).run();
        
        if (currentChapterId) {
            const contentJson = editor.getJSON();
            fetch(`/api/chapters/${currentChapterId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: contentJson })
            }).catch(console.error);
       }
    };

    const handleGlobalScan = async () => {
        // Mock global scan - in production this would chop the chapter into chunks
        // and send to Claude async to find 5-10 structural prose edits.
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            alert("Global AI Chapter Scan is currently disabled in the open-source preview to conserve API tokens. Use the ✨ Quick Edit tool on highlighted text in Phase 4!");
        }, 1500);
    };

    if (!activeWorkspace) return null;

    return (
        <div className={styles.workspaceContainer} style={{ background: 'var(--bg-secondary)', height: '100%', overflowY: 'auto' }}>
            <div className={styles.workspaceGlobalHeader} style={{ background: 'var(--bg-secondary)', borderBottom: 'none' }}>
                <h1 className={styles.phaseTitle}>
                    <span className={styles.phaseLabel}>Phase 5</span>
                    Prose Review & Copilot Editor
                </h1>
                <p className={styles.phaseSubtitle}>
                    Review your AI-generated deep edits, accept structural prose corrections, and finalize your draft.
                </p>
            </div>

            <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 160px)' }}>
                {/* Review Editor Pane */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} /> {currentChapter ? currentChapter.title : 'Select a chapter'}
                        </h2>
                        <button 
                            onClick={handleGlobalScan}
                            disabled={!currentChapter || isScanning}
                            style={{ background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid currentColor', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
                        >
                            {isScanning ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={14} />}
                            {isScanning ? 'Scanning Chapter...' : 'Scan Chapter with AI'}
                        </button>
                    </div>

                    <EditorContent editor={editor} />
                </div>

                {/* Suggestions Sidebar */}
                <div style={{ width: '350px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={16} color="var(--tag-purple-text)" /> AI Suggestions ({suggestions.length})
                        </h3>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                            {suggestions.length === 0 ? (
                                <div className={deepEditsStyles.emptyStateContainer} style={{ background: 'transparent', border: 'none', padding: '1rem 0', marginTop: 0 }}>
                                    <div className={`${deepEditsStyles.emptyIconWrapper} ${deepEditsStyles.purple}`} style={{ width: '48px', height: '48px' }}>
                                        <Check size={24} color="var(--tag-purple-text)" />
                                    </div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 500, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>No pending edits</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
                                        Highlight text in Phase 4 and use ✨ Quick Edit, or click Scan Chapter.
                                    </p>
                                </div>
                            ) : (
                                suggestions.map((sug) => (
                                    <div key={sug.id} style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '8px', padding: '1rem', animation: 'fadeIn 0.2s ease-out' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <ShieldCheck size={12} /> {sug.reason}
                                        </div>
                                        
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '0.5rem' }}>
                                            "{sug.text}"
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 500 }}>
                                            {sug.suggestion}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button 
                                                onClick={() => handleAccept(sug.id, sug.suggestion)}
                                                style={{ flex: 1, background: 'var(--tag-green-bg)', color: 'var(--tag-green-text)', border: '1px solid currentColor', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}
                                            >
                                                <Check size={14} /> Accept
                                            </button>
                                            <button 
                                                onClick={() => handleReject(sug.id)}
                                                style={{ flex: 1, background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
