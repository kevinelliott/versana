'use client';

import React, { useEffect, useState } from 'react';
import { Target, Clock, BookOpen, PenTool, Hash, MapPin, User, Bookmark, ArrowRight, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import styles from './HomeDashboard.module.css';
import WritingActivityChart, { DailyLog } from './WritingActivityChart';

export default function HomeDashboard() {
    const { activeWorkspace, activeBook, books, chapters, wordCount } = useWorkspace();
    const { setActivePhase } = usePhase();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (!activeBook) return;
        const fetchLogs = async () => {
            setIsLoadingLogs(true);
            try {
                const res = await fetch(`/api/analytics/${activeBook.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingLogs(false);
            }
        };
        fetchLogs();
    }, [activeBook]);

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
    const targetDate = activeBook?.target_date ? new Date(activeBook.target_date) : null;
    
    // Calculate Burn Down Logic
    let daysRemaining = 0;
    let requiredDailyWords = 0;
    let isBehind = false;
    
    if (targetDate) {
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const wordsLeft = Math.max(0, target - wordCount);
        requiredDailyWords = daysRemaining > 0 ? Math.ceil(wordsLeft / daysRemaining) : wordsLeft;
        
        // Let's assume a healthy writing pace is 1000 words a day. If required > 1000, they are falling behind
        isBehind = requiredDailyWords > 1500;
    }

    const recentChapters = [...chapters].reverse().slice(0, 3);

    const getHeatLevel = (words: number) => {
        if (words === 0) return 0;
        if (words < 500) return 1;
        if (words < 1200) return 2;
        if (words < 2500) return 3;
        return 4;
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1>Welcome back to {activeWorkspace.name}</h1>
                <p className={styles.subtitle}>Here is a 10,000-foot view of your universe's progress.</p>
            </header>

            <div className={styles.grid}>
                {/* Burn-Down & Gamification Panel */}
                <div className={`${styles.card} ${styles.wideCard}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                    <div className={styles.burnDownContainer}>
                        <div className={styles.cardHeader} style={{ marginBottom: '1rem' }}>
                            <h3><Target size={18} /> Project Velocity</h3>
                        </div>
                        
                        <div className={styles.burnDownStats}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className={styles.statLabel}>Total Words</span>
                                <span className={styles.statValue}>{wordCount.toLocaleString()} / {target.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                                <span className={styles.statLabel}>Completion</span>
                                <span className={styles.statValue} style={{ color: progress >= 100 ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>

                        <div className={styles.burnDownTrack}>
                            <div className={styles.burnDownFill} style={{ width: `${progress}%`, background: progress >= 100 ? 'var(--accent-green)' : '' }} />
                            {/* Marker to show where they "Should" be today based on start date vs end date could go here */}
                        </div>

                        {targetDate ? (
                            <div className={styles.targetDateDisplay} style={{ borderColor: isBehind ? 'var(--accent-terracotta)' : 'var(--accent-green)' }}>
                                <Calendar size={16} color={isBehind ? 'var(--accent-terracotta)' : 'var(--accent-green)'} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{daysRemaining} Days Remaining</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Target: {targetDate.toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isBehind ? 'var(--accent-terracotta)' : 'var(--text-primary)' }}>
                                        {requiredDailyWords.toLocaleString()} w/day
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Required Pace</div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.targetDateDisplay}>
                                <Calendar size={16} color="var(--text-secondary)" />
                                <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Set a Target Date in the top right Goal Tracker to unlock burn-down pacing metrics.
                                </div>
                            </div>
                        )}
                        
                        {/* Heatmap preview */}
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Zap size={14} color="var(--accent-orange)" /> 30-Day Activity Streak
                            </div>
                            <div className={styles.heatmapContainer}>
                                {logs.length > 0 ? (
                                    logs.slice(-28).map((log, i) => (
                                        <div 
                                            key={i} 
                                            className={styles.heatmapBlock} 
                                            data-level={getHeatLevel(log.daily_words_written)}
                                            title={`${log.daily_words_written} words on ${new Date(log.log_date).toLocaleDateString()}`}
                                        />
                                    ))
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Writing logs will appear here.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px' }}>
                        <div className={styles.cardHeader} style={{ marginBottom: '1rem' }}>
                            <h3><TrendingUp size={18} /> Last 14 Days Output</h3>
                        </div>
                        {isLoadingLogs ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="spinner" style={{ animation: 'spin 1s linear infinite' }}><Target size={24} color="var(--border-color)" /></span>
                            </div>
                        ) : (
                            <WritingActivityChart logs={logs} targetDailyWordCount={requiredDailyWords || 1000} />
                        )}
                    </div>
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
                        <span className={styles.badge}>{chapters.length} total</span>
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
            <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </div>
    );
}
