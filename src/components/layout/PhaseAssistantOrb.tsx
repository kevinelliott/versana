'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, MessageSquareHeart } from 'lucide-react';
import { usePhase } from '@/context/PhaseContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './PhaseAssistantOrb.module.css';

const FIC_TIPS: Record<string, string> = {
    '1': "Welcome to Ideation! Try using the What-If Engine to push your premise into darker or more unexpected territory.",
    '2': "Outlining. Pro-Tip: Drag Beats directly onto your Chapters. In Phase 4, the Draft Generation AI will strictly read those Beats to write the scene!",
    '3': "Research. Everything saved to your Lore Bible here becomes the absolute ground-truth for your Fact-Checker later in Phase 5.",
    '4': "Drafting! The AI reads the Beats you assigned in Phase 2 to write the scene. Highlight any text to bring up the Editorial Co-pilot for targeted rewrites.",
    '5': "Deep Edits. The Logic Fact-Checker strictly cross-references your drafted text against the Character and World lore you built in Phase 3.",
    '6': "Formatting Phase. Adjust your trim size and fonts, and generate AI chapter ornamentation before exporting your ePub or PDF.",
    '7': "Cover Design. Versana reads your Phase 3 Lore Bible to generate an optimal Midjourney prompt for your cover art.",
    '8': "Publishing Prep. Versana synthesizes your entire Context Matrix to write a compelling Amazon Blurb and extract BISAC metadata!",
};

const NON_FIC_TIPS: Record<string, string> = {
    '1': "Welcome to Ideation! Try using the Socratic Engine to stress-test your core thesis.",
    '2': "Outlining. Pro-Tip: Drag Sections directly onto your Chapters. In Phase 4, the AI will build its arguments based entirely on these mapped sections.",
    '3': "Research. Data and case studies saved to your Knowledge Base here become the absolute ground-truth for your Fact-Checker in Phase 5.",
    '4': "Drafting! The AI builds arguments strictly based on the Sections you assigned in Phase 2. Highlight text to use the Editorial Co-pilot.",
    '5': "Deep Edits. The Audit tool strictly cross-references your drafted arguments against the facts and data you saved in Phase 3.",
    '6': "Formatting Phase. Adjust your typographic settings and layout before exporting your PDF or Word document.",
    '7': "Cover Design. Versana translates your core thesis into a striking professional book cover prompt.",
    '8': "Publishing Prep. Extract SEO keywords and let AI write a compelling back-cover synopsis based on your manuscript data.",
};

export default function PhaseAssistantOrb() {
    const { activePhase } = usePhase();
    const { activeWorkspace, isRightSidebarOpen } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;
    const tips = isNonFicProject ? NON_FIC_TIPS : FIC_TIPS;

    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [currentTip, setCurrentTip] = useState(tips['1']);

    // When the phase changes, update the tip, show unread badge, and optionally auto-open or pulse.
    useEffect(() => {
        if (tips[activePhase]) {
             
            setCurrentTip(tips[activePhase]);
            setHasUnread(true);
            setIsOpen(true); // Auto pop-up when entering a new phase to guide the user!

            // Auto-hide after 10 seconds if they don't interact
            const timer = setTimeout(() => {
                setIsOpen(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePhase]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (hasUnread) setHasUnread(false);
    };

    return (
        <div 
            className={styles.orbContainer}
            style={{ 
                right: isRightSidebarOpen ? 'calc(350px + 2rem)' : '2rem', 
                transition: 'right 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
            }}
        >
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
