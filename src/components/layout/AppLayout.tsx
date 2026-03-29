import React from 'react';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import PhaseAssistantOrb from './PhaseAssistantOrb';
import OnboardingModal from './OnboardingModal';
import CommandPalette from '../workspace/CommandPalette';
import FloatingContext from '../workspace/FloatingContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isFocusMode } = useWorkspace();

    return (
        <div className={`${styles.appContainer} ${isFocusMode ? styles.focusMode : ''}`}>
            <div className={styles.topBarWrapper}>
                <TopBar />
            </div>
            <div className={styles.mainLayout}>
                <div className={styles.leftSidebarWrapper}>
                    <LeftSidebar />
                </div>
                <main className={styles.workspaceArea}>
                    {children}
                </main>
                <div className={styles.rightSidebarWrapper}>
                    <RightSidebar />
                </div>
                {!isFocusMode && <PhaseAssistantOrb />}
                <OnboardingModal />
                <CommandPalette />
                <FloatingContext />
            </div>
        </div>
    );
}
