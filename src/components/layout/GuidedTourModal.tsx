'use client';

import React from 'react';
import { Lightbulb, Shield, Map, Type, LayoutTemplate, Image as ImageIcon, Rocket, CheckSquare, X } from 'lucide-react';
import styles from './GuidedTourModal.module.css';

interface GuidedTourModalProps {
    isOpen: boolean;
    onClose: () => void;
    isNonFic: boolean;
}

export default function GuidedTourModal({ isOpen, onClose, isNonFic }: GuidedTourModalProps) {
    if (!isOpen) return null;

    const phases = [
        { 
            icon: Lightbulb, 
            label: isNonFic ? '1. Topic & Thesis' : '1. Concept & Ideation', 
            desc: isNonFic 
                ? 'Brainstorm core angles and use the Socratic Engine to pressure-test your arguments.' 
                : 'Brainstorm core hooks and use the What-If Engine to pressure-test your premise.' 
        },
        { 
            icon: Shield, 
            label: isNonFic ? '2. Outline & Structure' : '2. Planning & Outlining', 
            desc: 'Flesh out a structured Beat Board or Chapter Outline to guide your writing pace.' 
        },
        { 
            icon: Map, 
            label: isNonFic ? '3. Research & Sourcing' : '3. Research Assistant', 
            desc: isNonFic 
                ? 'Build your Knowledge Base by saving citations, figures, and reference facts.' 
                : 'Build your Lore Bible by documenting characters, settings, and rules to fuel the AI.' 
        },
        { 
            icon: Type, 
            label: isNonFic ? '4. Drafting & Content' : '4. Drafting & Writing', 
            desc: 'Write manually or use the AI to Auto-Draft complete chapters based on your Outline and Lore.' 
        },
        { 
            icon: CheckSquare, 
            label: isNonFic ? '5. Review & Fact-Checking' : '5. Revisions & Deep Edits', 
            desc: 'Highlight text and use the Editorial Co-Pilot to refine prose, expand scenes, or rewrite.' 
        },
        { 
            icon: LayoutTemplate, 
            label: '6. Layout & Formatting', 
            desc: 'Preview your compiled manuscript and adjust typesetting, margins, and chapters.' 
        },
        { 
            icon: ImageIcon, 
            label: '7. Cover Design', 
            desc: 'Generate or upload front-cover artwork specifically tailored to your genre.' 
        },
        { 
            icon: Rocket, 
            label: '8. Publishing Prep', 
            desc: 'Export your final masterpiece to EPUB or PDF formats, ready for worldwide distribution.' 
        },
    ];

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div>
                        <h2 className={styles.modalTitle}>The Versana Method</h2>
                        <p className={styles.modalDesc}>
                            Follow these 8 iterative phases to build out an incredible {isNonFic ? 'book' : 'universe'}.
                        </p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.phasesGrid}>
                    {phases.map((phase, i) => (
                        <div key={i} className={styles.phaseCard}>
                            <div className={styles.iconBox}>
                                <phase.icon size={20} />
                            </div>
                            <div className={styles.phaseText}>
                                <h3>{phase.label}</h3>
                                <p>{phase.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.modalActions}>
                    <button className={styles.actionBtn} onClick={onClose}>
                        Got it, let's go!
                    </button>
                </div>
            </div>
        </div>
    );
}
