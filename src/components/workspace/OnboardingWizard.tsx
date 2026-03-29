'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Loader2, PenTool, Database, BookOpen, ChevronRight, Settings, MessageSquare, Send, X } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';
import styles from './OnboardingWizard.module.css';

export default function OnboardingWizard() {
    const { setNeedsOnboarding, setActiveWorkspace } = useWorkspace();
    const { setActivePhase } = usePhase();
    const [step, setStep] = useState<'selection' | 'manual' | 'ai-setup' | 'ai-chat' | 'creative-tuning' | 'generating'>('selection');
    
    // Creative Parameters
    const [chapterLength, setChapterLength] = useState('2000');
    const [storyTone, setStoryTone] = useState('Cinematic & Epic');
    const [pacingArc, setPacingArc] = useState('Balanced');

    // Manual State
    const [obName, setObName] = useState('');
    const [obGenre, setObGenre] = useState('');
    const [isCreatingOb, setIsCreatingOb] = useState(false);

    // AI State
    const [aiGenre, setAiGenre] = useState('Sci-Fi Fantasy');
    const [generationScope, setGenerationScope] = useState('outline'); // 'concept', 'outline', 'chapters', 'book'
    
    // AI Chat State
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{role: 'user'|'ai', content: string, suggestions?: string[]}[]>([
        { 
            role: 'ai', 
            content: "I'm ready to help you build your universe. What's the fundamental core premise or hook of your story?",
            suggestions: ["A sprawling space opera", "A gritty cyberpunk dystopia", "A cozy sci-fi colony builder"]
        }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [genError, setGenError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (step === 'ai-chat') {
            scrollToBottom();
        }
    }, [messages, step, isChatLoading]);

    // HANDLERS
    const handleManualCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingOb(true);
        try {
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: obName, genre: obGenre })
            });
            if (res.ok) {
                const ws = await res.json();
                setActiveWorkspace(ws);
                setNeedsOnboarding(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreatingOb(false);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleDirectSubmit(input);
    };

    const handleDirectSubmit = async (text: string) => {
        if (!text.trim() || isChatLoading) return;

        const userMsg = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsChatLoading(true);

        try {
            const res = await fetch('/api/ai/onboarding-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [...messages, { role: 'user', content: userMsg }].map(m => ({ 
                        role: m.role === 'ai' ? 'assistant' : m.role, 
                        content: m.content 
                    })),
                    genre: aiGenre
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { role: 'ai', content: data.reply, suggestions: data.suggestions }]);
            } else {
                setGenError(data.error || 'Failed to fetch AI response.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleGenerateUniverse = async () => {
        setStep('generating');
        setGenError(null);
        try {
            const res = await fetch('/api/ai/onboarding-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.map(m => ({ 
                        role: m.role === 'ai' ? 'assistant' : m.role, 
                        content: m.content 
                    })),
                    genre: aiGenre,
                    scope: generationScope,
                    creativeParameters: {
                        chapterLength,
                        storyTone,
                        pacingArc
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                setActiveWorkspace(data.workspace);
                setNeedsOnboarding(false);
                setActivePhase('4'); // Transition to editor view
                
                // Trigger auto draft via custom event if scope demands it
                if (generationScope === 'chapters' || generationScope === 'book') {
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('VERSANA_AUTO_DRAFT'));
                    }, 500); // Give phase 4 half a second to mount
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                setGenError(errData.error || 'The AI failed to generate the universe. Please try again or reduce the scope.');
                setStep('ai-chat');
            }
        } catch (err) {
            console.error(err);
            setGenError('A network error occurred while generating the universe.');
            setStep('ai-chat');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.container} style={{ position: 'relative' }}>
                <button 
                    onClick={() => setNeedsOnboarding(false)} 
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                {step === 'selection' && (
                    <div className={styles.selectionView}>
                        <h2 className={styles.title}>Welcome to Versana</h2>
                        <p className={styles.subtitle}>How would you like to build your first universe?</p>
                        
                        <div className={styles.cardsGrid}>
                            <button className={styles.pathCard} onClick={() => setStep('ai-setup')}>
                                <div className={styles.cardIconBox} style={{ background: 'var(--tag-purple-bg)' }}>
                                    <Sparkles size={28} color="var(--tag-purple-text)" />
                                </div>
                                <h3>Interactive AI Setup</h3>
                                <p>I'll interview you about your ideas, then automatically generate your worldbuilding matrix and first chapter.</p>
                                <div className={styles.cardAction}>Start Wizard <ArrowRight size={16}/></div>
                            </button>

                            <button className={styles.pathCard} onClick={() => setStep('manual')}>
                                <div className={styles.cardIconBox} style={{ background: 'var(--tag-blue-bg)' }}>
                                    <PenTool size={28} color="var(--tag-blue-text)" />
                                </div>
                                <h3>Manual Control</h3>
                                <p>Skip to an empty workspace. Start at Phase 1 and follow the 8-phase Versana Method to build your book manually.</p>
                                <div className={styles.cardAction}>Skip to empty workspace (Phase 1) <ChevronRight size={16}/></div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'manual' && (
                    <div className={styles.manualView}>
                        <div className={styles.manualHeader}>
                            <div className={styles.iconBadge} style={{ background: 'var(--tag-blue-bg)' }}>
                                <PenTool size={24} color="var(--tag-blue-text)" />
                            </div>
                            <h2 className={styles.title}>Manual Initialization</h2>
                            <p className={styles.subtitle}>Provide a name and genre to spawn an integrated workspace.</p>
                        </div>
                        <form onSubmit={handleManualCreate} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Project Name</label>
                                <input 
                                    type="text" 
                                    value={obName} 
                                    onChange={e => setObName(e.target.value)}
                                    placeholder="The Obsidian Crown" 
                                    required autoFocus
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Primary Genre</label>
                                <input 
                                    type="text" 
                                    value={obGenre} 
                                    onChange={e => setObGenre(e.target.value)}
                                    placeholder="Sci-Fi Fantasy, Romance, etc." 
                                    required
                                />
                            </div>
                            <button type="submit" disabled={isCreatingOb || !obName || !obGenre} className={styles.submitBtn}>
                                {isCreatingOb ? <Loader2 size={18} className={styles.spin} /> : null}
                                Create Empty Workspace <ArrowRight size={18} />
                            </button>
                            <button type="button" className={styles.backBtn} onClick={() => setStep('selection')}>
                                Go Back
                            </button>
                        </form>
                    </div>
                )}

                {step === 'ai-setup' && (
                    <div className={styles.aiSetupView}>
                        <div className={styles.manualHeader}>
                            <div className={styles.iconBadge} style={{ background: 'var(--tag-purple-bg)' }}>
                                <Settings size={24} color="var(--tag-purple-text)" />
                            </div>
                            <h2 className={styles.title}>Setup Preferences</h2>
                            <p className={styles.subtitle}>Let's set the parameters for your universe generation.</p>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>What is your primary genre?</label>
                                <select value={aiGenre} onChange={e => setAiGenre(e.target.value)}>
                                    <option>Sci-Fi / Space Opera</option>
                                    <option>High Fantasy</option>
                                    <option>Urban Fantasy</option>
                                    <option>Romance</option>
                                    <option>Thriller / Mystery</option>
                                    <option>Horror</option>
                                    <option>Non-Fiction</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Generation Scope</label>
                                <p className={styles.helpText}>How much content should the AI generate after our interview?</p>
                                <div className={styles.radioGroup}>
                                    <label className={generationScope === 'concept' ? styles.radioSelected : ''}>
                                        <input type="radio" name="scope" value="concept" checked={generationScope === 'concept'} onChange={e => setGenerationScope(e.target.value)} />
                                        <strong>Just the Core Concept</strong>
                                        <span>Generates Workspace + 3 essential Lore items.</span>
                                    </label>
                                    <label className={generationScope === 'outline' ? styles.radioSelected : ''}>
                                        <input type="radio" name="scope" value="outline" checked={generationScope === 'outline'} onChange={e => setGenerationScope(e.target.value)} />
                                        <strong>A Detailed Outline & Lore</strong>
                                        <span>Generates 10+ Lore items + Full Chapter Breakdown.</span>
                                    </label>
                                    <label className={generationScope === 'chapters' ? styles.radioSelected : ''}>
                                        <input type="radio" name="scope" value="chapters" checked={generationScope === 'chapters'} onChange={e => setGenerationScope(e.target.value)} />
                                        <strong>The First Few Chapters</strong>
                                        <span>Generates Lore + Outline, then auto-drafts the first 3 chapters.</span>
                                    </label>
                                    <label className={generationScope === 'book' ? styles.radioSelected : ''}>
                                        <input type="radio" name="scope" value="book" checked={generationScope === 'book'} onChange={e => setGenerationScope(e.target.value)} />
                                        <strong>Generate Entire Book!</strong>
                                        <span>Generates everything + drafts all chapters. (Takes a few minutes)</span>
                                    </label>
                                </div>
                            </div>

                            <button onClick={() => setStep('ai-chat')} className={styles.submitBtn} style={{ background: 'var(--tag-purple-text)' }}>
                                Begin Interview <MessageSquare size={18} style={{ marginLeft: '0.5rem' }}/>
                            </button>
                            <button className={styles.backBtn} onClick={() => setStep('selection')}>Go Back</button>
                        </div>
                    </div>
                )}

                {step === 'ai-chat' && (
                    <div className={styles.aiChatView}>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatTitle}>
                                <Sparkles size={18} color="var(--tag-purple-text)" />
                                Story Architect Interview
                            </div>
                            <div className={styles.chatActions} style={{ marginLeft: '1rem' }}>
                                {messages.length >= 5 && (
                                    <button className={styles.generateBtn} onClick={() => setStep('creative-tuning')}>
                                        <Settings size={14} /> Configure Book Layout
                                    </button>
                                )}
                            </div>
                        </div>

                        {genError && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-danger, #ef4444)', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem', display: 'flex', justifyContent: 'center' }}>
                                {genError}
                            </div>
                        )}

                        <div className={styles.chatArea}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={styles.messageGroup}>
                                    <div className={msg.role === 'ai' ? styles.aiMessage : styles.userMessage}>
                                        {msg.role === 'ai' && <div className={styles.aiAvatar}><Sparkles size={14}/></div>}
                                        <div className={styles.messageBubble}>
                                            {msg.content}
                                        </div>
                                    </div>
                                    {msg.role === 'ai' && msg.suggestions && idx === messages.length - 1 && !isChatLoading && (
                                        <div className={styles.suggestionsWrapper}>
                                            {msg.suggestions.map((sug, sIdx) => (
                                                <button 
                                                    key={sIdx} 
                                                    className={styles.suggestionPill}
                                                    onClick={() => {
                                                        setInput(sug);
                                                        // We can't immediately call handleChatSubmit here easily without an event,
                                                        // so let's just trigger submit manually:
                                                        handleDirectSubmit(sug);
                                                    }}
                                                >
                                                    {sug}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className={styles.aiMessage}>
                                    <div className={styles.aiAvatar}><Sparkles size={14}/></div>
                                    <div className={styles.messageBubble}>
                                        <div className={styles.typingIndicator}>
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleChatSubmit} className={styles.chatInputBox}>
                            <input 
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type your answer here..."
                                disabled={isChatLoading}
                                autoFocus
                            />
                            <button type="submit" disabled={isChatLoading || !input.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {step === 'creative-tuning' && (
                    <div className={styles.aiSetupView}>
                        <div className={styles.manualHeader}>
                            <div className={styles.iconBadge} style={{ background: 'var(--tag-blue-bg)' }}>
                                <BookOpen size={24} color="var(--tag-blue-text)" />
                            </div>
                            <h2 className={styles.title}>Creative Tuning</h2>
                            <p className={styles.subtitle}>Define the structural and tonal parameters for your manuscript generation.</p>
                        </div>

                        <div className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Target Chapter Length</label>
                                <select value={chapterLength} onChange={e => setChapterLength(e.target.value)}>
                                    <option value="1000">Short (~1000 words)</option>
                                    <option value="2000">Standard (~2000 words)</option>
                                    <option value="3500">Epic (~3500 words)</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Narrative Tone & Voice</label>
                                <select value={storyTone} onChange={e => setStoryTone(e.target.value)}>
                                    <option>Cinematic & Epic</option>
                                    <option>Dark & Gritty</option>
                                    <option>Lighthearted & Humorous</option>
                                    <option>Philosophical & Reflective</option>
                                    <option>Fast-paced Action Thriller</option>
                                    <option>Romantic & Emotional</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Story Arc Focus</label>
                                <select value={pacingArc} onChange={e => setPacingArc(e.target.value)}>
                                    <option>Balanced (Plot & Character)</option>
                                    <option>Deeply Character-Driven</option>
                                    <option>Heavy World-Building & Lore</option>
                                    <option>High-Octane Plot-Driven</option>
                                </select>
                            </div>

                            <div className={styles.estimatorBox}>
                                <h4>Manuscript Estimator</h4>
                                <p>Based on a standard 15-chapter scaffolding structure.</p>
                                <div className={styles.estimatorStats}>
                                    <div className={styles.statColumn}>
                                        <strong>{parseInt(chapterLength.replace(/\D/g, '') || '2000', 10) * 15}</strong>
                                        <span>Total Words</span>
                                    </div>
                                    <div className={styles.statColumn}>
                                        <strong>{Math.round((parseInt(chapterLength.replace(/\D/g, '') || '2000', 10) * 15) / 250)}</strong>
                                        <span>Total Pages</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleGenerateUniverse} className={styles.submitBtn} style={{ background: 'var(--tag-purple-text)' }}>
                                Execute Final Generation <Database size={18} className={styles.pulse} style={{ marginLeft: '0.5rem' }}/>
                            </button>
                            <button className={styles.backBtn} onClick={() => setStep('ai-chat')}>Return to Interview</button>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className={styles.generatingView}>
                        <div className={styles.generatingIconBox}>
                            <Database size={48} color="var(--tag-purple-text)" className={styles.pulse} />
                        </div>
                        <h2 className={styles.title}>Constructing your Universe...</h2>
                        <ul className={styles.genList}>
                            <li>Analyzing core concepts and genre tropes...</li>
                            <li>Weaving character arcs and settings...</li>
                            <li>{generationScope === 'book' ? 'Drafting all chapters automatically...' : 'Generating the foundational matrix...'}</li>
                        </ul>
                        <div className={styles.loadingBar} />
                    </div>
                )}
            </div>
        </div>
    );
}
