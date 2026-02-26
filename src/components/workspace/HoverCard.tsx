import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Edit2, MessageSquare } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import styles from './HoverCard.module.css';

export interface EntityData {
    id: string;
    name: string;
    type: 'character' | 'place' | 'lore' | 'plot' | 'rule' | string;
    synopsis: string;
    firstAppearance?: string;
    mentions?: number;
    status?: string;
    associated?: string[];
    aliases?: string[];
}

interface HoverCardProps {
    entity: EntityData;
    x: number;
    y: number;
    onClose: () => void;
    onMouseEnter?: () => void;
    visible: boolean;
    onQuickEdit: () => void;
    onAskAI: () => void;
}

export default function HoverCard({ entity, x, y, visible, onClose, onMouseEnter, onQuickEdit, onAskAI }: HoverCardProps) {
    const [isRendered, setIsRendered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const { activeWorkspace, setSelectedLoreId, setIsLeftSidebarOpen } = useWorkspace();
    const { setActivePhase } = usePhase();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    let displayType = entity?.type;
    if (isNonFicProject && displayType) {
        if (displayType === 'character') displayType = 'Key Figure / Subject';
        else if (displayType === 'place') displayType = 'Location / Context';
        else if (displayType === 'plot') displayType = 'Data Point / KPI';
        else if (displayType === 'lore') displayType = 'Concept / Framework';
    }

    useEffect(() => {
        if (visible && entity) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => {
                setIsRendered(false);
            }, 200);
            return () => clearTimeout(timer);
        }
        // Dependency array covers semantic requirements for this simple hook
    }, [visible, entity]);



    if (!isRendered || !entity) return null;

    return (
        <div
            ref={cardRef}
            className={`${styles.card} ${visible ? styles.visible : ''}`}
            style={{ left: x, top: y - 10 }}
            onMouseLeave={onClose}
            onMouseEnter={onMouseEnter}
        >
            <div className={styles.header}>
                <div className={styles.thumbnail}>
                    {entity.name.substring(0, 1)}
                </div>
                <div className={styles.titleInfo}>
                    <div className={styles.name}>{entity.name}</div>
                    <div className={styles.badge}>{displayType}</div>
                </div>
            </div>

            <div className={styles.synopsis}>
                {entity.synopsis || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No synopsis available. Click Quick Edit to add one.</span>}
            </div>

            <div className={styles.stats}>
                {entity.firstAppearance && (
                    <div className={styles.statRow}>
                        <span>First Appearance:</span>
                        <span>{entity.firstAppearance}</span>
                    </div>
                )}
                {entity.mentions !== undefined && (
                    <div className={styles.statRow}>
                        <span>Total Mentions:</span>
                        <span>{entity.mentions}</span>
                    </div>
                )}
                {entity.status && (
                    <div className={styles.statRow}>
                        <span>Status:</span>
                        <span>{entity.status}</span>
                    </div>
                )}
                {entity.associated && entity.associated.length > 0 && (
                    <div className={styles.statRow}>
                        <span>Linked to:</span>
                        <span>{entity.associated.join(', ')}</span>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => {
                    setActivePhase('lore');
                    setSelectedLoreId(entity.id);
                    setIsLeftSidebarOpen(true);
                    onClose();
                }}>
                    <BookOpen size={14} /> Open file
                </button>
                <button className={styles.actionBtn} onClick={onQuickEdit}>
                    <Edit2 size={14} /> Quick Edit
                </button>
                <button className={styles.actionBtn} onClick={onAskAI}>
                    <MessageSquare size={14} /> Ask AI
                </button>
            </div>
        </div>
    );
}
