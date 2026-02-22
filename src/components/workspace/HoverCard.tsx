import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Edit2, MessageSquare } from 'lucide-react';
import styles from './HoverCard.module.css';

interface EntityData {
    id: string;
    name: string;
    type: 'character' | 'place' | 'lore' | 'plot' | 'rule' | string;
    synopsis: string;
    firstAppearance?: string;
    mentions?: number;
    status?: string;
    associated?: string[];
}

interface HoverCardProps {
    entity: EntityData;
    x: number;
    y: number;
    onClose: () => void;
    visible: boolean;
}

export default function HoverCard({ entity, x, y, visible, onClose }: HoverCardProps) {
    const [isRendered, setIsRendered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedSynopsis, setEditedSynopsis] = useState(entity?.synopsis || '');
    const [isSaving, setIsSaving] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

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
    }, [visible, entity?.synopsis]);

    const handleSave = async () => {
        if (!entity) return;
        setIsSaving(true);
        // Simulate DB Sync & Vector Embedding Update 
        await new Promise(resolve => setTimeout(resolve, 600));
        entity.synopsis = editedSynopsis;
        setIsSaving(false);
        setIsEditing(false);
    };

    if (!isRendered || !entity) return null;

    return (
        <div
            ref={cardRef}
            className={`${styles.card} ${visible ? styles.visible : ''}`}
            style={{ left: x, top: y - 10 }}
            onMouseLeave={onClose}
        >
            <div className={styles.header}>
                <div className={styles.thumbnail}>
                    {entity.name.substring(0, 1)}
                </div>
                <div className={styles.titleInfo}>
                    <div className={styles.name}>{entity.name}</div>
                    <div className={styles.badge}>{entity.type}</div>
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
                        <button className={styles.actionBtn}>
                            <BookOpen size={14} /> Open file
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>
                            <Edit2 size={14} /> Quick Edit
                        </button>
                        <button className={styles.actionBtn}>
                            <MessageSquare size={14} /> Ask AI
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
