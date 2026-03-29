'use client';

import React, { useState } from 'react';
import { ArrowDownToLine, Zap, Loader2, GitMerge } from 'lucide-react';
import styles from './ExpansionEngine.module.css';
import { useWorkspace } from '@/context/WorkspaceContext';

interface OutlineBeat {
    title: string;
    description: string;
    category: string;
}

interface ExpansionEngineProps {
    onExportToKanban: (beats: OutlineBeat[]) => void;
}

export default function ExpansionEngine({ onExportToKanban }: ExpansionEngineProps) {
    const { activeWorkspace } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const [inputText, setInputText] = useState('');
    const [isExpanding, setIsExpanding] = useState(false);
    const [summary, setSummary] = useState('');
    const [expandedBeats, setExpandedBeats] = useState<OutlineBeat[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasExported, setHasExported] = useState(false);

    const handleExpand = async () => {
        if (!inputText.trim()) return;

        setIsExpanding(true);
        setError(null);
        setSummary('');
        setExpandedBeats([]);

        try {
            const res = await fetch('/api/ai/expansion-engine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    workspaceId: activeWorkspace?.id,
                    genre: activeWorkspace?.genre || 'Fiction'
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to expand the text.';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            if (data.expandedOutline) {
                setExpandedBeats(data.expandedOutline);
                setSummary(data.summaryOfChanges);
                setHasExported(false);
            } else {
                setError('Failed to expand the text.');
            }
        } catch (err: unknown) {
            console.error("Expansion engine error", err);
            setError((err as Error).message || 'A network error occurred.');
        } finally {
            setIsExpanding(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.introBox}>
                <h2 className={styles.introTitle}>
                    <GitMerge size={20} /> The Expansion Engine
                </h2>
                <p className={styles.introDesc}>
                    {isNonFicProject
                        ? "Paste a short essay or summary of your topic. The Expansion Engine will structurally expand it into a comprehensive book outline, identifying areas to inject new arguments, case studies, or contextual history."
                        : "Paste a short story or detailed premise. The Expansion Engine will automatically deconstruct it into a full novel outline, intelligently injecting sub-plots, character arcs, and world-building detours to stretch it into a full book structure."}
                </p>
            </div>

            <div className={styles.editorArea}>
                <textarea
                    className={styles.textArea}
                    placeholder={isNonFicProject ? "Paste your short essay, abstract, or summary here..." : "Paste your short story, synopsis, or detailed premise here..."}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                />

                <button
                    className={styles.generateBtn}
                    onClick={handleExpand}
                    disabled={isExpanding || inputText.length < 50}
                >
                    {isExpanding ? <Loader2 size={16} className="spinner" /> : <Zap size={16} />}
                    {isExpanding ? 'Deconstructing & Expanding...' : 'Expand into Full Outline'}
                </button>
            </div>

            {error && (
                <div style={{ color: 'var(--tag-red-text)', background: 'var(--tag-red-bg)', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {expandedBeats.length > 0 && (
                <div className={styles.resultsArea}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryTitle}>AI Analysis & Summary of Changes</div>
                        <div className={styles.summaryText}>{summary}</div>
                    </div>

                    <div className={styles.actionRow}>
                        <button
                            className={styles.exportBtn}
                            onClick={() => {
                                onExportToKanban(expandedBeats);
                                setHasExported(true);
                            }}
                            disabled={hasExported}
                        >
                            <ArrowDownToLine size={16} />
                            {hasExported ? 'Imported to Kanban' : 'Import All to Kanban Board'}
                        </button>
                    </div>

                    <div className={styles.beatsList}>
                        {expandedBeats.map((beat, idx) => (
                            <div key={idx} className={styles.beatCard}>
                                <div className={styles.beatCardHeader}>
                                    <div className={styles.beatTitle}>{idx + 1}. {beat.title}</div>
                                    <div className={styles.beatCategory}>{beat.category}</div>
                                </div>
                                <div className={styles.beatDesc}>{beat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
