'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Send, Loader2, Save } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import styles from './ConceptIdeation.module.css';
import workspaceStyles from './Workspace.module.css';

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

interface Concept {
    id: string;
    title: string;
    description: string;
}

export default function ConceptIdeation() {
    const { activeWorkspace } = useWorkspace();
    const { setActivePhase } = usePhase();

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    // Hooks for Seed Generator
    const [seedPrompt, setSeedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [seedError, setSeedError] = useState<string | null>(null);

    // Hooks for What-If Engine
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (activeWorkspace && messages.length === 0) {
            const isNonFic = activeWorkspace.genre?.toLowerCase().includes('[non-fiction]');
            const greeting = isNonFic 
                ? `Welcome to your new project, **${activeWorkspace.name}**! I am the Socratic Engine. Tell me your core thesis, and I will rigorously pressure-test your arguments.`
                : `Welcome to your new universe, **${activeWorkspace.name}**! I am the What-If Engine. To get started, just tell me a sentence or two about the kind of story you want to write, and I'll help you flesh it out.`;
            
            setMessages([{ id: 'init', role: 'ai', content: greeting }]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const isEmptyState = concepts.length === 0 && messages.length <= 1 && !seedPrompt && !input;

    const handleGenerateConcepts = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seedPrompt) return;

        setIsGenerating(true);
        setSeedError(null);
        setConcepts([]);

        try {
            const res = await fetch('/api/ai/seed-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: seedPrompt, workspaceId: activeWorkspace?.id }),
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate concepts.';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            if (data?.concepts) {
                setConcepts(data.concepts);
            }
        } catch (err: unknown) {
            console.error("Seed generator error:", err);
            setSeedError((err as Error).message || "An error occurred. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveConceptToLore = async (concept: Concept) => {
        if (!activeWorkspace) return;

        try {
            const res = await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: concept.title,
                    type: 'Plot Hook',
                    synopsis: concept.description
                })
            });

            if (res.ok) {
                // Transition to Planning & Outlining phase (Phase 2)
                setActivePhase('2');
            } else {
                console.error("Failed to save concept:", await res.text());
            }
        } catch (e) {
            console.error("Error saving concept:", e);
        }
    };

    const handleWhatIfSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const aiMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '' }]);

        try {
            const apiMessages = [...messages, userMsg]
                .filter(m => m.id !== 'init')
                .map(m => ({
                    role: m.role === 'ai' ? 'assistant' : 'user',
                    content: m.content
                }));

            const systemPrompt = isNonFicProject
                ? "You are the 'What-If Engine', a rigorous and creative non-fiction AI assistant. The author will give you a core topic, thesis, or premise. Your ONLY goal is to challenge them by asking 1 or 2 deep, boundary-pushing 'What if?' questions that test their arguments, explore niche sub-topics, or improve their unique value proposition. Do not write the outline for them; just ask the questions. Keep it brief and intense."
                : "You are the 'What-If Engine', a challenging and creative narrative AI co-writer. The author will give you a basic premise or answer a question. Your ONLY goal is to challenge them by asking 1 or 2 deep, boundary-pushing 'What if?' questions that subvert tropes, add depth, and increase stakes. Do not solve the plot for them; just ask the questions. Keep it brief and intense.";

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace?.id || 'sandbox',
                    messages: apiMessages,
                    systemPrompt: systemPrompt
                })
            });

            if (!res.ok || !res.body) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to connect to What-If Engine.';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('0:')) {
                        try {
                            const text = JSON.parse(line.substring(2));
                            accumulatedContent += text;
                            setMessages(prev => prev.map(m =>
                                m.id === aiMsgId ? { ...m, content: accumulatedContent } : m
                            ));
                        } catch { /* ignore parse errors */ }
                    } else if (!line.match(/^[0-9]+:/) && line.trim().length > 0) {
                        accumulatedContent += line;
                        setMessages(prev => prev.map(m =>
                            m.id === aiMsgId ? { ...m, content: accumulatedContent } : m
                        ));
                    }
                }
            }

        } catch (err: unknown) {
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: (err as Error).message || `An error occurred connecting to the ${isNonFicProject ? 'Socratic' : 'What-If'} Engine.` } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={workspaceStyles.workspaceContainer}>
            <div className={workspaceStyles.workspaceGlobalHeader}>
                <h1 className={workspaceStyles.phaseTitle}>
                    <span className={workspaceStyles.phaseLabel}>Phase 1</span>
                    {isNonFicProject ? 'Topic & Thesis' : 'Concept & Ideation'}
                </h1>
                <p className={workspaceStyles.phaseSubtitle}>
                    {isNonFicProject ? 'Develop your core topic and pressure-test your thesis with the Socratic Engine.' : 'Generate core premise ideas and pressure-test them with the What-If Engine.'}
                </p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.contentWrapper}`}>
                {isEmptyState && (
                    <div className={styles.emptyStateBanner}>
                        <div className={styles.emptyStateIconWrapper}>
                            <Sparkles className={styles.emptyStateIcon} size={32} />
                        </div>
                        <h2 className={styles.emptyStateTitle}>
                            {isNonFicProject ? "Every Great Book Starts With a Question" : "Every Great Story Starts With a Spark"}
                        </h2>
                        <p className={styles.emptyStateDesc}>
                            {isNonFicProject
                                ? "Use the generative tools below to brainstorm angles for your topic. The AI Seed Generator will help you scaffold initial ideas, while the Socratic Engine will rigorously pressure-test your arguments."
                                : "Use the generative tools below to brainstorm your core premise. The AI Seed Generator will help you scaffold initial hooks, while the What-If Engine will push your narrative boundaries."}
                        </p>
                    </div>
                )}

                <section className={styles.seedSection}>
                    <h2 className={styles.sectionTitle}>
                        <Sparkles className={styles.icon} size={22} />
                        AI Seed Generator
                    </h2>
                    <form className={styles.formGroup} onSubmit={handleGenerateConcepts}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={isNonFicProject ? "e.g. A practical guide to 15-minute healthy keto meals..." : "e.g. A sci-fi noir about a detective who can taste time..."}
                            value={seedPrompt}
                            onChange={(e) => setSeedPrompt(e.target.value)}
                            disabled={isGenerating}
                        />
                        <button type="submit" className={styles.btnPrimary} disabled={!seedPrompt || isGenerating}>
                            {isGenerating ? <Loader2 size={18} className="spin" /> : 'Generate Hooks'}
                        </button>
                    </form>

                    {seedError && (
                        <div style={{ color: 'var(--accent-terracotta)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            {seedError}
                        </div>
                    )}

                    {!isEmptyState && concepts.length === 0 && !isGenerating && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '4px solid var(--tag-purple-bg)' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                <Sparkles size={14} color="var(--tag-purple-text)" /> How to Build Your Foundation
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {isNonFicProject
                                    ? "Pro-Tip: Generate multiple thesis hooks. When you find one you like, click 'Save to Knowledge Base'. This saves the concept and automatically pushes you to Phase 2 to begin outlining it."
                                    : "Pro-Tip: Generate multiple narrative hooks. When you find one you like, click 'Save to Lore Bible'. This saves the concept and automatically pushes you to Phase 2 to begin structuring your beats."}
                            </p>
                        </div>
                    )}

                    {concepts.length > 0 && (
                        <div className={styles.resultsGrid}>
                            {concepts.map(concept => (
                                <div key={concept.id} className={styles.conceptCard}>
                                    <h3 className={styles.conceptTitle}>{concept.title}</h3>
                                    <p className={styles.conceptDesc}>{concept.description}</p>
                                    <div style={{ marginTop: '1rem' }}>
                                        <button
                                            style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                            onClick={() => handleSaveConceptToLore(concept)}
                                        >
                                            <Save size={14} /> Save to {isNonFicProject ? 'Knowledge Base' : 'Lore Bible'}
                                        </button>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                            Saves concept and advances to Phase 2
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* What-If / Socratic Engine */}
                <section className={styles.whatIfSection}>
                    <h2 className={styles.sectionTitle}>
                        <BrainCircuit className={styles.icon} size={22} />
                        {isNonFicProject ? 'The Socratic Engine' : 'The What-If Engine'}
                    </h2>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: '-0.5rem', lineHeight: 1.5 }}>
                        {isNonFicProject
                            ? "Provide a core thesis or claim. The Socratic Engine will ruthlessly pressure-test your logic to ensure your arguments are sound before you begin full-scale outlining."
                            : "Provide a basic premise. The What-If Engine will push your narrative boundaries, subvert standard tropes, and instantly help you increase the stakes of your story foundation."}
                    </p>

                    <div className={styles.chatContainer}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                                <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.aiMessage}`}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader2 size={16} className="spin" /> Thinking...</span>
                            </div>
                        )}
                    </div>

                    <form className={styles.qaForm} onSubmit={handleWhatIfSubmit}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={isNonFicProject ? "Type your thesis or answer the What-If question..." : "Type your premise or answer the What-If question..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className={styles.sendBtn} disabled={!input || isLoading}>
                            <Send size={18} />
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
