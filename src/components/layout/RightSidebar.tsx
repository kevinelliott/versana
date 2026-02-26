'use client';

import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Send, ChevronDown, ChevronRight, ChevronLeft, Wand2, Zap, Eye, MessageSquare, Wind, Scissors, AlertTriangle, Library, CheckCircle2 } from 'lucide-react';
import { usePhase } from '@/context/PhaseContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './RightSidebar.module.css';

export default function RightSidebar() {
    const { activePhase } = usePhase();
    const [isContextOpen, setIsContextOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false); // Collapsed by default to save space

    const { activeWorkspace, setIsPreviewing, setPreviewContent, selectedText, isRightSidebarOpen, setIsRightSidebarOpen, isFocusMode, aiChatInitialPrompt, setAiChatInitialPrompt } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    // Remove dummy data and use dynamic state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [toggles, setToggles] = useState<any[]>([]);

    useEffect(() => {
        if (!activeWorkspace) return;
        const fetchLore = async () => {
            try {
                const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setToggles(data.map((l: any) => ({
                    id: l.id,
                    label: l.name,
                    active: true, // all active by default
                    type: l.type.toLowerCase().replace(/[^a-z0-9]/g, ''),
                    synopsis: l.synopsis
                })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchLore();
    }, [activeWorkspace]);

    const [beatsText, setBeatsText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Auto trigger chat if prompt sent from Workspace
    useEffect(() => {
        if (aiChatInitialPrompt) {
            setIsChatOpen(true);
            setIsRightSidebarOpen(true);
            handleChatSubmit(undefined, aiChatInitialPrompt);
            setAiChatInitialPrompt(null); // clear it after acting
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiChatInitialPrompt]);

    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        if (isChatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isChatOpen]);

    const handleChatSubmit = async (e?: React.FormEvent, initialPromptOverride?: string) => {
        e?.preventDefault();
        const userMsg = initialPromptOverride || chatInput;
        if (!userMsg.trim() || isChatting || !activeWorkspace) return;

        setIsChatting(true);
        if (!initialPromptOverride) {
            setChatInput('');
        }

        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        const activeLoreStr = toggles
            .filter(t => t.active)
            .map(t => `${t.label} (${t.type}): ${t.synopsis}`)
            .join('\n');

        // Provide the currently selected items in the active matrix without dumping everything,
        // thus optimizing token counts and inspecting content logically.
        const systemPrompt = isNonFicProject
            ? `You are an elite business editor assisting the user. Answer their questions directly. You have access to the following selected Knowledge Base contexts. Only use this context if relevant:\n\n${activeLoreStr}`
            : `You are an elite fiction co-author assisting the user. Answer their questions directly. You have access to the following selected Context Matrix elements (Lore Bible). Only use this context if relevant:\n\n${activeLoreStr}`;

        try {
            const apiMessages = chatMessages.map(m => ({ role: m.role, content: m.content }));
            apiMessages.push({ role: 'user', content: userMsg });

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: apiMessages
                })
            });

            if (!res.body) throw new Error('No body');

            setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setChatMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1].content += chunk;
                    return newArr;
                });
            }
        } catch (err) {
            console.error("Chat Error:", err);
        } finally {
            setIsChatting(false);
        }
    };



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
            const contextText = loreData.map((e: { name: string, type: string, synopsis: string }) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');

            const systemPrompt = isNonFicProject
                ? `You are an elite business editor and domain expert. You are provided with a 'Knowledge Base' and a series of outline points. Convert the outline points into a clear, professional section draft. Do not include markdown formatting or pleasantries, just output the text paragraph by paragraph.\n\nKNOWLEDGE BASE:\n${contextText}`
                : `You are a master fiction author. You are provided with a 'Context Matrix' (Lore Bible) and a series of plot beats. Convert the plot beats into a dramatic, well-written prose scene. Show, don't tell. Do not include markdown formatting or pleasantries, just output the prose paragraph by paragraph.\n\nCONTEXT MATRIX:\n${contextText}`;

            const userPrompt = isNonFicProject
                ? `Draft a section based on these outline points:\n${beatsText}`
                : `Write a scene based on these beats:\n${beatsText}`;

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: userPrompt }]
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
            case 'expand': actionPrompt = isNonFicProject ? 'Expand on the following draft text, providing more context, examples, and depth. Do not change the core narrative events.' : 'Expand on the following draft text, providing more sensory details, setting the scene, and adding descriptive depth. Do not change the core narrative events.'; break;
            case 'dialogue': actionPrompt = isNonFicProject ? 'Revise the following text to focus heavily on empirical evidence and clear arguments. Reduce fluff and let the data reveal information directly.' : 'Revise the following text to focus heavily on sharp, character-driven dialogue. Reduce exposition and let the characters reveal information through their conversation.'; break;
            case 'tension': actionPrompt = isNonFicProject ? 'Rewrite the following text to increase the persuasiveness, authority, and urgency. Make the argument feel stronger and the data more compelling.' : 'Rewrite the following text to increase the pacing, suspense, and dramatic tension. Make the stakes feel higher and the action more immediate.'; break;
            case 'refine': actionPrompt = 'Refine and polish the following text. Improve the prose, fix any awkward phrasing, enhance the vocabulary gently, and ensure a professional literary tone.'; break;
        }

        try {
            // Give Context Matrix to the AI
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();

            // Format context
            const contextText = loreData.map((e: { name: string, type: string, synopsis: string }) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n');

            const systemPrompt = isNonFicProject
                ? `You are an elite business editor and domain expert. You are provided with a 'Knowledge Base'. Follow the user's specific editorial directive to rewrite their drafted text. Do not include markdown formatting, pleasantries, or explanations. Only output the revised text paragraph by paragraph.\n\nKNOWLEDGE BASE:\n${contextText}`
                : `You are a master fiction author and elite editor. You are provided with a 'Context Matrix' (Lore Bible). Follow the user's specific editorial directive to rewrite their drafted text. Do not include markdown formatting, pleasantries, or explanations. Only output the revised prose paragraph by paragraph.\n\nCONTEXT MATRIX:\n${contextText}`;

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

    if (isFocusMode) return null;

    return (
        <aside className={`${styles.sidebarWrapper} ${!isRightSidebarOpen ? styles.collapsed : ''}`}>
            <button
                className={styles.sidebarToggleBtn}
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                title="Toggle Right Sidebar"
            >
                {isRightSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <div className={styles.sidebarContent}>
                {/* Global Context Matrix Accordion */}
                <div className={styles.contextMatrix}>
                    <div
                        className={styles.accordionHeader}
                        onClick={() => setIsContextOpen(!isContextOpen)}
                    >
                        <div className={styles.headerTitle}>
                            <Sparkles size={16} className={styles.headerIcon} />
                            {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}
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
                <div className={`${styles.aiCopilot} ${isChatOpen ? styles.expanded : ''}`}>
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
                                {chatMessages.length === 0 && (
                                    <div className={styles.aiMessage}>
                                        {isNonFicProject ? 'Hello! I am your AI Co-Pilot. We have selected Knowledge Base context loaded into memory. How can I help?' : 'Hello! I am your AI Co-Pilot. I have your selected Context Matrix loaded into my active memory. How can I help?'}
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                                        {msg.content}
                                    </div>
                                ))}
                                {isChatting && <div className={styles.aiMessage}><em>Thinking...</em></div>}
                                <div ref={chatEndRef} />
                            </div>
                            <form className={styles.chatInputContainer} onSubmit={handleChatSubmit} style={{ margin: 0 }}>
                                <input
                                    type="text"
                                    placeholder={isNonFicProject ? 'Ask about your concepts...' : 'Ask about your lore...'}
                                    className={styles.chatInput}
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={isChatting}
                                />
                                <button type="submit" className={styles.sendButton} disabled={isChatting || !chatInput.trim()}>
                                    <Send size={14} />
                                </button>
                            </form>
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
                                <Wind size={16} color="var(--tag-blue-text)" /> {isNonFicProject ? 'Context Expander' : 'Sensory Synthesizer'}
                            </h3>
                            <p className={styles.panelDesc}>
                                {isNonFicProject ? 'Generate historical context or data elaborations based on your current knowledge base.' : 'Generate atmospheric descriptions based on current workspace lore.'}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <select className={styles.chatInput} defaultValue={isNonFicProject ? "history" : "smell"}>
                                    {isNonFicProject ? (
                                        <>
                                            <option value="history">Historical Context</option>
                                            <option value="data">Data Elaboration</option>
                                            <option value="counter">Counter-Argument Synthesis</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="smell">Olfactory (Smell)</option>
                                            <option value="sound">Auditory (Sound)</option>
                                            <option value="sight">Visual (Lighting/Architecture)</option>
                                            <option value="touch">Tactile (Temperature/Texture)</option>
                                        </>
                                    )}
                                </select>
                                <select className={styles.chatInput} defaultValue={isNonFicProject ? "trends" : "xol"}>
                                    {isNonFicProject ? (
                                        <>
                                            <option value="trends">Topic: Market Trends</option>
                                            <option value="competition">Topic: Competitive Landscape</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="xol">Setting: Xol Colony</option>
                                            <option value="ship">Setting: The Frigate</option>
                                            <option value="capitol">Setting: Hegemony Capitol</option>
                                        </>
                                    )}
                                </select>
                                <button className={styles.actionBtn}>
                                    {isNonFicProject ? 'Generate Synthesis' : 'Generate Description'}
                                </button>
                            </div>
                        </div>

                        {/* Logic Auditor */}
                        <div className={styles.toolPanel}>
                            <h3 className={styles.panelTitle}>
                                <AlertTriangle size={16} color="var(--accent-terracotta)" /> Fact-Checker
                            </h3>
                            <p className={styles.panelDesc}>
                                {isNonFicProject ? 'Run an AI audit against your outline to check for logical leaps or missing data.' : 'Run an AI audit against your Chapter 1 outline to check for logical or historical timeline gaps.'}
                            </p>
                            <button className={styles.actionBtn} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>
                                {isNonFicProject ? 'Run Argument Audit' : 'Run Logic Audit'}
                            </button>
                        </div>

                        {/* Lore Integrations */}
                        <div className={styles.toolPanel} style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                            <h3 className={styles.panelTitle} style={{ fontSize: '0.9rem' }}>
                                <Library size={16} /> {isNonFicProject ? 'Saved References' : 'Saved Lore Entities'}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--tag-green-text)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle2 size={14} /> {isNonFicProject ? 'Market Principles' : 'Newtonian Physics'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--tag-green-text)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle2 size={14} /> {isNonFicProject ? 'Growth Metrics' : 'FTL Travel'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activePhase === '4' && (
                    <div className={styles.phaseToolsContainer}>
                        <h2 className={styles.phaseToolsHeader}>{isNonFicProject ? 'Section Tools' : 'Chapter Tools'}</h2>

                        {/* Beat-to-Scene Generator */}
                        <div className={styles.toolPanel}>
                            <h3 className={styles.panelTitle}>
                                <Sparkles size={16} color="var(--tag-purple-text)" /> {isNonFicProject ? 'Point-to-Section' : 'Beat-to-Scene'}
                            </h3>
                            <p className={styles.panelDesc}>
                                {isNonFicProject ? 'Paste your outline points here. Versana will generate a draft using your Knowledge Base.' : 'Paste your outline beats here. Versana will generate a prose draft using your Context Matrix.'}
                            </p>
                            <textarea
                                className={styles.beatBox}
                                placeholder={isNonFicProject ? "- State the primary thesis...\n- Provide case study...\n- Conclude findings." : "- Aris takes cover...\n- Mira overrides the lock...\n- Mechs break through."}
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
                                    <MessageSquare size={14} color="var(--text-secondary)" /> {isNonFicProject ? 'Evidence' : 'Dialogue'}
                                </button>
                                <button
                                    className={styles.pilotBtn}
                                    onClick={() => handleCopilot('tension')}
                                    disabled={isGenerating || !selectedText.trim()}
                                    style={(!selectedText.trim() || isGenerating) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    <Wind size={14} color="var(--text-secondary)" /> {isNonFicProject ? 'Urgency' : 'Tension'}
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
            </div>
        </aside>
    );
}
