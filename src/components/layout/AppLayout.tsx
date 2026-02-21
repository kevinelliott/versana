import React from 'react';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.appContainer}>
            <TopBar />
            <div className={styles.mainLayout}>
                <LeftSidebar />
                <main className={styles.workspaceArea}>
                    {children}
                </main>
                <RightSidebar />
            </div>
        </div>
    );
}
