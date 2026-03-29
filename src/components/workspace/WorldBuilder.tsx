'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './WorldBuilder.module.css';
import { Map, Landmark, Crown, Building2, Sparkles, Plus, Loader2 } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All World Elements', icon: Map, nonFicLabel: 'All Domains' },
    { id: 'geography', label: 'Geography & Regions', icon: Map, nonFicLabel: 'Locations & Markets' },
    { id: 'politics', label: 'Politics & Factions', icon: Crown, nonFicLabel: 'Organizations & Entities' },
    { id: 'economy', label: 'Economies & Trade', icon: Building2, nonFicLabel: 'Economic & Trade Factors' },
    { id: 'culture', label: 'Culture & Religion', icon: Landmark, nonFicLabel: 'Cultural Context' }
];

export default function WorldBuilder() {
    const { activeWorkspace } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const [activeCategory, setActiveCategory] = useState('all');
    const [loreItems, setLoreItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        fetchLore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeWorkspace]);

    const fetchLore = async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const data = await res.json();
            // Filter to only places, factions, or specific worldbuilding terms
            const filtered = data.filter((item: any) => {
                const type = (item.type || '').toLowerCase();
                return type.includes('place') || type.includes('setting') || type.includes('faction') || type.includes('organization') || type.includes('concept') || type.includes('system');
            });
            setLoreItems(filtered);
        } catch (e) {
            console.error("Failed to fetch world items", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim() || !activeWorkspace) return;
        setIsGenerating(true);
        try {
            const promptContext = isNonFicProject
                ? `You are an expert researcher. The user wants to generate an organizational, geographic, or economic domain profile: "${aiPrompt}". Output a structured paragraph that acts as a synopsis or reference guide.`
                : `You are a master worldbuilder. The user wants to generate a new faction, setting, or cultural element: "${aiPrompt}". Output a highly detailed, immersive 2-paragraph description suitable for a Story Bible.`;

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt: promptContext,
                    messages: [{ role: 'user', content: "Generate the synopsis." }]
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

            // Save it to Lore DB
            await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: aiPrompt,
                    type: isNonFicProject ? 'Domain / Entity' : 'World Element',
                    synopsis: generatedSynopsis
                })
            });

            setShowAiModal(false);
            setAiPrompt('');
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
            // Naive mapping, obviously an actual app would let users tag explicit categories
            if (activeCategory === 'geography') return typeStr.includes('place') || typeStr.includes('setting');
            if (activeCategory === 'politics') return typeStr.includes('faction') || typeStr.includes('organization') || typeStr.includes('empire') || typeStr.includes('kingdom');
            if (activeCategory === 'economy') return typeStr.includes('economy') || typeStr.includes('corporation') || typeStr.includes('guild');
            if (activeCategory === 'culture') return typeStr.includes('culture') || typeStr.includes('religion') || typeStr.includes('concept') || typeStr.includes('magic');
            return true;
        });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isNonFicProject ? 'Conceptual Mapping & Sectors' : 'World & Places Builder'}</h1>
                <p className={styles.subtitle}>{isNonFicProject ? 'Map specific macro domains, organizations, and ecosystems.' : 'Map factions, economies, settings, and cultures to establish deep worldbuilding.'}</p>
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
                            <Sparkles size={16} /> AI Generate Element
                        </button>
                    </div>

                    {isLoading ? (
                        <div style={{ color: 'var(--text-secondary)' }}>Loading Elements...</div>
                    ) : filteredItems.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                            <Map size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No elements found for this category.</p>
                        </div>
                    ) : (
                        <div className={styles.cardGrid}>
                            {filteredItems.map(item => (
                                <div key={item.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardTitle}>{item.name}</div>
                                        <Building2 size={16} className={styles.cardIcon} />
                                    </div>
                                    <div className={styles.cardStatList}>
                                        <div className={styles.cardStat}>
                                            <span className={styles.cardStatLabel}>Type</span>
                                            <span className={styles.cardStatValue}>{item.type || 'Entity'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.cardDesc}>
                                        {item.synopsis ? (item.synopsis.length > 150 ? item.synopsis.substring(0, 150) + '...' : item.synopsis) : 'No description provided.'}
                                    </div>
                                    <button className={styles.actionBtn}>
                                        Edit Details
                                    </button>
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
                            {isNonFicProject ? 'Synthesize Domain Concept' : 'Generate World Element'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {isNonFicProject ? "Provide a topic, organization type, or economic system. The AI will synthesize an expertly written brief." : "What kind of faction, kingdom, or magic system do you want to create? Be as specific or sparse as you'd like."}
                        </p>
                        <input
                            type="text"
                            placeholder={isNonFicProject ? "e.g. 'The structure of standard Tech Conglomerates in the 1990s'" : "e.g. 'A shadowy guild of assassins ruling the lower wards of Neo-Tokyo'"}
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                marginBottom: '1.5rem',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                className={styles.actionBtn}
                                style={{ border: 'none' }}
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
                                {isGenerating ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                                {isGenerating ? 'Synthesizing...' : 'Generate AI Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
