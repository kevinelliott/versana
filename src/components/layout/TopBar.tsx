import React from 'react';
import { BookOpen, Search } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import GoalTracker from '../workspace/GoalTracker';
import NotificationBell from './NotificationBell';
import ExportDropdown from './ExportDropdown';
import { getGradientForString, getInitials } from '@/lib/colorUtils';
import styles from './TopBar.module.css';


export default function TopBar() {
    const { activeWorkspace, activeBook, chapters, currentChapterId, wordCount, readabilityScore } = useWorkspace();
    const { activePhase } = usePhase();

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;
    
    // Compute dynamic phase labels
    const PHASES = [
        { id: '1', label: isNonFicProject ? 'Topic & Thesis' : 'Concept & Ideation' },
        { id: '2', label: isNonFicProject ? 'Outline & Structure' : 'Planning & Outlining' },
        { id: '3', label: isNonFicProject ? 'Research & Sourcing' : 'Research Assistant' },
        { id: '4', label: isNonFicProject ? 'Drafting & Content' : 'Drafting & Writing' },
        { id: '5', label: isNonFicProject ? 'Review & Fact-Checking' : 'Revisions & Deep Edits' },
        { id: '6', label: 'Layout & Formatting' },
        { id: '7', label: 'Cover Design' },
        { id: '8', label: 'Publishing Prep' },
    ];

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
                {activeWorkspace && (
                    <div style={{ marginRight: '12px', width: '24px', height: '24px', borderRadius: '6px', background: getGradientForString(activeWorkspace.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '0.65rem' }}>
                        {getInitials(activeWorkspace.name)}
                    </div>
                )}
                <span className={styles.projectName}>{displayTitle}</span>
            </div>

            <div className={styles.rightSection}>
                <div className={styles.stats}>
                    <GoalTracker />
                    <span>Readability: {readabilityScore}</span>
                </div>
                <ThemeToggle />
                <button className={styles.iconButton}>
                    <Search size={18} />
                </button>
                <NotificationBell />
                <UserDropdown />
                <ExportDropdown />
            </div>
        </header>
    );
}
