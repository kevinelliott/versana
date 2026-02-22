'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, MessageSquareHeart } from 'lucide-react';
import { usePhase } from '@/context/PhaseContext';
import styles from './PhaseAssistantOrb.module.css';

const PHASE_TIPS: Record<string, string> = {
    '1': "Welcome to Ideation! Try using the What-If Engine to push your premise into darker or more unexpected territory.",
    '2': "You're Outlining. Drag cards around the Save the Cat beat board. Try mapping character alliances in the Relationship Web.",
    '3': "Research Phase. When you find a good article via the World-Wide Web search, hit 'Save to Lore Bible' to persist it to your Context Matrix.",
    '4': "You're Drafting! Highlight any text to bring up the Editorial Co-pilot for rewrites, or open the Draft & Preview pane to review AI generated scenes.",
    '5': "Deep Edits. Run a full manuscript scan to detect plot holes, character inconsistencies, and pacing issues before moving to Layout.",
    '6': "Formatting Phase. Adjust your trim size and fonts, and generate AI chapter ornamentation before exporting your ePub.",
    '7': "Cover Design. Versana will read your manuscript to generate an optimal Nano Banana Pro image prompt!",
    '8': "Publishing Prep. Let's extract your BISAC codes and generate your Amazon Blurb based on your final story.",
};

export default function PhaseAssistantOrb() {
    const { activePhase } = usePhase();
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [currentTip, setCurrentTip] = useState(PHASE_TIPS['1']);

    // When the phase changes, update the tip, show unread badge, and optionally auto-open or pulse.
    useEffect(() => {
        if (PHASE_TIPS[activePhase]) {
            setCurrentTip(PHASE_TIPS[activePhase]);
            setHasUnread(true);
            setIsOpen(true); // Auto pop-up when entering a new phase to guide the user!

            // Auto-hide after 10 seconds if they don't interact
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [activePhase]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (hasUnread) setHasUnread(false);
    };

    return (
        <div className={styles.orbContainer}>
            {isOpen && (
                <div className={styles.chatBubble}>
                    <div className={styles.bubbleHeader}>
                        <div className={styles.bubbleTitle}>
                            <Sparkles size={14} /> AI Phase Guide
                        </div>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                            <X size={14} />
                        </button>
                    </div>
                    <p className={styles.bubbleText}>{currentTip}</p>
                </div>
            )}

            <button
                className={`${styles.orbButton} ${hasUnread && !isOpen ? styles.pulse : ''}`}
                onClick={handleToggle}
                title="Phase Assistant"
            >
                <MessageSquareHeart size={24} />
                {hasUnread && !isOpen && (
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-primary)'
                    }} />
                )}
            </button>
        </div>
    );
}
