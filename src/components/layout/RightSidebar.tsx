'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Send } from 'lucide-react';
import styles from './RightSidebar.module.css';

const CONTEXT_ITEMS = [
    { id: '1', label: 'Protagonist Profile', active: true, type: 'character' },
    { id: '2', label: 'Magic System Rules', active: false, type: 'lore' },
    { id: '3', label: '18th Century London', active: true, type: 'place' },
    { id: '4', label: 'Secondary Plotline', active: false, type: 'plot' },
];

export default function RightSidebar() {
    const [toggles, setToggles] = useState(CONTEXT_ITEMS);

    const handleToggle = (id: string) => {
        setToggles(toggles.map(t => t.id === id ? { ...t, active: !t.active } : t));
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.contextMatrix}>
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <Sparkles size={16} className={styles.headerIcon} />
                        Context Matrix
                    </div>
                    <span className={styles.badge}>{toggles.filter(t => t.active).length} Active</span>
                </div>

                <div className={styles.toggleList}>
                    {toggles.map(item => (
                        <div
                            key={item.id}
                            className={`${styles.toggleItem} ${item.active ? styles.active : ''}`}
                            onClick={() => handleToggle(item.id)}
                        >
                            <div className={styles.toggleLabel}>
                                <span className={`${styles.dot} ${styles[item.type]}`} />
                                {item.label}
                            </div>
                            {item.active ? (
                                <ToggleRight size={18} className={styles.activeIcon} />
                            ) : (
                                <ToggleLeft size={18} className={styles.inactiveIcon} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.aiCopilot}>
                <div className={styles.chatHeader}>
                    AI Co-Pilot
                </div>
                <div className={styles.chatArea}>
                    <div className={styles.aiMessage}>
                        Hello! I noticed you are writing Chapter 4. I currently have the Protagonist Profile and London setting in my active memory context. How can I help?
                    </div>
                </div>
                <div className={styles.chatInputContainer}>
                    <input
                        type="text"
                        placeholder="Ask about your lore..."
                        className={styles.chatInput}
                    />
                    <button className={styles.sendButton}>
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
