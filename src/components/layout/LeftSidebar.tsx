'use client';

import React from 'react';
import {
    Lightbulb, Shield, Map, Type,
    LayoutTemplate, Image as ImageIcon,
    Rocket, LibraryBig
} from 'lucide-react';
import styles from './LeftSidebar.module.css';
import { usePhase } from '@/context/PhaseContext';

const PHASES = [
    { id: '1', icon: Lightbulb, label: 'Concept & Ideation' },
    { id: '2', icon: Shield, label: 'Planning & Outlining' },
    { id: '3', icon: Map, label: 'Research Assistant' },
    { id: '4', icon: Type, label: 'Drafting & Writing' },
    { id: '5', icon: LayoutTemplate, label: 'Layout & Formatting' },
    { id: '6', icon: ImageIcon, label: 'Cover Design' },
    { id: '7', icon: Rocket, label: 'Publishing Prep' },
];

export default function LeftSidebar() {
    const { activePhase, setActivePhase } = usePhase();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>Guided Workflow</div>
                <nav className={styles.nav}>
                    {PHASES.map((phase) => (
                        <button
                            key={phase.id}
                            onClick={() => setActivePhase(phase.id)}
                            className={`${styles.navItem} ${activePhase === phase.id ? styles.active : ''}`}
                        >
                            <phase.icon size={16} className={styles.navIcon} />
                            <span>Phase {phase.id}: {phase.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
                <div className={styles.sectionHeader}>World Building</div>
                <nav className={styles.nav}>
                    <button className={styles.navItem}>
                        <LibraryBig size={16} className={styles.navIcon} />
                        <span>Lore Bible</span>
                    </button>
                </nav>
            </div>
        </aside>
    );
}
