'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, Plus, Trash2, Zap, Brain, GripVertical, AlertCircle } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './PlotTimeline.module.css';

interface TimelineEvent {
    id: string;
    title: string;
    time: string;
    description: string;
}

export default function PlotTimeline() {
    const { activeWorkspace, setActiveWorkspace } = useWorkspace();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isBrowser, setIsBrowser] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [error, setError] = useState<string | null>(null);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    useEffect(() => {
        if (activeWorkspace?.board_state?.timeline) {
            setEvents(activeWorkspace.board_state.timeline as TimelineEvent[]);
        } else if (events.length === 0) {
            setEvents([
                { id: `evt-${Date.now()}-1`, title: 'The Call to Adventure', time: 'Day 1 - Morning', description: 'The protagonist discovers the hidden message.' },
                { id: `evt-${Date.now()}-2`, title: 'Crossing the Threshold', time: 'Day 3 - Midnight', description: 'They leave their hometown and enter the city.' },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace?.board_state]);

    const saveTimeline = async (newEvents: TimelineEvent[]) => {
        if (!activeWorkspace) return;
        try {
            const updatedBoardState = { ...(activeWorkspace.board_state || {}), timeline: newEvents };
            await fetch(`/api/workspaces/${activeWorkspace.id}/board`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board_state: updatedBoardState })
            });
            setActiveWorkspace({ ...activeWorkspace, board_state: updatedBoardState });
        } catch (err) {
            console.error("Failed to save timeline:", err);
        }
    };

    const handleAddEvent = () => {
        const newEvent: TimelineEvent = {
            id: `evt-${Date.now()}`,
            title: 'New Event',
            time: 'Time / Date',
            description: 'Provide details about what happened here...'
        };
        const newEvents = [...events, newEvent];
        setEvents(newEvents);
        saveTimeline(newEvents);
    };

    const handleUpdateEvent = (id: string, field: keyof TimelineEvent, value: string) => {
        const newEvents = events.map(evt => evt.id === id ? { ...evt, [field]: value } : evt);
        setEvents(newEvents);
        saveTimeline(newEvents);
    };

    const handleDeleteEvent = (id: string) => {
        const newEvents = events.filter(evt => evt.id !== id);
        setEvents(newEvents);
        saveTimeline(newEvents);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(events);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setEvents(items);
        saveTimeline(items);
    };

    const analyzeGaps = async () => {
        if (events.length === 0) return;
        setIsAnalyzing(true);
        setError(null);
        setAnalysisResult('');

        try {
            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace?.id,
                    systemPrompt: `You are an expert ${isNonFicProject ? 'editor' : 'story structuralist'}. Your job is to analyze the user's chronological timeline. Identify any logical gaps, pacing issues, or missing connective tissue between the events. Return your analysis in plain text paragraphs without pleasantries or markdown formatting. Prefix your response strictly with: "ANALYSIS: "`,
                    messages: [
                        { role: 'user', content: `Here is my timeline in chronological order:\n\n${events.map((e, i) => `${i + 1}. [${e.time}] ${e.title}: ${e.description}`).join('\n')}\n\nPlease identify gaps or pacing issues.` }
                    ]
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to analyze timeline';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
                setAnalysisResult(fullText.replace(/^ANALYSIS:\s*/i, ''));
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error("Timeline analysis failed", e);
            setError(e.message || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isBrowser) return null;

    return (
        <div className={styles.container}>
            <div className={styles.introBox}>
                <div>
                    <h2 className={styles.introTitle}>
                        <Clock size={20} color="var(--tag-blue-text)" /> Interactive Plot Timeline
                    </h2>
                    <p className={styles.introDesc}>
                        {isNonFicProject
                            ? "Drag and drop events to model historical progression or argument continuity. Analyze the timeline to detect logical leaps in your thesis."
                            : "Map your story chronologically. Use AI gap-detection to find pacing issues or plot holes between major story beats."}
                    </p>
                </div>
                <button
                    className={styles.actionBtn}
                    onClick={analyzeGaps}
                    disabled={isAnalyzing || events.length < 2}
                >
                    {isAnalyzing ? <span className="spin"><Zap size={16} /></span> : <Brain size={16} />}
                    {isAnalyzing ? "Analyzing Pacing..." : "Analyze for Plot Gaps"}
                </button>
            </div>

            {error && (
                <div className={styles.analysisError} style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', marginBottom: '-3px' }} /> {error}
                </div>
            )}

            {analysisResult && !error && (
                <div className={styles.analysisPanel}>
                    <h3 className={styles.analysisTitle}><Brain size={16} /> AI Timeline Analysis</h3>
                    <div className={styles.analysisBody}>
                        {analysisResult}
                    </div>
                </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="timeline">
                    {(provided) => (
                        <div
                            className={styles.timeline}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {events.map((evt, index) => (
                                <Draggable key={evt.id} draggableId={evt.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            className={`${styles.eventCard} ${snapshot.isDragging ? styles.eventCardDragging : ''}`}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <div className={styles.marker} />
                                            <div
                                                className={styles.dragHandle}
                                                {...provided.dragHandleProps}
                                            >
                                                <GripVertical size={16} />
                                            </div>

                                            <input
                                                className={styles.eventTime}
                                                value={evt.time}
                                                onChange={(e) => handleUpdateEvent(evt.id, 'time', e.target.value)}
                                                placeholder="Time / Date"
                                            />
                                            <input
                                                className={styles.eventTitle}
                                                value={evt.title}
                                                onChange={(e) => handleUpdateEvent(evt.id, 'title', e.target.value)}
                                                placeholder="Event Title"
                                            />
                                            <textarea
                                                className={styles.eventDesc}
                                                value={evt.description}
                                                onChange={(e) => handleUpdateEvent(evt.id, 'description', e.target.value)}
                                                placeholder="Description of the event..."
                                            />

                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteEvent(evt.id)}
                                                title="Remove Event"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <button className={styles.addBtn} onClick={handleAddEvent}>
                <Plus size={16} /> Add New Event
            </button>
        </div>
    );
}
