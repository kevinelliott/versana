'use client';

import React, { useState, useEffect } from 'react';
import { Database, Brain, Zap, AlertTriangle, CheckCircle, Search } from 'lucide-react';
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
            {/* Standard AI Side */}
            <div className={styles.column}>
                <div className={styles.colHeader}>
                    <Brain size={24} className={styles.iconStandard} />
                    <h3>Standard Auto-Regressive LLM</h3>
                </div>
                <div className={styles.visualCard}>
                    <div className={styles.pipelineHeader}>Context Window (100k Limit)</div>

                    <div className={styles.memoryStack}>
                        <div className={`${styles.memoryBlock} ${styles.dimBox} ${step > 0 ? styles.dropped : ''}`}>
                            {step > 0 ? <del>Chapter 1: Aris has blue eyes</del> : "Chapter 1: Aris has blue eyes"}
                            {step > 0 && <span className={styles.evictedLabel}>Evicted (Token Overflow)</span>}
                        </div>
                        <div className={`${styles.memoryBlock} ${styles.dimBox}`}>
                            Chapters 2 - 19 text block
                        </div>
                        <div className={`${styles.memoryBlock} ${styles.activeBox} ${step > 0 ? styles.visibleOpacity : ''}`}>
                            Chapter 20: Write the climax
                        </div>
                    </div>

                    <div className={styles.meterContainer}>
                        <div className={styles.meterBar}>
                            <div className={`${styles.meterFill} ${step > 0 ? styles.meterFull : ''}`} style={{ width: step > 0 ? '100%' : '90%' }}></div>
                        </div>
                        <div className={styles.meterLabel}>
                            {step > 0 ? <span style={{ color: '#c92a2a', fontWeight: 'bold' }}>100,500 / 100,000 Tokens (Overflow)</span> : <span>95,000 / 100,000 Tokens</span>}
                        </div>
                    </div>

                    <div className={`${styles.outputBox} ${step > 1 ? styles.visibleOpacity : ''}`}>
                        <p><strong>AI:</strong> Aris ignited his laser-sword, narrowing his <span className={styles.errorHighlight}>brown</span> eyes...</p>
                        <div className={styles.tagError}><AlertTriangle size={14} /> Hallucination</div>
                    </div>
                </div>
            </div>

            <div className={styles.connector}>
                <div className={styles.vsBadge}>VS</div>
            </div>

            {/* Versana Side */}
            <div className={styles.column}>
                <div className={styles.colHeader}>
                    <Database size={24} className={styles.iconVersana} />
                    <h3 className={styles.titleVersana}>Versana Context Matrix</h3>
                </div>
                <div className={styles.visualCard}>

                    <div className={styles.dbContainer}>
                        <div className={styles.dbHeader}><Database size={14} /> Infinite Master Database</div>
                        <div className={styles.dbCards}>
                            <div className={`${styles.dbCard} ${step > 1 ? styles.activeDbCard : ''}`}>💎 [Aris] Eyes: Sapphire-blue</div>
                            <div className={styles.dbCard}>🔫 [Aris] Weapon: Plasma Rifle</div>
                        </div>
                    </div>

                    <div className={styles.arrowContainer}>
                        <div className={`${styles.searchBeam} ${step > 1 ? styles.visibleOpacity : ''}`}>
                            <Search size={14} /> Semantic Vector Matching
                        </div>
                    </div>

                    <div className={styles.pipelineHeader} style={{ color: 'inherit' }}>Dynamic Context Window</div>

                    <div className={styles.memoryStack}>
                        {step > 1 && (
                            <div className={`${styles.memoryBlock} ${styles.injectedBox} ${styles.fadeIn}`}>
                                <Zap size={14} style={{ display: 'inline', marginBottom: '-2px' }} /> Auto-Injected Fact: Eyes = Sapphire-blue
                            </div>
                        )}
                        <div className={`${styles.memoryBlock} ${styles.activeBox} ${step > 0 ? styles.visibleOpacity : ''}`}>
                            Chapter 20: Write the climax
                        </div>
                    </div>

                    <div className={styles.meterContainer}>
                        <div className={styles.meterBar}>
                            <div className={`${styles.meterFill} ${styles.meterLow}`} style={{ width: step > 1 ? '5%' : '2%' }}></div>
                        </div>
                        <div className={styles.meterLabel}>
                            {step > 1 ? <span>1,200 / 100,000 Tokens (1.2% Cap)</span> : <span>200 / 100,000 Tokens</span>}
                        </div>
                    </div>

                    <div className={`${styles.outputBox} ${styles.outputSuccess} ${step > 2 ? styles.visibleOpacity : ''}`}>
                        <p><strong>Versana:</strong> Aris raised his plasma rifle, his <span className={styles.successHighlight}>sapphire-blue</span> eyes narrowing...</p>
                        <div className={styles.tagSuccess}><CheckCircle size={14} /> Perfect Recall</div>
                    </div>

                </div>
            </div>
        </div>
    );
}
