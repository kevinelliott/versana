'use client';

import React from 'react';
import { Target, Clock, BookOpen, PenTool, Hash, MapPin, User, Bookmark, ArrowRight } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import styles from './HomeDashboard.module.css';

export default function HomeDashboard() {
    const { activeWorkspace, activeBook, books, chapters, wordCount } = useWorkspace();
    const { setActivePhase } = usePhase();

    if (!activeWorkspace) {
        return (
            <div className={styles.emptyState}>
                <h2>Select or Create a Universe</h2>
                <p>Welcome to Versana. Please select a universe from the left sidebar to begin.</p>
            </div>
        );
    }

    const target = activeBook?.target_word_count || 50000;
    const progress = Math.min(100, Math.max(0, (wordCount / target) * 100));
    
    // Sort chapters by recently edited if we tracked that, otherwise let's just reverse them for "recent"
    const recentChapters = [...chapters].reverse().slice(0, 3);
    const totalChapters = chapters.length;

    const getLoreIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'character') return <User size={16} />;
        if (t === 'place' || t === 'setting') return <MapPin size={16} />;
        if (t === 'plot hook') return <Bookmark size={16} />;
        if (t === 'rule' || t === 'lore') return <BookOpen size={16} />;
        return <Hash size={16} />;
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1>Welcome back to {activeWorkspace.name}</h1>
                <p className={styles.subtitle}>Here is a 10,000-foot view of your universe's progress.</p>
            </header>

            <div className={styles.grid}>
                {/* Word Count / Goal Ring Panel */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><Target size={18} /> Current Goal</h3>
                    </div>
                    
                    {activeBook ? (
                        <div className={styles.goalDisplay}>
                            <div className={styles.ringWrapper}>
                                <svg width="120" height="120" viewBox="0 0 120 120" className={styles.ringSvg}>
                                    <circle cx="60" cy="60" r="50" className={styles.ringBg} />
                                    <circle 
                                        cx="60" cy="60" r="50" 
                                        className={styles.ringProgress} 
                                        strokeDasharray={314} 
                                        strokeDashoffset={314 - (progress / 100) * 314}
                                        stroke={progress >= 100 ? 'var(--accent-green)' : 'var(--accent-blue)'}
                                    />
                                </svg>
                                <div className={styles.ringValue}>
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className={styles.goalStats}>
                                <div className={styles.statLine}>
                                    <span className={styles.statLabel}>Words written:</span>
                                    <span className={styles.statValue}>{wordCount.toLocaleString()}</span>
                                </div>
                                <div className={styles.statLine}>
                                    <span className={styles.statLabel}>Target goal:</span>
                                    <span className={styles.statValue}>{target.toLocaleString()}</span>
                                </div>
                                <div className={styles.statLine}>
                                    <span className={styles.statLabel}>Remaining:</span>
                                    <span className={styles.statValue}>{Math.max(0, target - wordCount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className={styles.muted}>Select a book from the Sidebar to track progress.</p>
                    )}
                </div>

                {/* Quick Actions Panel */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3><PenTool size={18} /> Quick Jump</h3>
                    </div>
                    <div className={styles.actionGrid}>
                        <button className={styles.actionBtn} onClick={() => setActivePhase('1')}>
                            <span>Phase 1</span>
                            <strong>Concept</strong>
                        </button>
                        <button className={styles.actionBtn} onClick={() => setActivePhase('2')}>
                            <span>Phase 2</span>
                            <strong>Planning</strong>
                        </button>
                        <button className={styles.actionBtn} onClick={() => setActivePhase('4')} disabled={!activeBook}>
                            <span>Phase 4</span>
                            <strong>Drafting</strong>
                        </button>
                        <button className={styles.actionBtn} onClick={() => setActivePhase('lore')}>
                            <span>Database</span>
                            <strong>Lore Bible</strong>
                        </button>
                    </div>
                </div>

                {/* Recent Chapters Panel */}
                <div className={`${styles.card} ${styles.wideCard}`}>
                    <div className={styles.cardHeader}>
                        <h3><Clock size={18} /> Recent Drafts</h3>
                        <span className={styles.badge}>{totalChapters} total</span>
                    </div>
                    {recentChapters.length > 0 ? (
                        <div className={styles.listContainer}>
                            {recentChapters.map(ch => (
                                <div key={ch.id} className={styles.listItem} onClick={() => setActivePhase('4')}>
                                    <BookOpen size={16} className={styles.listIcon} />
                                    <div className={styles.listContent}>
                                        <h4>{ch.title}</h4>
                                        <span>Click to open in Phase 4 - Drafting Workspace</span>
                                    </div>
                                    <div className={styles.listAction}>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.muted}>You have not added any chapters yet. Open Phase 4 to start drafting.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
// Add ArrowRight since I used it but forgot to import, I will fix import.
