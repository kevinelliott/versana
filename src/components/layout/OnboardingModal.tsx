'use client';

import React, { useState, useEffect } from 'react';
import { Brain, X, CheckCircle, DatabaseZap } from 'lucide-react';
import styles from './OnboardingModal.module.css';

export default function OnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show modal on first visit (for demo purposes we just show it if not explicitly dismissed)
        const hasSeen = localStorage.getItem('versana_onboarding_seen');
        if (!hasSeen) {
            setIsOpen(true);
        }
    }, []);

    const dismissModal = () => {
        localStorage.setItem('versana_onboarding_seen', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={dismissModal}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <DatabaseZap size={32} color="var(--accent-blue)" />
                    </div>
                    <h2>Welcome to the Context Matrix</h2>
                </div>

                <div className={styles.body}>
                    <p className={styles.intro}>
                        Versana isn't just a text editor—it's an intelligent exoskeleton for your story. You might be wondering: <i>How is this better than pasting my chapters into ChatGPT?</i>
                    </p>

                    <ul className={styles.featureList}>
                        <li>
                            <CheckCircle size={18} color="var(--tag-green-text)" />
                            <span><strong>Zero Amnesia:</strong> When you write Chapter 20, Versana perfectly remembers what happened in Chapter 1, automatically injecting relevant Lore via pgvector embeddings.</span>
                        </li>
                        <li>
                            <CheckCircle size={18} color="var(--tag-green-text)" />
                            <span><strong>Phase Continuity:</strong> Build a character in Phase 1, outline their arc in Phase 2, and the Editor (Phase 4) proactively suggests actions based on that exact pacing plan.</span>
                        </li>
                        <li>
                            <CheckCircle size={18} color="var(--tag-green-text)" />
                            <span><strong>Privacy First:</strong> Your manuscript never trains external AI models. Your <i>Context Matrix</i> is isolated to your isolated Supabase cluster.</span>
                        </li>
                    </ul>
                </div>

                <div className={styles.footer}>
                    <button className={styles.primaryBtn} onClick={dismissModal}>
                        Start Writing
                    </button>
                </div>
            </div>
        </div>
    );
}
