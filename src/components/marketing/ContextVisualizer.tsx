'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileText, Zap } from 'lucide-react';
import styles from './ContextVisualizer.module.css';

export default function ContextVisualizer() {
    const [step, setStep] = useState(0);

    // Auto-play the visualization sequence
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 4);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.visualizerContainer}>
            <div className={styles.column}>
                <div className={styles.colHeader}>
                    <FileText size={20} />
                    <h3>Standard AI</h3>
                </div>
                <div className={styles.visualCard}>
                    <div className={styles.chatBubble}>
                        <strong>Author:</strong> What color are Aris's eyes?
                    </div>
                    <div className={`${styles.chatBubble} ${styles.aiBubble} ${step > 0 ? styles.visible : ''}`}>
                        <strong>AI:</strong> Captain Aris has striking blue eyes that gleam in the starlight.
                    </div>

                    <div className={`${styles.chatBubble} ${step > 1 ? styles.visible : ''}`}>
                        <strong>Author:</strong> Write the next scene.
                    </div>
                    <div className={`${styles.chatBubble} ${styles.aiBubble} ${styles.errorBubble} ${step > 2 ? styles.visible : ''}`}>
                        <strong>AI:</strong> Aris narrowed his <em>brown</em> eyes and glared at Mira...
                    </div>
                    <div className={`${styles.annotation} ${step > 2 ? styles.visible : ''}`}>
                        💥 Context Window Exceeded
                    </div>
                </div>
            </div>

            <div className={styles.connector}>
                <div className={styles.vsBadge}>VS</div>
            </div>

            <div className={styles.column}>
                <div className={styles.colHeader}>
                    <Database size={20} className={styles.accentIcon} />
                    <h3 className={styles.accentText}>Versana Context Matrix</h3>
                </div>
                <div className={styles.visualCard}>
                    <div className={`${styles.databaseLayer} ${step > 0 ? styles.visible : ''}`}>
                        <div className={styles.dbRow}>
                            <span className={styles.tagBlue}>[Character] Aris</span>
                            <span className={styles.dbFact}>Eyes: Blue (Set in Chap 1)</span>
                        </div>
                    </div>

                    <div className={`${styles.chatBubble} ${step > 1 ? styles.visible : ''}`}>
                        <strong>Author:</strong> Write the next scene.
                    </div>

                    <div className={`${styles.actionLayer} ${step > 1 ? styles.visible : ''}`}>
                        <Zap size={14} className={styles.zapIcon} /> Vector Search injected 48 tokens of context.
                    </div>

                    <div className={`${styles.chatBubble} ${styles.aiBubble} ${styles.successBubble} ${step > 2 ? styles.visible : ''}`}>
                        <strong>Versana:</strong> Aris narrowed his <em>sapphire-blue</em> eyes, the cybernetic scar along his cheek twitching as he glared at Mira...
                    </div>
                    <div className={`${styles.annotationSuccess} ${step > 2 ? styles.visible : ''}`}>
                        ✨ Perfect Continuity
                    </div>
                </div>
            </div>
        </div>
    );
}
