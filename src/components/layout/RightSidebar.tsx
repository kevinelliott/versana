'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Send, ChevronDown, ChevronRight, Wand2, Zap, Eye, MessageSquare, Wind, Scissors, AlertTriangle, Library, CheckCircle2 } from 'lucide-react';
import { usePhase } from '@/context/PhaseContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './RightSidebar.module.css';

const CONTEXT_ITEMS = [
    { id: '1', label: 'Protagonist Profile', active: true, type: 'character' },
    { id: '2', label: 'Magic System Rules', active: false, type: 'lore' },
    { id: '3', label: '18th Century London', active: true, type: 'place' },
    { id: '4', label: 'Secondary Plotline', active: false, type: 'plot' },
];

export default function RightSidebar() {
    const { activePhase } = usePhase();
    const [toggles, setToggles] = useState(CONTEXT_ITEMS);
    const [isContextOpen, setIsContextOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false); // Collapsed by default to save space

    // AI Generation State
    const { activeWorkspace, setIsPreviewing, setPreviewContent, selectedText } = useWorkspace();
    const [beatsText, setBeatsText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleToggle = (id: string) => {
        setToggles(toggles.map(t => t.id === id ? { ...t, active: !t.active } : t));
    };

    const handleGenerate = async () => {
        if (!activeWorkspace || !beatsText.trim() || isGenerating) return;

        setIsGenerating(true);
        setIsPreviewing(true);
        setPreviewContent(''); // Clear previous

        try {
            // Give Context Matrix to the AI
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();

            // Format context
            const contextText = loreData.map((e: any) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');

            const systemPrompt = `You are a master fiction author. You are provided with a 'Context Matrix' (Lore Bible) and a series of plot beats. Convert the plot beats into a dramatic, well-written prose scene. Show, don't tell. Do not include markdown formatting or pleasantries, just output the prose paragraph by paragraph.

CONTEXT MATRIX:
${contextText}`;

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: `Write a scene based on these beats:\n${beatsText}` }]
                })
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }

        } catch (err) {
            console.error("Generation failed:", err);
            setPreviewContent("An error occurred during generation.");
        } finally {
            setIsGenerating(false);
            setBeatsText('');
        }
    };

    const handleCopilot = async (action: 'expand' | 'dialogue' | 'tension' | 'refine') => {
        if (!activeWorkspace || !selectedText.trim() || isGenerating) return;

        setIsGenerating(true);
        setIsPreviewing(true);
        setPreviewContent(''); // Clear previous

        let actionPrompt = '';
        switch (action) {
            case 'expand': actionPrompt = 'Expand on the following draft text, providing more sensory details, setting the scene, and adding descriptive depth. Do not change the core narrative events.'; break;
            case 'dialogue': actionPrompt = 'Revise the following text to focus heavily on sharp, character-driven dialogue. Reduce exposition and let the characters reveal information through their conversation.'; break;
            case 'tension': actionPrompt = 'Rewrite the following text to increase the pacing, suspense, and dramatic tension. Make the stakes feel higher and the action more immediate.'; break;
            case 'refine': actionPrompt = 'Refine and polish the following text. Improve the prose, fix any awkward phrasing, enhance the vocabulary gently, and ensure a professional literary tone.'; break;
        }

        try {
            // Give Context Matrix to the AI
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();

            // Format context
            const contextText = loreData.map((e: any) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');

            const systemPrompt = `You are a master fiction author and elite editor. You are provided with a 'Context Matrix' (Lore Bible). Follow the user's specific editorial directive to rewrite their drafted text. Do not include markdown formatting, pleasantries, or explanations. Only output the revised prose paragraph by paragraph.

CONTEXT MATRIX:
${contextText}`;

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: `EDITORIAL DIRECTIVE: ${actionPrompt}\n\nORIGINAL TEXT TO REWRITE:\n${selectedText}` }]
                })
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }

        } catch (err) {
            console.error("Co-Pilot failed:", err);
            setPreviewContent("An error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <aside className={styles.sidebar}>
            {/* Global Context Matrix Accordion */}
            <div className={styles.contextMatrix}>
                <div
                    className={styles.accordionHeader}
                    onClick={() => setIsContextOpen(!isContextOpen)}
                >
                    <div className={styles.headerTitle}>
                        <Sparkles size={16} className={styles.headerIcon} />
                        Context Matrix
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={styles.badge}>{toggles.filter(t => t.active).length} Active</span>
                        {isContextOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                </div>

                {isContextOpen && (
                    <div className={styles.accordionContent} style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                        <div className={styles.toggleList}>
                            {toggles.map(item => (
                                <div
                                    key={item.id}
                                    className={`${styles.toggleItem} ${item.active ? styles.active : ''}`}
                                    onClick={() => handleToggle(item.id)}
                                >
                                    <div className={styles.toggleLabel}>
                                        <span className={`${styles.dot} ${styles[item.type]}`} />
                                        {item.label}
                                    </div>
                                    {item.active ? (
                                        <ToggleRight size={18} className={styles.activeIcon} />
                                    ) : (
                                        <ToggleLeft size={18} className={styles.inactiveIcon} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Global AI Co-Pilot Accordion */}
            <div className={styles.aiCopilot}>
                <div
                    className={styles.accordionHeader}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                >
                    <div className={styles.headerTitle}>AI Co-Pilot</div>
                    {isChatOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {isChatOpen && (
                    <div className={styles.accordionContent} style={{ flex: 1, borderBottom: '1px solid var(--border-light)' }}>
                        <div className={styles.chatArea}>
                            <div className={styles.aiMessage}>
                                Hello! I noticed you are writing Chapter 4. I currently have the Protagonist Profile and London setting in my active memory context. How can I help?
                            </div>
                        </div>
                        <div className={styles.chatInputContainer}>
                            <input
                                type="text"
                                placeholder="Ask about your lore..."
                                className={styles.chatInput}
                            />
                            <button className={styles.sendButton}>
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Phase Tool Dispatcher */}
            {activePhase === '3' && (
                <div className={styles.phaseToolsContainer}>
                    <h2 className={styles.phaseToolsHeader}>Research Tools</h2>

                    {/* Sensory Synthesizer */}
                    <div className={styles.toolPanel}>
                        <h3 className={styles.panelTitle}>
                            <Wind size={16} color="var(--tag-blue-text)" /> Sensory Synthesizer
                        </h3>
                        <p className={styles.panelDesc}>
                            Generate atmospheric descriptions based on current workspace lore.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <select className={styles.chatInput} defaultValue="smell">
                                <option value="smell">Olfactory (Smell)</option>
                                <option value="sound">Auditory (Sound)</option>
                                <option value="sight">Visual (Lighting/Architecture)</option>
                                <option value="touch">Tactile (Temperature/Texture)</option>
                            </select>
                            <select className={styles.chatInput} defaultValue="xol">
                                <option value="xol">Setting: Xol Colony</option>
                                <option value="ship">Setting: The Frigate</option>
                                <option value="capitol">Setting: Hegemony Capitol</option>
                            </select>
                            <button className={styles.actionBtn}>
                                Generate Description
                            </button>
                        </div>
                    </div>

                    {/* Logic Auditor */}
                    <div className={styles.toolPanel}>
                        <h3 className={styles.panelTitle}>
                            <AlertTriangle size={16} color="var(--accent-terracotta)" /> Fact-Checker
                        </h3>
                        <p className={styles.panelDesc}>
                            Run an AI audit against your Chapter 1 outline to check for logical or historical timeline gaps.
                        </p>
                        <button className={styles.actionBtn} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>
                            Run Logic Audit
                        </button>
                    </div>

                    {/* Lore Integrations */}
                    <div className={styles.toolPanel} style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                        <h3 className={styles.panelTitle} style={{ fontSize: '0.9rem' }}>
                            <Library size={16} /> Saved Lore Entities
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--tag-green-text)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={14} /> Newtonian Physics
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--tag-green-text)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={14} /> FTL Travel
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activePhase === '4' && (
                <div className={styles.phaseToolsContainer}>
                    <h2 className={styles.phaseToolsHeader}>Chapter Tools</h2>

                    {/* Beat-to-Scene Generator */}
                    <div className={styles.toolPanel}>
                        <h3 className={styles.panelTitle}>
                            <Sparkles size={16} color="var(--tag-purple-text)" /> Beat-to-Scene
                        </h3>
                        <p className={styles.panelDesc}>
                            Paste your outline beats here. Versana will generate a prose draft using your Context Matrix.
                        </p>
                        <textarea
                            className={styles.beatBox}
                            placeholder="- Aris takes cover...&#10;- Mira overrides the lock...&#10;- Mechs break through."
                            value={beatsText}
                            onChange={(e) => setBeatsText(e.target.value)}
                        />
                        <button
                            className={styles.actionBtn}
                            onClick={handleGenerate}
                            disabled={isGenerating || !beatsText.trim()}
                        >
                            <Wand2 size={14} /> {isGenerating ? 'Generating...' : 'Generate'}
                        </button>
                    </div>

                    {/* Editorial Co-Pilot */}
                    <div className={styles.toolPanel}>
                        <h3 className={styles.panelTitle}>
                            <Zap size={16} color="var(--accent-blue)" /> Editorial Copilot
                        </h3>
                        <p className={styles.panelDesc}>
                            Highlight text in the editor to apply quick operations.
                        </p>
                        <div className={styles.pilotGrid}>
                            <button
                                className={styles.pilotBtn}
                                onClick={() => handleCopilot('expand')}
                                disabled={isGenerating || !selectedText.trim()}
                                style={(!selectedText.trim() || isGenerating) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <Eye size={14} color="var(--text-secondary)" /> Expand
                            </button>
                            <button
                                className={styles.pilotBtn}
                                onClick={() => handleCopilot('dialogue')}
                                disabled={isGenerating || !selectedText.trim()}
                                style={(!selectedText.trim() || isGenerating) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <MessageSquare size={14} color="var(--text-secondary)" /> Dialogue
                            </button>
                            <button
                                className={styles.pilotBtn}
                                onClick={() => handleCopilot('tension')}
                                disabled={isGenerating || !selectedText.trim()}
                                style={(!selectedText.trim() || isGenerating) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <Wind size={14} color="var(--text-secondary)" /> Tension
                            </button>
                            <button
                                className={styles.pilotBtn}
                                onClick={() => handleCopilot('refine')}
                                disabled={isGenerating || !selectedText.trim()}
                                style={(!selectedText.trim() || isGenerating) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            >
                                <Scissors size={14} color="var(--text-secondary)" /> Refine
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
