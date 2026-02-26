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
}

export default function HoverCard({ entity, x, y, visible, onClose, onMouseEnter }: HoverCardProps) {
    const [isRendered, setIsRendered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedSynopsis, setEditedSynopsis] = useState(entity?.synopsis || '');
    const [isSaving, setIsSaving] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const { activeWorkspace, setSelectedLoreId, setIsLeftSidebarOpen, setIsRightSidebarOpen } = useWorkspace();
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
             
            setIsRendered(true);
            setEditedSynopsis(entity.synopsis || ''); // Reset draft when opened
        } else {
            const timer = setTimeout(() => {
                setIsRendered(false);
                setIsEditing(false); // Reset editing mode on close
            }, 200);
            return () => clearTimeout(timer);
        }
        // Dependency array covers semantic requirements for this simple hook
    }, [visible, entity]);

    const handleSave = async () => {
        if (!entity) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/lore/${entity.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ synopsis: editedSynopsis })
            });
            if (res.ok) {
                // Cannot mutate props directly in React.
                // In a real app we'd dispatch an update to Context or call an API here.
                entity.synopsis = editedSynopsis; // optimistic update of in-memory object
            } else {
                console.error("Failed to update lore");
            }
        } catch (e) {
            console.error("Error updating lore:", e);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

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
                {isEditing ? (
                    <textarea
                        className={styles.quickEditArea}
                        value={editedSynopsis}
                        onChange={(e) => setEditedSynopsis(e.target.value)}
                        placeholder="Add synopsis details..."
                        autoFocus
                    />
                ) : (
                    entity.synopsis || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No synopsis available. Click Quick Edit to add one.</span>
                )}
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
                {isEditing ? (
                    <>
                        <button className={styles.saveBtnActive} onClick={handleSave} disabled={isSaving}>
                            <Edit2 size={14} /> {isSaving ? "Syncing..." : "Save to Vector DB"}
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className={styles.actionBtn} onClick={() => {
                            setActivePhase('lore');
                            setSelectedLoreId(entity.id);
                            setIsLeftSidebarOpen(true);
                            onClose();
                        }}>
                            <BookOpen size={14} /> Open file
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>
                            <Edit2 size={14} /> Quick Edit
                        </button>
                        <button className={styles.actionBtn} onClick={() => {
                            setIsRightSidebarOpen(true);
                            onClose();
                        }}>
                            <MessageSquare size={14} /> Ask AI
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
