'use client';

import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Send, Loader2 } from 'lucide-react';
import styles from './ConceptIdeation.module.css';

interface Concept {
    id: string;
    title: string;
    description: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
}

export default function ConceptIdeation() {
    // Hooks for Seed Generator
    const [seedPrompt, setSeedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [concepts, setConcepts] = useState<Concept[]>([]);

    // Hooks for What-If Engine
    const [whatIfInput, setWhatIfInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{
        id: 'init',
        role: 'ai',
        content: "I am the What-If Engine. Tell me your basic premise, and I will push the boundaries of your narrative by asking challenging 'What if?' questions."
    }]);

    const handleGenerateConcepts = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seedPrompt) return;

        setIsGenerating(true);
        // Simulate API delay for Vercel AI SDK Claude endpoint
        setTimeout(() => {
            setConcepts([
                {
                    id: '1',
                    title: 'The Silent Starship',
                    description: `A generation ship where the AI has enforced absolute silence to "prevent conflict," leading the crew to develop a complex sign language relying on ambient light reflection.`
                },
                {
                    id: '2',
                    title: 'Echoes of the Void',
                    description: `In a universe where faster-than-light travel requires sacrificing a memory, a renowned pilot begins to realize they are the cause of the war they are fighting so desperately to win.`
                },
                {
                    id: '3',
                    title: 'The Clockwork Rebellion',
                    description: `Automations powered by captured human souls reach sentience when a watchmaker accidentally builds a gear capable of processing paradoxes.`
                }
            ]);
            setIsGenerating(false);
        }, 2000);
    };

    const handleWhatIfSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whatIfInput) return;

        const newUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: whatIfInput };
        setChatHistory(prev => [...prev, newUserMsg]);
        setWhatIfInput('');

        // Simulate streaming response delay
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: `That's a strong start. But **what if** the pilot's sacrificed memories aren't destroyed, but collected by the navigator AI? And **what if** the AI uses those emotional fragments to rewrite the ship's actual destination?`
            };
            setChatHistory(prev => [...prev, aiResponse]);
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 1: Concept & Ideation</h1>
                <p className={styles.subtitle}>Generate core premise ideas and pressure-test them with the What-If Engine.</p>
            </div>

            {/* AI Seed Generator */}
            <section className={styles.seedSection}>
                <h2 className={styles.sectionTitle}>
                    <Sparkles className={styles.icon} size={22} />
                    AI Seed Generator
                </h2>
                <form className={styles.formGroup} onSubmit={handleGenerateConcepts}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. A sci-fi noir about a detective who can taste time..."
                        value={seedPrompt}
                        onChange={(e) => setSeedPrompt(e.target.value)}
                        disabled={isGenerating}
                    />
                    <button type="submit" className={styles.btnPrimary} disabled={!seedPrompt || isGenerating}>
                        {isGenerating ? <Loader2 size={18} className="spin" /> : 'Generate Hooks'}
                    </button>
                </form>

                {concepts.length > 0 && (
                    <div className={styles.resultsGrid}>
                        {concepts.map(concept => (
                            <div key={concept.id} className={styles.conceptCard}>
                                <h3 className={styles.conceptTitle}>{concept.title}</h3>
                                <p className={styles.conceptDesc}>{concept.description}</p>
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
                    {chatHistory.map(msg => (
                        <div key={msg.id} className={`${styles.message} ${msg.role === 'ai' ? styles.aiMessage : styles.userMessage}`}>
                            <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                    ))}
                </div>

                <form className={styles.qaForm} onSubmit={handleWhatIfSubmit}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Type your premise or answer the What-If question..."
                        value={whatIfInput}
                        onChange={(e) => setWhatIfInput(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!whatIfInput}>
                        <Send size={18} />
                    </button>
                </form>
            </section>
        </div>
    );
}
