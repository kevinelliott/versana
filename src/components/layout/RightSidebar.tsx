'use client';

import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Send, ChevronDown, ChevronRight, ChevronLeft, Wand2, Zap, Eye, MessageSquare, Wind, Scissors, AlertTriangle, Library, CheckCircle2, Maximize2 } from 'lucide-react';
import { usePhase } from '@/context/PhaseContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './RightSidebar.module.css';

export default function RightSidebar() {
    const { activePhase } = usePhase();
    const [isContextOpen, setIsContextOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false); // Collapsed by default to save space

    const { activeWorkspace, setIsPreviewing, setPreviewContent, selectedText, isRightSidebarOpen, setIsRightSidebarOpen, isFocusMode, aiChatInitialPrompt, setAiChatInitialPrompt, isContextMatrixDetached, setIsContextMatrixDetached, contextToggles: toggles, setContextToggles: setToggles } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;


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

    // Fact Checker state
    const [isFactChecking, setIsFactChecking] = useState(false);
    const [factCheckResults, setFactCheckResults] = useState<{ title: string; status: string; explanation: string }[] | null>(null);

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

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to connect to AI server';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('⚠️ System Notification: No response body');

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
        } catch (err: unknown) {
            console.error("Chat Error:", err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: (err as Error).message || "⚠️ System Notification: An unexpected error occurred." }]);
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

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate scene';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('⚠️ System Notification: No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }

        } catch (err: unknown) {
            console.error("Generation failed:", err);
            setPreviewContent((err as Error).message || "⚠️ System Notification: An error occurred during generation.");
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

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to run Copilot';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('⚠️ System Notification: No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setPreviewContent(prev => prev + chunk);
            }

        } catch (err: unknown) {
            console.error("Co-Pilot failed:", err);
            setPreviewContent((err as Error).message || "⚠️ System Notification: An error occurred during generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFactCheck = async (checkType: 'logic' | 'physics') => {
        if (!activeWorkspace || isFactChecking) return;

        setIsFactChecking(true);
        setFactCheckResults(null);

        try {
            const activeLore = toggles.filter(t => t.active).map(t => ({
                name: t.label,
                type: t.type,
                synopsis: t.synopsis
            }));

            const res = await fetch('/api/ai/fact-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lore: activeLore,
                    checkType
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to run fact check';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            if (data.findings) {
                setFactCheckResults(data.findings);
            } else {
                setFactCheckResults([]);
            }

        } catch (err: unknown) {
            console.error("Fact-check failed:", err);
            alert((err as Error).message || "⚠️ System Notification: An error occurred during fact check.");
        } finally {
            setIsFactChecking(false);
        }
    };


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
                {!isContextMatrixDetached && (
                    <div className={styles.contextMatrix}>
                        <div
                            className={styles.accordionHeader}
                        >
                            <div className={styles.headerTitle} onClick={() => setIsContextOpen(!isContextOpen)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={16} className={styles.headerIcon} />
                                {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsContextMatrixDetached(true);
                                    }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                                    title="Detach Context Matrix"
                                >
                                    <Maximize2 size={14} />
                                </button>
                                <span className={styles.badge}>{toggles.filter(t => t.active).length} Active</span>
                                <div onClick={() => setIsContextOpen(!isContextOpen)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    {isContextOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
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
                )}

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
                                    <div className={styles.aiMessage} style={{ 
                                        background: 'var(--tag-purple-bg)', 
                                        color: 'var(--text-primary)', 
                                        border: '1px solid rgba(168, 85, 247, 0.4)', 
                                        boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        padding: '1rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tag-purple-text)', fontWeight: 600 }}>
                                            <Sparkles size={16} /> Versana Co-Pilot
                                        </div>
                                        <div style={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                                            {isNonFicProject ? 'Hello! I am your AI Co-Pilot. I have your selected Knowledge Base context loaded into active memory. Ask me anything to get started.' : 'Hello! I am your AI Co-Pilot. I have your selected Context Matrix loaded into my active memory. Ask me anything to get started.'}
                                        </div>
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
                                {isNonFicProject ? 'Run an AI audit against your active knowledge base attributes to check for logical leaps or missing data.' : 'Run an AI audit against your active Context Matrix selections to check for logical or historical timeline gaps.'}
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <button
                                    className={styles.actionBtn}
                                    style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
                                    onClick={() => handleFactCheck('logic')}
                                    disabled={isFactChecking}
                                >
                                    {isFactChecking ? 'Auditing...' : (isNonFicProject ? 'Argument Audit' : 'Logic Audit')}
                                </button>
                                {!isNonFicProject && (
                                    <button
                                        className={styles.actionBtn}
                                        style={{ flex: 1, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
                                        onClick={() => handleFactCheck('physics')}
                                        disabled={isFactChecking}
                                    >
                                        {isFactChecking ? 'Auditing...' : 'Physics Audit'}
                                    </button>
                                )}
                            </div>

                            {factCheckResults && factCheckResults.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Audit Findings</h4>
                                    {factCheckResults.map((finding, idx) => (
                                        <div key={idx} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{finding.title}</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    padding: '0.2rem 0.4rem',
                                                    borderRadius: '4px',
                                                    background: finding.status === 'VERIFIED' ? 'var(--tag-green-bg)' : finding.status === 'FLAGGED' ? 'var(--tag-red-bg)' : 'var(--tag-orange-bg)',
                                                    color: finding.status === 'VERIFIED' ? 'var(--tag-green-text)' : finding.status === 'FLAGGED' ? 'var(--tag-red-text)' : 'var(--tag-orange-text)'
                                                }}>
                                                    {finding.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                                {finding.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {factCheckResults && factCheckResults.length === 0 && (
                                <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--tag-green-bg)', color: 'var(--tag-green-text)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    No issues found! Your active context appears logically sound.
                                </div>
                            )}
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
