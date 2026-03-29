'use client';

import React from 'react';
import { LineChart, GitMerge, ScrollText, Image as ImageIcon, Share2, Sparkles, ArrowRight, Type } from 'lucide-react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './ToolsDashboard.module.css';

const TOOLS = [
    {
        id: 'market-analyzer',
        title: 'Market Trend & Trope Analyzer',
        description: 'Evaluate your premise against current Amazon/KDP market trends. Discover which tropes to subvert and which to lean into.',
        icon: <LineChart size={24} color="var(--tag-blue-text)" />,
        tag: 'Research',
        tagClass: styles.tagResearch
    },
    {
        id: 'premise-collider',
        title: 'Premise Collider',
        description: 'Merge two seemingly unrelated concepts (e.g. "Necromancy" + "Corporate Espionage") into a cohesive, unique hook.',
        icon: <GitMerge size={24} color="var(--tag-purple-text)" />,
        tag: 'Ideation',
        tagClass: styles.tagIdeation
    },
    {
        id: 'mythos-creator',
        title: 'Mythology & Linguistics Creator',
        description: 'An isolated sandbox to generate coherent fictional religions, mythos, or naming conventions without committing them to a Lore Bible.',
        icon: <ScrollText size={24} color="var(--tag-gold-text)" />,
        tag: 'World Building',
        tagClass: styles.tagArt
    },
    {
        id: 'asset-generator',
        title: 'Standalone Asset Generator',
        description: 'Generate character portraits, mood boards, or architecture reference concepts using Versana AI.',
        icon: <ImageIcon size={24} color="var(--accent-blue)" />,
        tag: 'Visuals',
        tagClass: styles.tagResearch
    },
    {
        id: 'viral-creator',
        title: 'Viral Asset Creator',
        description: 'AI scripts for TikTok/Reel videos, Instagram carousel quotes, and author newsletter drafts optimized for engagement.',
        icon: <Share2 size={24} color="var(--tag-green-text)" />,
        tag: 'Marketing',
        tagClass: styles.tagMarketing
    },
    {
        id: 'typography-generator',
        title: 'Nano Banana Typography',
        description: 'Generate beautiful drop caps, scene break flourishes, and title typography assets directly from text prompts.',
        icon: <Type size={24} color="var(--accent-terracotta)" />,
        tag: 'Visuals',
        tagClass: styles.tagResearch
    }
];

export default function ToolsDashboard() {
    const { activeWorkspace } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <Sparkles size={28} style={{ display: 'inline', marginRight: '0.5rem', position: 'relative', top: '4px' }} color="var(--accent-blue)" />
                    Standalone Tools
                </h1>
                <p className={styles.subtitle}>
                    Isolated sandboxes for market research, ideation, and asset generation. These tools do not alter your active project&apos;s {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}.
                </p>
            </div>

            <div className={styles.grid}>
                {TOOLS.map(tool => (
                    <div className={styles.toolCard} key={tool.id}>
                        <div className={styles.iconWrapper}>
                            {tool.icon}
                        </div>
                        <div>
                            <h3 className={styles.toolTitle}>{tool.title}</h3>
                            <p className={styles.toolDesc}>{tool.description}</p>
                        </div>
                        <div className={styles.cardFooter}>
                            <span className={`${styles.tag} ${tool.tagClass}`}>{tool.tag}</span>
                            <Link href={`/tools/${tool.id}`} className={styles.enterBtn} style={{ textDecoration: 'none' }}>
                                Launch <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
