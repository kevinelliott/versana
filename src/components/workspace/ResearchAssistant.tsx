'use client';

import React, { useState } from 'react';
import { Search, Globe, PlusCircle, MapPin as MapPinIcon, Crosshair, Sparkles, Loader2, Feather } from 'lucide-react';
import Map, { NavigationControl, Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './ResearchAssistant.module.css';
import workspaceStyles from './Workspace.module.css';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function ResearchAssistant() {
    const { activeWorkspace } = useWorkspace();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [savedCards, setSavedCards] = useState<string[]>([]);
    const [results, setResults] = useState<{ title: string, source: string, snippet: string, url: string }[]>([]);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    // Tabs
    const [activeTab, setActiveTab] = useState<'web' | 'sensory'>('web');

    // Sensory Synthesizer state
    const [sensoryPrompt, setSensoryPrompt] = useState('');
    const [isGeneratingSensory, setIsGeneratingSensory] = useState(false);
    const [sensoryResult, setSensoryResult] = useState<string | null>(null);
    const [sensoryError, setSensoryError] = useState<string | null>(null);

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

    const handleGenerateSensory = async () => {
        if (!sensoryPrompt.trim() || !activeWorkspace) return;
        setIsGeneratingSensory(true);
        setSensoryError(null);
        setSensoryResult(null);

        try {
            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    systemPrompt: isNonFicProject ? "You are an expert descriptive researcher. The user will provide a setting, artifact, or scenario. Your job is to output 3 paragraphs deeply describing the physical, structural, and historical atmosphere, focusing on vivid, factual, and sensory details." : "You are a master fiction author. The user will provide a setting or location. Your job is to output 3 paragraphs deeply describing the sensory atmosphere (smells, sounds, lighting, textures, and architecture) to help the author with world-building.",
                    messages: [{ role: 'user', content: sensoryPrompt }]
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate sensory details';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            setSensoryResult('');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setSensoryResult(prev => (prev || '') + chunk);
            }
        } catch (err: unknown) {
            console.error("Sensory Error:", err);
            setSensoryError((err as Error).message || "An error occurred.");
        } finally {
            setIsGeneratingSensory(false);
        }
    };

    const handleSaveSensory = async () => {
        if (!sensoryResult || !activeWorkspace) return;
        try {
            const res = await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: `Atmosphere: ${sensoryPrompt.substring(0, 30)}...`,
                    type: 'Location',
                    synopsis: sensoryResult
                })
            });

            if (res.ok) {
                const newId = 'sensory_' + Date.now();
                setSavedCards(prev => [...prev, newId]);
                // using sensoryResult trick, clearing it or showing success
                alert("Saved to " + (isNonFicProject ? "Knowledge Base" : "Context Matrix") + "!");
            }
        } catch (err) {
            console.error("Failed to save sensory detail:", err);
        }
    };

    return (
        <div className={workspaceStyles.workspaceContainer}>
            <div className={workspaceStyles.workspaceGlobalHeader}>
                <h1 className={workspaceStyles.phaseTitle}>
                    <span className={workspaceStyles.phaseLabel}>Phase 3</span>
                    {isNonFicProject ? 'Research & Sourcing' : 'Research Assistant'}
                </h1>
                <p className={workspaceStyles.phaseSubtitle}>
                    {isNonFicProject ? 'Query the web and synthesize facts direct to your Knowledge Base.' : 'Query the real world and synthesize sensory details direct to your Story Bible.'}
                </p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.gridContainer}`}>
                {/* Main Action Panel */}
                <div className={styles.mainPanel} style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                        <button
                            onClick={() => setActiveTab('web')}
                            style={{
                                background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer',
                                fontWeight: activeTab === 'web' ? 600 : 400,
                                color: activeTab === 'web' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                borderBottom: activeTab === 'web' ? '2px solid var(--text-primary)' : 'none'
                            }}
                        >
                            <Search size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> World-Wide Web
                        </button>
                        <button
                            onClick={() => setActiveTab('sensory')}
                            style={{
                                background: 'transparent', border: 'none', padding: '0.5rem', cursor: 'pointer',
                                fontWeight: activeTab === 'sensory' ? 600 : 400,
                                color: activeTab === 'sensory' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                borderBottom: activeTab === 'sensory' ? '2px solid var(--text-primary)' : 'none'
                            }}
                        >
                            <Feather size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Sensory & Detail Synthesizer
                        </button>
                    </div>

                    {activeTab === 'web' && (
                        <>
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
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', marginLeft: '0.5rem' }}>
                                    {isNonFicProject 
                                      ? "💡 Tip: Search for recent statistics, historical events, or academic studies to back your arguments."
                                      : "💡 Tip: Search for historical timelines, naming conventions, architectural styles, or hard science facts."}
                                </div>
                            </div>

                            <div className={styles.resultsList} style={{ flex: 1, overflowY: 'auto' }}>
                                {!hasSearched && !isSearching ? (
                                    <div className={styles.emptyStateContainer}>
                                        <div className={styles.emptyIcon}>
                                            <Globe size={32} color="var(--accent-blue)" />
                                        </div>
                                        <h3>{isNonFicProject ? 'Knowledge Base Research' : 'Context Matrix Research'}</h3>
                                        <p>Powered by Tavily API. Ask an open-ended question to pull facts directly into your project.</p>
                                        
                                        <div className={styles.suggestionTags}>
                                            <button className={styles.suggestionTag} onClick={() => setSearchQuery(isNonFicProject ? "What are the physiological effects of deep sea diving?" : "What materials withstand atmospheric re-entry heat?")}>
                                                {isNonFicProject ? "Physiological effects of deep sea diving" : "Materials for atmospheric re-entry"}
                                            </button>
                                            <button className={styles.suggestionTag} onClick={() => setSearchQuery(isNonFicProject ? "How do interest rates affect the local housing market?" : "How fast do traditional 18th century galleons travel?")}>
                                                {isNonFicProject ? "Interest rates & housing market" : "Speed of 18th century galleons"}
                                            </button>
                                        </div>
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
                        </>
                    )}

                    {activeTab === 'sensory' && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'var(--tag-purple-bg)', borderRadius: '8px', display: 'flex' }}>
                                        <Sparkles size={20} color="var(--tag-purple-text)" />
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Sensory Synthesizer</h3>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    {isNonFicProject ? "Describe a setting, event, or subject. The AI will generate deep, factual, and highly-detailed descriptions outlining atmosphere and historical context." : "Describe a setting or location. The AI will act as a master prose author to generate rich sensory details (smells, sounds, lighting, and textures)."}
                                </p>
                                <textarea
                                    style={{ width: '100%', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1.5rem', fontSize: '1rem' }}
                                    placeholder={isNonFicProject ? "e.g. The frantic floor of the New York Stock Exchange in 1987..." : "e.g. A cyberpunk noodle shop in the lower ring, raining..."}
                                    value={sensoryPrompt}
                                    onChange={(e) => setSensoryPrompt(e.target.value)}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        style={{ background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid var(--tag-purple-text)', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
                                        onClick={handleGenerateSensory}
                                        disabled={isGeneratingSensory}
                                    >
                                        {isGeneratingSensory ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                                        {isGeneratingSensory ? 'Synthesizing...' : 'Synthesize Details'}
                                    </button>
                                </div>
                            </div>

                            {sensoryError && (
                                <div style={{ padding: '1rem', borderRadius: '6px', background: 'var(--tag-red-bg)', color: 'var(--tag-red-text)', border: '1px solid var(--tag-red-text)' }}>
                                    {sensoryError}
                                </div>
                            )}

                            {sensoryResult && (
                                <div style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Feather size={18} color="var(--tag-purple-text)" /> Generated Atmosphere
                                    </h3>
                                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                        {sensoryResult}
                                    </div>
                                    {!isGeneratingSensory && (
                                        <button
                                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                                            onClick={handleSaveSensory}
                                        >
                                            <PlusCircle size={14} /> Save to {isNonFicProject ? 'Knowledge Base' : 'Lore Bible'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
                        {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
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
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                <MapPinIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Topographical Module Offline</h3>
                                <p style={{ maxWidth: '300px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    The interactive map requires a valid Mapbox API instance token to render map tiles. Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables to enable topological tracking and distance calculations.
                                </p>
                            </div>
                        )}
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
