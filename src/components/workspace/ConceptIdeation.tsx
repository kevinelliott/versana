'use client';

import React from 'react';
import styles from './ConceptIdeation.module.css';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ConceptIdeation() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 1: Concept & Ideation</h1>
                <p className={styles.subtitle}>Enter a seed prompt, or let the What-If Engine push boundaries.</p>
            </div>

            <div className={styles.inputSection}>
                <div className={styles.promptBox}>
                    <input
                        type="text"
                        placeholder="e.g. A sci-fi retelling of the Count of Monte Cristo..."
                        className={styles.input}
                    />
                    <button className={styles.generateBtn}>
                        <Sparkles size={16} /> Generate Core Concepts
                    </button>
                </div>
            </div>

            <div className={styles.suggestionsGrid}>
                <div className={styles.card}>
                    <div className={styles.cardTag}>Concept A</div>
                    <h3>The Asteroid Prison</h3>
                    <p>Falsely accused of treason, a young ensign escapes an inescapable asteroid mining colony and uses an alien artifact to slowly destroy the lives of those who betrayed him.</p>
                    <button className={styles.selectBtn}>Select <ArrowRight size={14} /></button>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardTag}>Concept B</div>
                    <h3>Quantum Revenge</h3>
                    <p>An exiled scientist learns to shift through parallel dimensions. By systematically pruning alternate realities, they isolate their enemies into a universe destined for collapse.</p>
                    <button className={styles.selectBtn}>Select <ArrowRight size={14} /></button>
                </div>
            </div>
        </div>
    );
}
