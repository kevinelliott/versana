import React, { useEffect, useState, useRef } from 'react';
import { BookOpen, Edit2, MessageSquare } from 'lucide-react';
import styles from './HoverCard.module.css';

interface EntityData {
    id: string;
    name: string;
    type: 'character' | 'place' | 'lore' | 'plot';
    synopsis: string;
    firstAppearance: string;
    mentions: number;
    status?: string;
    associated: string[];
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
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => setIsRendered(false), 200);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!isRendered) return null;

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
                {entity.synopsis}
            </div>

            <div className={styles.stats}>
                <div className={styles.statRow}>
                    <span>First Appearance:</span>
                    <span>{entity.firstAppearance}</span>
                </div>
                <div className={styles.statRow}>
                    <span>Total Mentions:</span>
                    <span>{entity.mentions}</span>
                </div>
                {entity.status && (
                    <div className={styles.statRow}>
                        <span>Status:</span>
                        <span>{entity.status}</span>
                    </div>
                )}
                <div className={styles.statRow}>
                    <span>Linked to:</span>
                    <span>{entity.associated.join(', ')}</span>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.actionBtn}>
                    <BookOpen size={14} /> Open file
                </button>
                <button className={styles.actionBtn}>
                    <Edit2 size={14} /> Quick Edit
                </button>
                <button className={styles.actionBtn}>
                    <MessageSquare size={14} /> Ask AI
                </button>
            </div>
        </div>
    );
}
