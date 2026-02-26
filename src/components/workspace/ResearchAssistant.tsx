'use client';

import React, { useState } from 'react';
import { Search, Globe, PlusCircle, MapPin as MapPinIcon, Crosshair } from 'lucide-react';
import Map, { NavigationControl, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './ResearchAssistant.module.css';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function ResearchAssistant() {
    const { activeWorkspace } = useWorkspace();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [savedCards, setSavedCards] = useState<string[]>([]);
    const [results, setResults] = useState<{ title: string, source: string, snippet: string, url: string }[]>([]);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    // Mapbox State
    const [viewState, setViewState] = useState({
        longitude: -0.1276, // London default
        latitude: 51.5072,
        zoom: 11
    });
     
    const [markers, setMarkers] = useState<{ lng: number, lat: number, title: string }[]>([
        { lng: -0.1276, lat: 51.5072, title: 'Central London Reference' },
        { lng: -0.0754, lat: 51.5055, title: 'Tower Bridge' }
    ]);

    const handleSaveCard = async (id: string, result: { title: string, source: string, snippet: string, url: string }) => {
        if (!activeWorkspace) return;
        try {
            const res = await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: `Research: ${result.title}`,
                    type: 'Lore',
                    synopsis: `${result.snippet} (Source: ${result.source})`
                })
            });

            if (res.ok) {
                setSavedCards(prev => [...prev, id]);
            }
        } catch (err) {
            console.error("Failed to save research:", err);
        }
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
                body: JSON.stringify({ query: searchQuery, workspaceId: activeWorkspace?.id })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch research");
            }

            const data = await response.json();
            if (data.results) {
                setResults(data.results);
            }
            if (data.locations && data.locations.length > 0) {
                setMarkers(data.locations);
                setViewState({
                    longitude: data.locations[0].lng,
                    latitude: data.locations[0].lat,
                    zoom: 10
                });
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
                <h1 className={styles.title}>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Phase 3</span>
                    {isNonFicProject ? 'Research & Sourcing' : 'Research Assistant'}
                </h1>
                <p className={styles.subtitle}>
                    {isNonFicProject ? 'Query the web and synthesize facts direct to your Knowledge Base.' : 'Query the real world and synthesize sensory details direct to your Story Bible.'}
                </p>
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
                                placeholder={isNonFicProject ? "Search the web (e.g. 'What are the nutritional facts of an avocado?')" : "Search the web (e.g. 'What materials withstand re-entry heat?')"}
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
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Ask an open-ended question to pull facts into the {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}.</p>
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
                                                onClick={() => handleSaveCard(id, result)}
                                                disabled={isSaved}
                                                style={isSaved ? { background: 'var(--bg-secondary)', color: 'var(--tag-green-text)' } : {}}
                                            >
                                                {isSaved ? 'Saved to Knowledge Base' : <><PlusCircle size={16} /> Save to {isNonFicProject ? 'Knowledge Base' : 'Lore Bible'}</>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Panel: Interactive World Map */}
                <div className={styles.mapPanel}>
                    <div className={styles.mapHeader}>
                        <h2 className={styles.mapTitle}>
                            <MapPinIcon size={18} color="var(--tag-purple-text)" /> Topography & Locational Research
                        </h2>
                        <button className={styles.iconBtn} title="Drop Marker">
                            <Crosshair size={16} />
                        </button>
                    </div>

                    <div className={styles.mapWrapper}>
                        <Map
                            {...viewState}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onMove={(evt: any) => setViewState(evt.viewState)}
                            mapStyle="mapbox://styles/mapbox/dark-v11"
                            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                            style={{ width: '100%', height: '100%' }}
                            attributionControl={false}
                        >
                            <NavigationControl position="bottom-right" />
                            {markers.map((m, i) => (
                                <Marker key={i} longitude={m.lng} latitude={m.lat}>
                                    <div className={styles.markerPin}>
                                        <MapPinIcon size={24} color="var(--accent-terracotta)" fill="currentColor" />
                                        <div className={styles.markerTooltip}>{m.title}</div>
                                    </div>
                                </Marker>
                            ))}
                        </Map>
                    </div>

                    <div className={styles.mapFooter}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <strong>Pro Tip:</strong> {isNonFicProject ? 'Drop markers on real-world locations to reference historical places related to your subject matter.' : 'Drop markers on real-world locations to calculate exact travel times for your characters. Add these locations natively to the Context Matrix.'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
