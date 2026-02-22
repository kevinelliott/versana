'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { LayoutList, BookOpen, Users, Plus } from 'lucide-react';
import styles from './PlanningOutlining.module.css';
import RelationshipWeb from './RelationshipWeb';

// Type definitions for our Kanban state
interface CardData {
    id: string;
    title: string;
    description: string;
    tags: ('Character' | 'Plot' | 'Setting')[];
}

interface ColumnData {
    id: string;
    title: string;
    cardIds: string[];
}

interface BoardData {
    cards: Record<string, CardData>;
    columns: Record<string, ColumnData>;
    columnOrder: string[];
}

const initialData: BoardData = {
    cards: {
        'c1': { id: 'c1', title: 'The Inciting Incident', description: 'Aris receives the distress signal from the lost colony of Xol.', tags: ['Plot'] },
        'c2': { id: 'c2', title: 'Introduce Mira', description: 'Show Mira jury-rigging the hyperdrive right before they have to jump.', tags: ['Character', 'Setting'] },
        'c3': { id: 'c3', title: 'The First Threshold', description: 'The crew votes to abandon their corporate mandate and investigate the signal.', tags: ['Plot'] },
        'c4': { id: 'c4', title: 'Arrival at Xol', description: 'The atmosphere is stripped. First signs of the mechanized threat.', tags: ['Setting'] },
    },
    columns: {
        'col-1': { id: 'col-1', title: 'Act I (Setup)', cardIds: ['c2', 'c1', 'c3'] },
        'col-2': { id: 'col-2', title: 'Act II A (Rising Action)', cardIds: ['c4'] },
        'col-3': { id: 'col-3', title: 'Act II B (The Turn)', cardIds: [] },
        'col-4': { id: 'col-4', title: 'Act III (Resolution)', cardIds: [] },
    },
    columnOrder: ['col-1', 'col-2', 'col-3', 'col-4'],
};

export default function PlanningOutlining() {
    const [board, setBoard] = useState<BoardData>(initialData);
    const [isBrowser, setIsBrowser] = useState(false);
    const [activeTab, setActiveTab] = useState<'kanban' | 'relationships'>('kanban');

    // react-beautiful-dnd requires us to ensure we are rendering client-side only
    // to prevent hydration mismatches
    useEffect(() => {
        setIsBrowser(true);
    }, []);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = board.columns[source.droppableId];
        const finishColumn = board.columns[destination.droppableId];

        // Moving within the same column
        if (startColumn === finishColumn) {
            const newCardIds = Array.from(startColumn.cardIds);
            newCardIds.splice(source.index, 1);
            newCardIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...startColumn, cardIds: newCardIds };
            setBoard({
                ...board,
                columns: { ...board.columns, [newColumn.id]: newColumn }
            });
            return;
        }

        // Moving from one column to another
        const startCardIds = Array.from(startColumn.cardIds);
        startCardIds.splice(source.index, 1);
        const newStart = { ...startColumn, cardIds: startCardIds };

        const finishCardIds = Array.from(finishColumn.cardIds);
        finishCardIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finishColumn, cardIds: finishCardIds };

        setBoard({
            ...board,
            columns: {
                ...board.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        });
    };

    if (!isBrowser) return null;

    if (activeTab === 'relationships') {
        return (
            <div className={styles.container}>
                <div className={styles.tabNav}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'kanban' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('kanban')}
                    >
                        <LayoutList size={16} /> Kanban Beats
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'relationships' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('relationships')}
                    >
                        <Users size={16} /> Relationship Web
                    </button>
                </div>
                <div style={{ flexGrow: 1, marginTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <RelationshipWeb />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 2: Planning & Outlining</h1>
                <p className={styles.subtitle}>Map your structural beats. Move scenes freely between acts.</p>

                <div className={styles.tabNav} style={{ marginTop: '1.5rem' }}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'kanban' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('kanban')}
                    >
                        <LayoutList size={16} /> Kanban Beats
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'relationships' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('relationships')}
                    >
                        <Users size={16} /> Relationship Web
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'notes' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        <BookOpen size={16} /> Notes
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.boardScroll}>
                    {board.columnOrder.map((columnId) => {
                        const column = board.columns[columnId];
                        const cards = column.cardIds.map(cardId => board.cards[cardId]);

                        return (
                            <div key={column.id} className={styles.column}>
                                <div className={styles.columnHeader}>
                                    <h3 className={styles.columnTitle}>{column.title}</h3>
                                    <span className={styles.columnBadge}>{cards.length} beats</span>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                        <div
                                            className={styles.cardList}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {cards.map((card, index) => (
                                                <Draggable key={card.id} draggableId={card.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            className={`${styles.card} ${snapshot.isDragging ? styles.cardDragging : ''}`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <h4 className={styles.cardTitle}>{card.title}</h4>
                                                            <p className={styles.cardDesc}>{card.description}</p>

                                                            <div className={styles.cardFooter}>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    {card.tags.map(tag => (
                                                                        <span key={tag} className={`${styles.tag} ${styles[`tag${tag}`]}`}>
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <div className={styles.iconGrp}>
                                                                    <LayoutList size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                <button className={styles.addBtn}>
                                    <Plus size={16} /> Add Beat
                                </button>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}
