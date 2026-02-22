'use client';

import React, { useState } from 'react';
import { Search, Globe, PlusCircle } from 'lucide-react';
import styles from './ResearchAssistant.module.css';

export default function ResearchAssistant() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [savedCards, setSavedCards] = useState<string[]>([]);
    const [results, setResults] = useState<{ title: string, source: string, snippet: string, url: string }[]>([]);

    const handleSaveCard = (id: string) => {
        setSavedCards(prev => [...prev, id]);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || isSearching) return;

        setIsSearching(true);
        setHasSearched(true);
        setResults([]);

        try {
            const response = await fetch('/api/ai/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch research");
            }

            const data = await response.json();
            if (data.results) {
                setResults(data.results);
            }
        } catch (err) {
            console.error("Research Error:", err);
            // Fallback for demo purposes if API fails
            setResults([{
                title: "Error fetching data",
                source: "System",
                snippet: "Could not connect to the research API. Check your keys or connection.",
                url: "#"
            }]);
        } finally {
            setIsSearching(false);
        }
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
                                {results.map((result, idx) => {
                                    const id = `res_${idx}`;
                                    const isSaved = savedCards.includes(id);
                                    return (
                                        <div key={id} className={styles.resultCard}>
                                            <div className={styles.resultSource}>
                                                <Globe size={14} /> {result.source}
                                            </div>
                                            <h3 className={styles.resultTitle}>{result.title}</h3>
                                            <p className={styles.resultSnippet}>
                                                {result.snippet}
                                            </p>
                                            <button
                                                className={styles.saveBtn}
                                                onClick={() => handleSaveCard(id)}
                                                disabled={isSaved}
                                                style={isSaved ? { background: 'var(--bg-secondary)', color: 'var(--tag-green-text)' } : {}}
                                            >
                                                {isSaved ? 'Saved to Knowledge Base' : <><PlusCircle size={16} /> Save to Lore Bible</>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}
