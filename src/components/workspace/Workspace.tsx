'use client';

import React, { useState, MouseEvent } from 'react';
import HoverCard from './HoverCard';
import styles from './Workspace.module.css';

// Pre-fetched mock data representing the Context Matrix / Lore Bible
const LORE_DATABASE = [
    {
        id: 'char_1',
        name: 'Captain Aris',
        aliases: ['Aris'],
        type: 'character' as const,
        synopsis: 'Rogue starship captain. Secretly loyal to the rebellion. Currently carrying a severe blaster wound to the left shoulder.',
        firstAppearance: 'Chapter 2',
        mentions: 143,
        status: 'Alive / On Ship',
        associated: ['The Rebellion', 'The Iron Hawk']
    },
    {
        id: 'plot_1',
        name: 'The Rebellion',
        aliases: ['Rebellion'],
        type: 'plot' as const,
        synopsis: 'A scattered coalition of outer-rim planets fighting against the Hegemony. Severely underfunded and relying on guerrilla tactics.',
        firstAppearance: 'Chapter 1',
        mentions: 412,
        status: 'Active',
        associated: ['Captain Aris', 'Mira']
    },
    {
        id: 'char_2',
        name: 'Mira',
        aliases: [],
        type: 'character' as const,
        synopsis: 'Aris’s second-in-command and chief engineer. Pragmatic, ruthless, and distrustful of the core worlds.',
        firstAppearance: 'Chapter 3',
        mentions: 89,
        status: 'Alive / On Ridge',
        associated: ['Captain Aris', 'The Iron Hawk']
    }
];

// Helper to parse text and inject Lore Tags
function parseTextWithNER(
    text: string,
    onHover: (entity: any, e: MouseEvent) => void,
    onLeave: () => void
) {
    // A simplistic mock NER: we check for exact string matches of our mock entities
    let result: React.ReactNode[] = [text];

    LORE_DATABASE.forEach(entity => {
        const terms = [entity.name, ...entity.aliases];

        terms.forEach(term => {
            const regex = new RegExp(`\\b(${term})\\b`, 'gi');

            result = result.flatMap((segment, index): React.ReactNode[] => {
                if (typeof segment !== 'string') return [segment];

                const parts = segment.split(regex);
                return parts.map((part, i) => {
                    // If this part matches the search term (case-insensitive)
                    if (part.toLowerCase() === term.toLowerCase()) {
                        return (
                            <span
                                key={`${entity.id}-${index}-${i}`}
                                className={`${styles.loreTag} ${styles[entity.type]}`}
                                onMouseEnter={(e) => onHover(entity, e)}
                                onMouseLeave={onLeave}
                            >
                                {part}
                            </span>
                        );
                    }
                    return part;
                });
            });
        });
    });

    return result;
}

export default function Workspace() {
    const [hoverState, setHoverState] = useState<{
        entity: any | null;
        x: number;
        y: number;
        visible: boolean;
    }>({
        entity: null,
        x: 0,
        y: 0,
        visible: false,
    });

    const handleEntityHover = (entity: any, e: MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setHoverState({
            entity,
            x: rect.left,
            y: rect.top,
            visible: true
        });
    };

    const handleEntityLeave = () => {
        setHoverState(prev => ({ ...prev, visible: false }));
    };

    const mockParagraphs = [
        "The snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, his breath pluming in the frigid air. The Rebellion could not afford to lose this vantage point.",
        "\"They're coming from the eastern ridge,\" shouted Mira, pointing toward the jagged peaks."
    ];

    return (
        <div className={styles.workspace}>
            <div className={styles.editorContainer}>
                <div className={styles.toolbar}>
                    <button className={styles.toolBtn}>Hide Tags</button>
                </div>

                <div className={styles.documentHeader}>
                    <h1 className={styles.documentTitle} contentEditable suppressContentEditableWarning>
                        Chapter 4: The Winter Siege
                    </h1>
                </div>

                <div className={styles.editorArea}>
                    {mockParagraphs.map((p, i) => (
                        <p key={i} className={styles.paragraph} contentEditable suppressContentEditableWarning>
                            {parseTextWithNER(p, handleEntityHover, handleEntityLeave)}
                        </p>
                    ))}
                </div>
            </div>

            <HoverCard
                entity={hoverState.entity || LORE_DATABASE[0]}
                x={hoverState.x}
                y={hoverState.y}
                visible={hoverState.visible}
                onClose={handleEntityLeave}
            />
        </div>
    );
}
