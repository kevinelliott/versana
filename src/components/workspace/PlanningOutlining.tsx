'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { LayoutList, BookOpen, Users, Plus, LayoutTemplate } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
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
        'col-ideas': { id: 'col-ideas', title: 'Lore Inbox (Hooks)', cardIds: [] },
        'col-1': { id: 'col-1', title: 'Act I (Setup)', cardIds: ['c2', 'c1', 'c3'] },
        'col-2': { id: 'col-2', title: 'Act II A (Rising Action)', cardIds: ['c4'] },
        'col-3': { id: 'col-3', title: 'Act II B (The Turn)', cardIds: [] },
        'col-4': { id: 'col-4', title: 'Act III (Resolution)', cardIds: [] },
    },
    columnOrder: ['col-ideas', 'col-1', 'col-2', 'col-3', 'col-4'],
};

export default function PlanningOutlining() {
    const { activeWorkspace, setActiveWorkspace, chapters, currentChapterId, setCurrentChapterId } = useWorkspace();
    const [board, setBoard] = useState<BoardData>(initialData);
    const [isBrowser, setIsBrowser] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('kanban');
    const [isSaving, setIsSaving] = useState(false);
    const [templateConfirmation, setTemplateConfirmation] = useState(false);

    // react-beautiful-dnd requires us to ensure we are rendering client-side only
    // to prevent hydration mismatches
    useEffect(() => {
        setIsBrowser(true);
    }, []);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    // Sync board state from database if available
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (activeWorkspace?.board_state?.kanban && (activeWorkspace.board_state.kanban as any).cards) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const loadedBoard = { ...activeWorkspace.board_state.kanban } as any;
            // Ensure col-ideas exists even if migrating old board state
            if (!loadedBoard.columns['col-ideas']) {
                loadedBoard.columns['col-ideas'] = { id: 'col-ideas', title: 'Lore Inbox (Hooks)', cardIds: [] };
                if (!loadedBoard.columnOrder.includes('col-ideas')) {
                    loadedBoard.columnOrder = ['col-ideas', ...loadedBoard.columnOrder];
                }
            }
            setBoard(loadedBoard);
        }
    }, [activeWorkspace?.board_state]);

    // Pull unassigned Plot Hooks from Lore
    useEffect(() => {
        const fetchLoreHooks = async () => {
            if (!activeWorkspace) return;
            try {
                const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();

                // Get all plot hooks from Lore
                const hooks = data.filter((item: { type: string, id: string, name: string, synopsis: string }) => item.type === 'Plot Hook');

                setBoard(prevBoard => {
                    let updated = false;
                    const newCards = { ...prevBoard.cards };
                    const newInboxCardIds = [...(prevBoard.columns['col-ideas']?.cardIds || [])];

                    hooks.forEach((hook: { type: string, id: string, name: string, synopsis: string }) => {
                        // Check if this hook exists anywhere in the board's cards
                        if (!newCards[hook.id]) {
                            newCards[hook.id] = {
                                id: hook.id,
                                title: hook.name,
                                description: hook.synopsis,
                                tags: ['Plot']
                            };
                            newInboxCardIds.push(hook.id);
                            updated = true;
                        }
                    });

                    if (updated) {
                        return {
                            ...prevBoard,
                            cards: newCards,
                            columns: {
                                ...prevBoard.columns,
                                'col-ideas': {
                                    ...prevBoard.columns['col-ideas'],
                                    cardIds: newInboxCardIds
                                }
                            }
                        };
                    }

                    return prevBoard;
                });
            } catch (err) {
                console.error("Failed to fetch lore hooks:", err);
            }
        };

        fetchLoreHooks();
    }, [activeWorkspace]);

    const saveBoard = async (newBoard: BoardData) => {
        if (!activeWorkspace) return;
        try {
            const updatedBoardState = { ...(activeWorkspace.board_state || {}), kanban: newBoard };
            await fetch(`/api/workspaces/${activeWorkspace.id}/board`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board_state: updatedBoardState })
            });
            setActiveWorkspace({ ...activeWorkspace, board_state: updatedBoardState });
        } catch (err) {
            console.error("Failed to save board state:", err);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Check if dragged to a chapter
        if (destination.droppableId.startsWith('chapter-')) {
            const chapterId = destination.droppableId.split('chapter-')[1];
            const startColumn = board.columns[source.droppableId];
            const card = board.cards[draggableId];

            // Remove from Kanban
            const newStartCardIds = Array.from(startColumn.cardIds);
            newStartCardIds.splice(source.index, 1);
            const newStart = { ...startColumn, cardIds: newStartCardIds };

            const newBoard = {
                ...board,
                columns: { ...board.columns, [newStart.id]: newStart }
            };

            setBoard(newBoard);
            saveBoard(newBoard);

            // Fetch current chapter and append beat context
            const assignBeatToChapter = async () => {
                setIsSaving(true);
                try {
                    const res = await fetch(`/api/chapters/${chapterId}`);
                    const data = await res.json();

                    const newBeatText = `[Beat Assigned from Outline]: ${card.title} - ${card.description}`;

                    // Simple text append if it's empty, otherwise string manipulate
                    let updatedContent = data.content || {};
                    if (!updatedContent.content) updatedContent = { type: 'doc', content: [] };

                    updatedContent.content.push({
                        type: 'paragraph',
                        content: [{ type: 'text', text: newBeatText }]
                    });

                    await fetch(`/api/chapters/${chapterId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: updatedContent })
                    });
                } catch (e) {
                    console.error("Failed to assign beat to chapter:", e);
                } finally {
                    setIsSaving(false);
                }
            };

            assignBeatToChapter();
            return;
        }

        const startColumn = board.columns[source.droppableId];
        const finishColumn = board.columns[destination.droppableId];

        // Moving within the same column
        if (startColumn === finishColumn) {
            const newCardIds = Array.from(startColumn.cardIds);
            newCardIds.splice(source.index, 1);
            newCardIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...startColumn, cardIds: newCardIds };
            const newBoard = {
                ...board,
                columns: { ...board.columns, [newColumn.id]: newColumn }
            };
            setBoard(newBoard);
            saveBoard(newBoard);
            return;
        }

        // Moving from one column to another
        const startCardIds = Array.from(startColumn.cardIds);
        startCardIds.splice(source.index, 1);
        const newStart = { ...startColumn, cardIds: startCardIds };

        const finishCardIds = Array.from(finishColumn.cardIds);
        finishCardIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finishColumn, cardIds: finishCardIds };

        const newBoard = {
            ...board,
            columns: {
                ...board.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            }
        };
        setBoard(newBoard);
        saveBoard(newBoard);
    };

    const handleAddBeat = (columnId: string) => {
        const newCardId = `card-${Date.now()}`;
        const newCard: CardData = {
            id: newCardId,
            title: 'New Beat',
            description: 'Edit description here...',
            tags: ['Plot']
        };

        const newColumn = {
            ...board.columns[columnId],
            cardIds: [...board.columns[columnId].cardIds, newCardId]
        };

        const newBoard = {
            ...board,
            cards: { ...board.cards, [newCardId]: newCard },
            columns: { ...board.columns, [columnId]: newColumn }
        };

        setBoard(newBoard);
        saveBoard(newBoard);
    };

    const loadTemplate = () => {
        setTemplateConfirmation(true);
    };

    const confirmLoadTemplate = () => {
        setTemplateConfirmation(false);
        if (isNonFicProject) {

            const nfBeats = [
                { col: 'col-1', title: '1. Introduction / Hook', desc: 'State the premise. Why should the reader care? What problem are we solving?' },
                { col: 'col-1', title: '2. The Core Problem', desc: 'Identify the pain points or establish the historical context.' },
                { col: 'col-1', title: '3. Thesis Statement', desc: 'The big idea that promises a solution or fresh perspective.' },

                { col: 'col-2', title: '4. Foundation / History', desc: 'Background information necessary to understand the main arguments.' },
                { col: 'col-2', title: '5. Argument 1 / Principle 1', desc: 'First major point or methodology.' },
                { col: 'col-2', title: '6. Case Study 1', desc: 'Evidence or story supporting the first argument.' },

                { col: 'col-3', title: '7. Argument 2 / Principle 2', desc: 'Second major point or methodology.' },
                { col: 'col-3', title: '8. Case Study 2', desc: 'Evidence or story supporting the second argument.' },
                { col: 'col-3', title: '9. Counter-Arguments', desc: 'Addressing skepticism and presenting alternative viewpoints objectively.' },

                { col: 'col-4', title: '10. Synthesis & Action Plan', desc: 'How to apply these ideas in the real world.' },
                { col: 'col-4', title: '11. Conclusion', desc: 'Summary of the journey. Final inspiring thought or call to action.' },
            ];

            const newBoard = { ...board };
            const targetCols = ['col-1', 'col-2', 'col-3', 'col-4'];
            targetCols.forEach(colId => {
                if (!newBoard.columns[colId]) {
                    newBoard.columns[colId] = { id: colId, title: colId, cardIds: [] };
                    if (!newBoard.columnOrder.includes(colId)) {
                        newBoard.columnOrder.push(colId);
                    }
                }
            });

            nfBeats.forEach((beat, index) => {
                const newCardId = `nf-${Date.now()}-${index}`;
                const newCard: CardData = {
                    id: newCardId,
                    title: beat.title,
                    description: beat.desc,
                    tags: ['Plot'] // Assuming Plot maps to Data Points / KPIs
                };

                newBoard.cards[newCardId] = newCard;
                newBoard.columns[beat.col].cardIds.push(newCardId);
            });

            setBoard(newBoard);
            saveBoard(newBoard);
            return;
            setBoard(newBoard);
            saveBoard(newBoard);
            return;
        }

        const stcBeats = [
            { col: 'col-1', title: '1. Opening Image (1%)', desc: 'A visual that represents the hero\'s flawed world before the adventure begins.' },
            { col: 'col-1', title: '2. Theme Stated (5%)', desc: 'A statement made by a character (not the hero) that hints at what the hero will learn.' },
            { col: 'col-1', title: '3. Set-Up (1-10%)', desc: 'Explore the hero\'s current life, flaws, and the things that need fixing.' },
            { col: 'col-1', title: '4. Catalyst (10%)', desc: 'The inciting incident. A life-changing event that knocks down the house of cards.' },
            { col: 'col-1', title: '5. Debate (10-20%)', desc: 'The hero doubts the journey. A question is asked: will they answer the call?' },

            { col: 'col-2', title: '6. Break Into Two (20%)', desc: 'The hero makes a choice and the journey begins. We leave the old world behind.' },
            { col: 'col-2', title: '7. B Story (22%)', desc: 'Introduction of a subplot, usually involving the love interest or a character who embodies the theme.' },
            { col: 'col-2', title: '8. Fun and Games (20-50%)', desc: 'The promise of the premise. The hero explores the new world. We see them succeed or fail based on the hook.' },
            { col: 'col-2', title: '9. Midpoint (50%)', desc: 'A false victory or false defeat. The stakes are raised, and the countdown clock begins.' },

            { col: 'col-3', title: '10. Bad Guys Close In (50-75%)', desc: 'The novelty wears off. Internal and external forces tighten around the hero.' },
            { col: 'col-3', title: '11. All Is Lost (75%)', desc: 'The lowest point. The mentor dies (literally or metaphorically). A whiff of death.' },
            { col: 'col-3', title: '12. Dark Night of the Soul (75-80%)', desc: 'The hero wallows in hopelessness. They must figure out the lesson before proceeding.' },

            { col: 'col-4', title: '13. Break Into Three (80%)', desc: 'The hero synthesizes the A Story and B Story. They find the solution.' },
            { col: 'col-4', title: '14. Finale (80-99%)', desc: 'The hero confronts the antagonist using their new knowledge. The flawed world is changed.' },
            { col: 'col-4', title: '15. Final Image (100%)', desc: 'A mirror to the Opening Image, proving that the hero and the world have transformed.' }
        ];

        const newBoard = { ...board };

        // Make sure the columns exist (incase they deleted or renamed them, we append to col-1 to col-4)
        const targetCols = ['col-1', 'col-2', 'col-3', 'col-4'];
        targetCols.forEach(colId => {
            if (!newBoard.columns[colId]) {
                newBoard.columns[colId] = { id: colId, title: colId, cardIds: [] };
                if (!newBoard.columnOrder.includes(colId)) {
                    newBoard.columnOrder.push(colId);
                }
            }
        });

        stcBeats.forEach((beat, index) => {
            const newCardId = `stc-${Date.now()}-${index}`;
            const newCard: CardData = {
                id: newCardId,
                title: beat.title,
                description: beat.desc,
                tags: ['Plot']
            };

            newBoard.cards[newCardId] = newCard;
            newBoard.columns[beat.col].cardIds.push(newCardId);
        });

        setBoard(newBoard);
        saveBoard(newBoard);
    };

    if (!isBrowser) return null;

    if (activeTab === 'relationships') {
        return (
            <div className={styles.container}>
                <div className={styles.tabNav}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === String('kanban') ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('kanban')}
                    >
                        <LayoutList size={16} /> {isNonFicProject ? 'Kanban Outline' : 'Kanban Beats'}
                    </button>
                    {!isNonFicProject && (
                        <button
                            className={`${styles.tabBtn} ${activeTab === String('relationships') ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('relationships')}
                        >
                            <Users size={16} /> Relationship Web
                        </button>
                    )}
                </div>
                <div style={{ flexGrow: 1, marginTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <RelationshipWeb />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {templateConfirmation && (
                <div className={styles.modalOverlay} style={{ zIndex: 10000 }}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                        <h2 className={styles.modalTitle} style={{ marginBottom: '1rem' }}>Load Template</h2>
                        <p className={styles.modalDesc} style={{ marginBottom: '2rem' }}>
                            {isNonFicProject
                                ? "This will add a standard Non-Fiction outline structure to your Kanban board. Proceed?"
                                : "This will add the 15 'Save the Cat!' beat cards to your current Kanban board. Proceed?"}
                        </p>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setTemplateConfirmation(false)}>Cancel</button>
                            <button className={styles.modalActionBtn} onClick={confirmLoadTemplate}>
                                Load Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className={styles.title}>
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Phase 2</span>
                            {isNonFicProject ? 'Outline & Structure' : 'Planning & Outlining'}
                        </h1>
                        <p className={styles.subtitle}>
                            {isNonFicProject ? 'Map your chapters and sections. Organize arguments logically.' : 'Map your structural beats. Move scenes freely between acts.'}
                        </p>
                    </div>

                    <button
                        onClick={loadTemplate}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)',
                            border: '1px solid var(--tag-purple-text)', padding: '0.5rem 1rem',
                            borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        <LayoutTemplate size={16} /> {isNonFicProject ? 'Load Non-Fiction Template' : 'Load Save the Cat! Template'}
                    </button>
                </div>

                <div className={styles.tabNav} style={{ marginTop: '1.5rem' }}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === String('kanban') ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('kanban')}
                    >
                        <LayoutList size={16} /> {isNonFicProject ? 'Kanban Outline' : 'Kanban Beats'}
                    </button>
                    {!isNonFicProject && (
                        <button
                            className={`${styles.tabBtn} ${activeTab === String('relationships') ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('relationships')}
                        >
                            <Users size={16} /> Relationship Web
                        </button>
                    )}
                    <button
                        className={`${styles.tabBtn} ${activeTab === String('notes') ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        <BookOpen size={16} /> Notes
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
                    {/* Chapter Sidebar */}
                    <div className={styles.chapterSidebar}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            Manuscript
                            {isSaving && <LayoutList size={14} className="spin" />}
                        </div>
                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {chapters.map((chapter) => (
                                <Droppable key={chapter.id} droppableId={`chapter-${chapter.id}`}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`${styles.chapterItem} ${currentChapterId === chapter.id ? styles.chapterItemActive : ''} ${snapshot.isDraggingOver ? styles.chapterItemDraggingOver : ''}`}
                                            onClick={() => setCurrentChapterId(chapter.id)}
                                        >
                                            <div className={styles.chapterItemTitle}>{chapter.title}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Drag {isNonFicProject ? 'sections' : 'beats'} here</div>
                                            <div style={{ display: 'none' }}>{provided.placeholder}</div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </div>

                    <div className={styles.boardScroll} style={{ paddingLeft: '1.5rem' }}>
                        {board.columnOrder.map((columnId) => {
                            const column = board.columns[columnId];
                            const cards = column.cardIds.map(cardId => board.cards[cardId]);

                            return (
                                <div key={column.id} className={styles.column}>
                                    <div className={styles.columnHeader}>
                                        <h3 className={styles.columnTitle}>{column.title}</h3>
                                        <span className={styles.columnBadge}>{cards.length} {isNonFicProject ? 'sections' : 'beats'}</span>
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

                                    <button
                                        className={styles.addBtn}
                                        onClick={() => handleAddBeat(column.id)}
                                    >
                                        <Plus size={16} /> Add {isNonFicProject ? 'Section' : 'Beat'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}
