import React from 'react';
import { BookOpen, Search, Bell } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
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
    const { activeWorkspace, activeBook, chapters, currentChapterId, wordCount, readabilityScore } = useWorkspace();
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
                    <span>{wordCount.toLocaleString()} words</span>
                    <span className={styles.divider}>•</span>
                    <span>Readability: {readabilityScore}</span>
                </div>
                <ThemeToggle />
                <button className={styles.iconButton}>
                    <Search size={18} />
                </button>
                <button className={styles.iconButton}>
                    <Bell size={18} />
                </button>
                <UserDropdown />
                <button className={styles.exportButton}>
                    Export
                </button>
            </div>
        </header>
    );
}
