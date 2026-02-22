'use client';

import React, { useState } from 'react';
import { Search, Globe, Library, PlusCircle, CheckCircle2, AlertTriangle, Wind } from 'lucide-react';
import styles from './ResearchAssistant.module.css';

export default function ResearchAssistant() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        // Simulate API call to Tavily/Perplexity
        setTimeout(() => {
            setIsSearching(false);
            setHasSearched(true);
        }, 1200);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 3: Research Assistant</h1>
                <p className={styles.subtitle}>Query the real world and synthesize sensory details direct to your Story Bible.</p>
            </div>

            <div className={styles.grid}>
                {/* Main Search Panel */}
                <div className={styles.mainPanel}>
                    <div className={styles.searchHeader}>
                        <form onSubmit={handleSearch} className={styles.searchBox}>
                            <Search size={20} color="var(--text-secondary)" />
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search the web (e.g. 'What materials withstand re-entry heat?')"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" style={{ display: 'none' }}>Search</button>
                        </form>
                    </div>

                    <div className={styles.resultsList}>
                        {!hasSearched && !isSearching ? (
                            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                                <Globe size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                <p>Powered by Tavily API</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Ask an open-ended question to pull facts into the Context Matrix.</p>
                            </div>
                        ) : isSearching ? (
                            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                                <p className="animate-pulse">Searching the web...</p>
                            </div>
                        ) : (
                            <>
                                {/* Mock Results */}
                                <div className={styles.resultCard}>
                                    <div className={styles.resultSource}>
                                        <Globe size={14} /> NASA.gov • Science • Re-entry Thermal Protection
                                    </div>
                                    <h3 className={styles.resultTitle}>Ablative Materials in Heat Shields</h3>
                                    <p className={styles.resultSnippet}>
                                        Spacecraft utilize ablative materials, such as phenolic-impregnated carbon ablator (PICA), which slowly burn away during re-entry, carrying the extreme heat with them instead of transferring it to the hull.
                                    </p>
                                    <button className={styles.saveBtn}>
                                        <PlusCircle size={16} /> Save to Lore Bible
                                    </button>
                                </div>

                                <div className={styles.resultCard}>
                                    <div className={styles.resultSource}>
                                        <Globe size={14} /> Wikipedia • Thermal Protection System
                                    </div>
                                    <h3 className={styles.resultTitle}>Space Shuttle Thermal Tiles</h3>
                                    <p className={styles.resultSnippet}>
                                        The Space Shuttle used a tile system made of silica foam. These highly insulating tiles could withstand temperatures up to 1,650 °C (3,000 °F) but were extremely brittle and required constant maintenance.
                                    </p>
                                    <button className={styles.saveBtn}>
                                        <PlusCircle size={16} /> Save to Lore Bible
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Tools */}
                <div className={styles.sidePanel}>
                    {/* Sensory Synthesizer */}
                    <div className={styles.toolCard}>
                        <h3 className={styles.toolTitle}>
                            <Wind size={20} color="var(--tag-blue-text)" /> Sensory Synthesizer
                        </h3>
                        <p className={styles.toolDesc}>
                            Generate atmospheric descriptions based on current workspace lore.
                        </p>
                        <form className={styles.synthForm}>
                            <select className={styles.synthSelect} defaultValue="smell">
                                <option value="smell">Olfactory (Smell)</option>
                                <option value="sound">Auditory (Sound)</option>
                                <option value="sight">Visual (Lighting/Architecture)</option>
                                <option value="touch">Tactile (Temperature/Texture)</option>
                            </select>
                            <select className={styles.synthSelect} defaultValue="xol">
                                <option value="xol">Setting: Xol Colony</option>
                                <option value="ship">Setting: The Frigate</option>
                                <option value="capitol">Setting: Hegemony Capitol</option>
                            </select>
                            <button type="button" className={styles.synthBtn}>
                                Generate Description
                            </button>
                        </form>
                    </div>

                    {/* Logic Auditor */}
                    <div className={styles.toolCard}>
                        <h3 className={styles.toolTitle}>
                            <AlertTriangle size={20} color="var(--accent-terracotta)" /> Fact-Checker
                        </h3>
                        <p className={styles.toolDesc}>
                            Run an AI audit against your Chapter 1 outline to check for logical or historical timeline gaps.
                        </p>
                        <button type="button" className={styles.synthBtn} style={{ width: '100%', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}>
                            Run Logic Audit
                        </button>
                    </div>

                    {/* Lore Integrations */}
                    <div className={styles.toolCard} style={{ background: 'var(--bg-secondary)', border: 'none' }}>
                        <h3 className={styles.toolTitle} style={{ fontSize: '0.9rem' }}>
                            <Library size={16} /> Saved Lore Entities
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--tag-green-text)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={14} /> Newtonian Physics (Active)
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--tag-green-text)', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={14} /> Faster-Than-Light Travel (Active)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
