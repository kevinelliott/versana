'use client';

import React, { useState } from 'react';
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
    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: 'init',
        role: 'ai',
        content: "I am the What-If Engine. Tell me your basic premise, and I will push the boundaries of your narrative by asking challenging 'What if?' questions."
    }]);

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
                throw new Error('Failed to generate concepts.');
            }

            const data = await res.json();
            if (data?.concepts) {
                setConcepts(data.concepts);
            }
        } catch (err: unknown) {
            console.error("Seed generator error:", err);
            setSeedError("An error occurred. Please try again.");
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

            if (!res.ok || !res.body) throw new Error('Failed to stream response');

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

        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, content: "An error occurred connecting to the What-If Engine." } : m
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
                    {isNonFicProject ? 'Develop your core topic and pressure-test your thesis with the What-If Engine.' : 'Generate core premise ideas and pressure-test them with the What-If Engine.'}
                </p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.contentWrapper}`}>
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

                    {concepts.length > 0 && (
                        <div className={styles.resultsGrid}>
                            {concepts.map(concept => (
                                <div key={concept.id} className={styles.conceptCard}>
                                    <h3 className={styles.conceptTitle}>{concept.title}</h3>
                                    <p className={styles.conceptDesc}>{concept.description}</p>
                                    <button
                                        style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                        onClick={() => handleSaveConceptToLore(concept)}
                                    >
                                        <Save size={14} /> Save to {isNonFicProject ? 'Knowledge Base' : 'Lore Bible'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* What-If Engine */}
                <section className={styles.whatIfSection}>
                    <h2 className={styles.sectionTitle}>
                        <BrainCircuit className={styles.icon} size={22} />
                        The What-If Engine
                    </h2>

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
