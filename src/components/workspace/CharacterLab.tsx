'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './CharacterLab.module.css';
import { Users, User, UserCircle, Star, Sparkles, Loader2, Edit3, Target, MessageCircle, Volume2 } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All Profiles', icon: Users, nonFicLabel: 'All Concepts' },
    { id: 'protagonist', label: 'Protagonists', icon: Star, nonFicLabel: 'Core Theses' },
    { id: 'antagonist', label: 'Antagonists', icon: Target, nonFicLabel: 'Counter-Arguments' },
    { id: 'supporting', label: 'Supporting Cast', icon: UserCircle, nonFicLabel: 'Supporting Evidence' }
];

export default function CharacterLab() {
    const { activeWorkspace } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const [activeCategory, setActiveCategory] = useState('all');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [loreItems, setLoreItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiRole, setAiRole] = useState('protagonist');

    const [showEditModal, setShowEditModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editSynopsis, setEditSynopsis] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Interview/Voice Cloning Logic
    const [interviewCharacter, setInterviewCharacter] = useState<any>(null);
    const [interviewInput, setInterviewInput] = useState('');
    const [interviewHistory, setInterviewHistory] = useState<{role: 'user'|'character', content: string, isAudioGenerating?: boolean}[]>([]);
    const [isInterviewLoading, setIsInterviewLoading] = useState(false);
    const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchLore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const fetchLore = async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            if (!res.ok) {
                console.error('Failed to fetch lore. Server returned:', res.status, await res.text());
                return;
            }
            const data = await res.json();
            // Filter to only characters or core concepts
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filtered = data.filter((item: any) => {
                const type = (item.type || '').toLowerCase();
                if (isNonFicProject) {
                    return type.includes('thesis') || type.includes('concept') || type.includes('argument');
                } else {
                    return type.includes('character') || type.includes('protagonist') || type.includes('antagonist') || type.includes('cast');
                }
            });
            setLoreItems(filtered);
        } catch (e) {
            console.error("Failed to fetch character/concept items", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim() || !activeWorkspace) return;
        setIsGenerating(true);
        try {
            let promptContext = '';
            if (isNonFicProject) {
                promptContext = `You are an expert researcher. The user wants to map out a structural concept or argument line: Type: ${aiRole}. Prompt: "${aiPrompt}". Output a highly structured, encyclopedic 2-paragraph profile explaining this concept's role in the manuscript.`;
            } else {
                promptContext = `You are a master character writer. The user wants to generate a character profile: Role: ${aiRole}. Name/Prompt: "${aiPrompt}". Output a deeply psychological, compelling 2-paragraph character profile covering their core drive, fatal flaw, and immediate visual appearance. Do NOT use markdown headers, just plain cohesive paragraphs.`;
            }

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt: promptContext,
                    messages: [{ role: 'user', content: "Generate the profile." }]
                })
            });

            if (!res.ok) throw new Error("API response error");

            let generatedSynopsis = '';
            if (res.body) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    generatedSynopsis += decoder.decode(value, { stream: true });
                }
            }

            let finalType = 'Character';
            if (isNonFicProject) {
                finalType = aiRole === 'protagonist' ? 'Core Thesis' : aiRole === 'antagonist' ? 'Counter-Argument' : 'Supporting Evidence';
            } else {
                finalType = aiRole === 'protagonist' ? 'Protagonist Character' : aiRole === 'antagonist' ? 'Antagonist Character' : 'Supporting Character';
            }

            // Save it to Lore DB
            await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: aiPrompt, // The user's input acts as the name/title
                    type: finalType,
                    synopsis: generatedSynopsis
                })
            });

            setShowAiModal(false);
            setAiPrompt('');
            setAiRole('protagonist');
            await fetchLore();

        } catch (err) {
            console.error("Generation failed:", err);
            alert("Failed to generate. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredItems = activeCategory === 'all'
        ? loreItems
        : loreItems.filter(item => {
            const typeStr = (item.type || '').toLowerCase();
            if (isNonFicProject) {
                if (activeCategory === 'protagonist') return typeStr.includes('thesis');
                if (activeCategory === 'antagonist') return typeStr.includes('counter') || typeStr.includes('antagonist');
                if (activeCategory === 'supporting') return typeStr.includes('support') || typeStr.includes('evidence');
            } else {
                if (activeCategory === 'protagonist') return typeStr.includes('protagonist');
                if (activeCategory === 'antagonist') return typeStr.includes('antagonist') || typeStr.includes('villain');
                if (activeCategory === 'supporting') return typeStr.includes('support') || typeStr.includes('minor');
            }
            return true;
        });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openEditModal = (item: any) => {
        setEditingItem(item);
        setEditName(item.name || '');
        setEditRole(item.type || '');
        setEditSynopsis(item.synopsis || '');
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingItem || !activeWorkspace || !editName.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/lore', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingItem.id,
                    workspaceId: activeWorkspace.id,
                    name: editName,
                    type: editRole,
                    synopsis: editSynopsis
                })
            });
            if (!res.ok) throw new Error("Failed to save changes");
            setShowEditModal(false);
            await fetchLore();
        } catch (err) {
            console.error(err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingItem || !confirm(`Are you sure you want to delete "${editingItem.name}"?`)) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/lore?id=${editingItem.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            setShowEditModal(false);
            await fetchLore();
        } catch (err) {
            console.error(err);
            alert("Failed to delete. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInterviewSend = async () => {
        if (!interviewCharacter || !interviewInput.trim() || !activeWorkspace) return;

        const userText = interviewInput;
        const newHistory: typeof interviewHistory = [...interviewHistory, { role: 'user', content: userText }];
        setInterviewHistory(newHistory);
        setInterviewInput('');
        setIsInterviewLoading(true);

        try {
            // Step 1: Claude Chat (Simulated completion)
            const promptContext = `You are roleplaying as the character described below. Respond to the user IN-CHARACTER based on this profile. Do NOT break character or describe actions via text asterisks unless necessary. Keep responses under 3 sentences for snappy audio delivery.\n\nCharacter Name: ${interviewCharacter.name}\nProfile: ${interviewCharacter.synopsis}`;
            
            const aiMessages = newHistory.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content }));

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt: promptContext,
                    messages: aiMessages
                })
            });

            if (!res.ok) throw new Error("Claude API error");
            
            let charReply = '';
            if (res.body) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    charReply += decoder.decode(value, { stream: true });
                }
            }

            const historyWithReply: typeof interviewHistory = [...newHistory, { role: 'character', content: charReply, isAudioGenerating: true }];
            setInterviewHistory(historyWithReply);

            // Step 2: ElevenLabs Voice Check
            try {
                const audioRes = await fetch('/api/ai/elevenlabs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: charReply.substring(0, 500) }) // Max 500 chars for safety
                });
                
                if (audioRes.ok) {
                    const audioBlob = await audioRes.blob();
                    const url = URL.createObjectURL(audioBlob);
                    const audio = new Audio(url);
                    
                    if (activeAudioObj) {
                        activeAudioObj.pause();
                        activeAudioObj.currentTime = 0;
                    }
                    setActiveAudioObj(audio);
                    audio.play();
                } else {
                    console.warn("ElevenLabs Audio failed", await audioRes.text());
                }
            } catch (e) {
                console.error("Audio block failed", e);
            }

            setInterviewHistory([...newHistory, { role: 'character', content: charReply, isAudioGenerating: false }]);

        } catch (err) {
            console.error("Interview generation failed", err);
            setInterviewHistory([...newHistory, { role: 'character', content: "An error occurred with my voice module." }]);
        } finally {
            setIsInterviewLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isNonFicProject ? 'Conceptual Diagraming' : 'Character Lab'}</h1>
                <p className={styles.subtitle}>{isNonFicProject ? 'Map out your core theses and counter-arguments.' : 'Flesh out character arcs, motivations, and voices.'}</p>
            </div>

            <div className={styles.grid}>
                <div className={styles.sidebar}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.categoryTabActive : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <cat.icon size={16} />
                            {isNonFicProject ? cat.nonFicLabel : cat.label}
                        </button>
                    ))}
                </div>

                <div className={styles.contentArea}>
                    <div className={styles.topBar}>
                        <button className={styles.btnAi} onClick={() => setShowAiModal(true)}>
                            <Sparkles size={16} /> {isNonFicProject ? 'AI Generate Concept' : 'AI Generate Character'}
                        </button>
                    </div>

                    {isLoading ? (
                        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Loader2 size={16} className="spin" /> Loading Profiles...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, color: 'var(--text-primary)' }} />
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{isNonFicProject ? 'No Concepts Mapped' : 'No Characters Mapped'}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                                Use the AI Generator to quickly brainstorm {isNonFicProject ? 'theses and ideas' : 'protagonists, villains, and allies'}, or add them manually to start building out your cast.
                            </p>
                        </div>
                    ) : (
                        <div className={styles.cardGrid}>
                            {filteredItems.map(item => (
                                <div key={item.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>{item.name}</div>
                                        <User size={18} className={styles.cardIcon} color="var(--tag-purple-text)" />
                                    </div>
                                    <div className={styles.cardStatList} style={{ marginTop: '0.5rem' }}>
                                        <div className={styles.cardStat}>
                                            <span className={styles.cardStatLabel}>Role</span>
                                            <span className={styles.cardStatValue}>{item.type || 'Entity'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardDesc}>
                                        {item.synopsis ? (item.synopsis.length > 200 ? item.synopsis.substring(0, 200) + '...' : item.synopsis) : 'No profile description available.'}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button className={styles.actionBtn} style={{ flex: 1 }} onClick={() => openEditModal(item)}>
                                            <Edit3 size={14} /> Edit Profile
                                        </button>
                                        {!isNonFicProject && (
                                            <button 
                                                className={styles.actionBtn} 
                                                style={{ flex: 1, background: 'rgba(79, 70, 229, 0.1)', color: 'var(--tag-purple-text)', border: '1px solid rgba(79, 70, 229, 0.2)' }}
                                                onClick={() => setInterviewCharacter(item)}
                                            >
                                                <Volume2 size={14} /> Voice Chat
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAiModal && (
                <div className={styles.modalOverlay} onClick={() => !isGenerating && setShowAiModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.title} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} color="var(--tag-purple-text)" />
                            {isNonFicProject ? 'Brainstorm Concept' : 'Generate Character Profile'}
                        </h2>
                        
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {isNonFicProject ? 'Concept Role' : 'Character Role'}
                            </label>
                            <select 
                                value={aiRole} 
                                onChange={e => setAiRole(e.target.value)}
                                className={styles.modalInput}
                                style={{ padding: '0.6rem 1rem', marginBottom: 0 }}
                            >
                                <option value="protagonist">{isNonFicProject ? 'Core Thesis' : 'Protagonist'}</option>
                                <option value="antagonist">{isNonFicProject ? 'Counter-Argument' : 'Antagonist'}</option>
                                <option value="supporting">{isNonFicProject ? 'Supporting Evidence' : 'Supporting Cast'}</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                {isNonFicProject ? 'Subject / Working Title' : 'Name & Short Description'}
                            </label>
                            <input
                                type="text"
                                placeholder={isNonFicProject ? "e.g. 'The Fallacy of Infinite Growth'" : "e.g. 'Elara, a rogue AI mechanic with a dark past'"}
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                className={styles.modalInput}
                                style={{ marginBottom: 0 }}
                                autoFocus
                            />
                        </div>

                        <div className={styles.modalBtnGroup}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={() => setShowAiModal(false)}
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.btnAi}
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiPrompt.trim()}
                            >
                                {isGenerating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                                {isGenerating ? 'Drafting...' : 'Generate Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className={styles.modalOverlay} onClick={() => !isSaving && !isDeleting && setShowEditModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.title} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Edit3 size={20} color="var(--tag-purple-text)" />
                            {isNonFicProject ? 'Edit Concept' : 'Edit Character Profile'}
                        </h2>
                        
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Name / Title
                            </label>
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                className={styles.modalInput}
                                style={{ marginBottom: 0 }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Role / Type
                            </label>
                            <input
                                type="text"
                                value={editRole}
                                onChange={e => setEditRole(e.target.value)}
                                className={styles.modalInput}
                                style={{ marginBottom: 0 }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Synopsis / Details
                            </label>
                            <textarea
                                value={editSynopsis}
                                onChange={e => setEditSynopsis(e.target.value)}
                                className={styles.modalInput}
                                style={{ marginBottom: 0, minHeight: '120px', resize: 'vertical' }}
                            />
                        </div>

                        <div className={styles.modalBtnGroup} style={{ justifyContent: 'space-between' }}>
                            <button
                                className={styles.modalCancelBtn}
                                onClick={handleDelete}
                                disabled={isSaving || isDeleting}
                                style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'transparent' }}
                            >
                                {isDeleting ? <Loader2 size={16} className="spin" /> : 'Delete'}
                            </button>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={styles.modalCancelBtn}
                                    onClick={() => setShowEditModal(false)}
                                    disabled={isSaving || isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.btnAi}
                                    onClick={handleSaveEdit}
                                    disabled={isSaving || isDeleting || !editName.trim()}
                                >
                                    {isSaving ? <Loader2 size={16} className="spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {interviewCharacter && (
                <div className={styles.modalOverlay} onClick={() => !isInterviewLoading && setInterviewCharacter(null)}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.title} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                            <Volume2 size={24} color="var(--tag-purple-text)" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>Voice Chat: {interviewCharacter.name}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Powered by Claude 3 & ElevenLabs</span>
                            </div>
                        </h2>
                        
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                            {interviewHistory.length === 0 ? (
                                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                    <p>Start the conversation. They will answer in-character.</p>
                                </div>
                            ) : (
                                interviewHistory.map((msg, idx) => (
                                    <div key={idx} style={{ 
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.role === 'user' ? 'var(--tag-purple-bg)' : 'var(--bg-secondary)',
                                        color: msg.role === 'user' ? 'var(--tag-purple-text)' : 'var(--text-primary)',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        maxWidth: '80%',
                                        border: msg.role === 'character' ? '1px solid var(--border-color)' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {msg.role === 'user' ? 'You' : interviewCharacter.name}
                                        </div>
                                        <div style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{msg.content}</div>
                                        {msg.isAudioGenerating && (
                                            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--tag-blue-text)' }}>
                                                <Loader2 size={12} className="spin" /> Generating voice...
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {isInterviewLoading && interviewHistory[interviewHistory.length - 1]?.role === 'user' && (
                                <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader2 size={14} className="spin" /> {interviewCharacter.name} is typing...
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={interviewInput}
                                onChange={e => setInterviewInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleInterviewSend()}
                                placeholder={`Ask ${interviewCharacter.name} anything...`}
                                className={styles.modalInput}
                                style={{ flex: 1, marginBottom: 0 }}
                                disabled={isInterviewLoading}
                                autoFocus
                            />
                            <button
                                className={styles.btnAi}
                                onClick={handleInterviewSend}
                                disabled={isInterviewLoading || !interviewInput.trim()}
                                style={{ padding: '0 1.5rem' }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
