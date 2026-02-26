import React from 'react';
import { BookOpen, Search, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import styles from './TopBar.module.css';

const PHASES = [
    { id: '1', label: 'Concept & Ideation' },
    { id: '2', label: 'Planning & Outlining' },
    { id: '3', label: 'Research Assistant' },
    { id: '4', label: 'Drafting & Writing' },
    { id: '5', label: 'Revisions & Deep Edits' },
    { id: '6', label: 'Layout & Formatting' },
    { id: '7', label: 'Cover Design' },
    { id: '8', label: 'Publishing Prep' },
];

export default function TopBar() {
    const { activeWorkspace, activeBook, chapters, currentChapterId } = useWorkspace();
    const { activePhase } = usePhase();

    const currentChapter = chapters.find(c => c.id === currentChapterId);
    const phaseInfo = PHASES.find(p => p.id === activePhase);

    let displayTitle = 'Versana Workspace';
    if (activeWorkspace) {
        const titleBase = activeBook ? `${activeWorkspace.name} / ${activeBook.title}` : activeWorkspace.name;
        if (activePhase === '4' && currentChapter) {
            displayTitle = `${titleBase} - ${currentChapter.title}`;
        } else if (phaseInfo) {
            displayTitle = `${titleBase} - ${phaseInfo.label}`;
        } else {
            displayTitle = titleBase;
        }
    }

    return (
        <header className={styles.topbar}>
            <div className={styles.leftSection}>
                <div className={styles.logo}>
                    <BookOpen size={20} className={styles.logoIcon} />
                    <span className={styles.logoText}>Versana</span>
                </div>
            </div>

            <div className={styles.centerSection}>
                <span className={styles.projectName}>{displayTitle}</span>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.stats}>
                    <span>1,204 words</span>
                    <span className={styles.divider}>•</span>
                    <span>Readability: A</span>
                </div>
                <button className={styles.iconButton}>
                    <Search size={18} />
                </button>
                <button className={styles.iconButton}>
                    <Bell size={18} />
                </button>
                <Link href="/profile" className={styles.iconButton} title="User Profile">
                    <User size={18} />
                </Link>
                <button className={styles.exportButton}>
                    Export
                </button>
            </div>
        </header>
    );
}
