import React from 'react';
import { BookOpen, Search, Bell, Settings } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar() {
    return (
        <header className={styles.topbar}>
            <div className={styles.leftSection}>
                <div className={styles.logo}>
                    <BookOpen size={20} className={styles.logoIcon} />
                    <span className={styles.logoText}>MythosOS</span>
                </div>
            </div>

            <div className={styles.centerSection}>
                {/* Project Name or Title could go here */}
                <span className={styles.projectName}>The Obsidian Crown - Chapter 4</span>
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
                <button className={styles.exportButton}>
                    Export
                </button>
            </div>
        </header>
    );
}
