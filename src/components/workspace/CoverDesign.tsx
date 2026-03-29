'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Type, Download, Maximize2, Palette } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './CoverDesign.module.css';
import workspaceStyles from './Workspace.module.css';

export default function CoverDesign() {
    const { activeWorkspace, setActiveWorkspace } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState(isNonFicProject ? 'The Principles of Growth' : 'The Winter Siege');
    const [author, setAuthor] = useState('K. R. Author');
    const [subtitle, setSubtitle] = useState(isNonFicProject ? 'A Guide to Scale' : 'A Tale of the Hegemony');
    const [prompt, setPrompt] = useState(isNonFicProject ? 'A minimalist, conceptual representation of exponential business growth using abstract geometry and sleek metallic lines. Professional aesthetic, clean white background. --ar 2:3' : 'A lone starship captain standing in the snow outside a massive stone fortress, clutching a plasma rifle. Dark, gritty sci-fi aesthetic, cinematic lighting, dramatic shadows. --ar 2:3');

    // Advanced Style Tuner States
    const [artStyle, setArtStyle] = useState('cinematic');
    const [mood, setMood] = useState('dark');
    const [palette, setPalette] = useState('cool');

    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'classic' | 'modern' | 'cinematic'>('classic');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (activeWorkspace?.board_state?.cover_design && !isLoaded) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cd = activeWorkspace.board_state.cover_design as any;
            if (cd.title) setTitle(cd.title);
            if (cd.author) setAuthor(cd.author);
            if (cd.subtitle) setSubtitle(cd.subtitle);
            if (cd.prompt) setPrompt(cd.prompt);
            if (cd.artStyle) setArtStyle(cd.artStyle);
            if (cd.mood) setMood(cd.mood);
            if (cd.palette) setPalette(cd.palette);
            if (cd.coverImageUrl) setCoverImageUrl(cd.coverImageUrl);
            setIsLoaded(true);
        } else if (!isLoaded) {
            setIsLoaded(true);
        }
    }, [activeWorkspace, isLoaded]);

    useEffect(() => {
        if (!isLoaded || !activeWorkspace) return;

        const timer = setTimeout(async () => {
            const cover_design = { title, author, subtitle, prompt, artStyle, mood, palette, coverImageUrl };
            const updatedBoardState = { ...(activeWorkspace.board_state || {}), cover_design };

            try {
                await fetch(`/api/workspaces/${activeWorkspace.id}/board`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ board_state: updatedBoardState })
                });
                // Update context locally without causing massive re-renders
                setActiveWorkspace({ ...activeWorkspace, board_state: updatedBoardState });
            } catch (err) {
                console.error("Failed to auto-save cover state:", err);
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [title, author, subtitle, prompt, artStyle, mood, palette, coverImageUrl, isLoaded, activeWorkspace, setActiveWorkspace]);

    const handleGenerateCover = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/generate-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    type: "Book Cover Art",
                    workspaceId: activeWorkspace?.id,
                    style: `${artStyle} art style, ${mood} mood, ${palette} color palette`
                })
            });
            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate cover art';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }
            const data = await res.json();
            if (data.url) setCoverImageUrl(data.url);
        } catch (e: any) {
            console.error("Failed to generate cover art", e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRefinePrompt = async () => {
        setIsRefining(true);
        setError(null);
        try {
            // Fetch lore
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace?.id}`);
            const loreData = await loreRes.json();
            const text = Array.isArray(loreData) ? loreData.map(l => l.synopsis).join('\n') : '';

            const systemPrompt = `You are a Midjourney/DALL-E prompt engineer. Based on the provided contextual lore and the current prompt draft, rewrite the prompt to be highly detailed and visually descriptive, focusing strictly on aesthetics, lighting, composition, and mood, explicitly for generating a top-tier book cover art. ONLY output the refined prompt without markdown. Do not include 'Prompt:' or any pleasantries. Ensure you append '--ar 2:3' at the end.`;

            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace?.id,
                    systemPrompt,
                    messages: [{ role: 'user', content: `Current Draft Prompt: ${prompt}\n\nProject Context:\n${text}` }]
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to refine prompt';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            if (!res.body) throw new Error('No body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            setPrompt(''); // clear the prompt as we stream it in

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setPrompt(prev => prev + chunk);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred");
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <div className={workspaceStyles.workspaceContainer}>
            <div className={workspaceStyles.workspaceGlobalHeader}>
                <h1 className={workspaceStyles.phaseTitle}>
                    <span className={workspaceStyles.phaseLabel}>Phase 7</span>
                    Cover Design
                </h1>
                <p className={workspaceStyles.phaseSubtitle}>{isNonFicProject ? 'Translate your core thesis into prompts and generate your book cover.' : 'Translate lore into prompts and generate your book cover.'}</p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.gridContainer}`}>
                {/* Left Sidebar: Controls */}
                <div className={styles.promptPanel}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Sparkles size={18} color="var(--tag-purple-text)" /> Prompt Translator
                        </h3>
                        <p className={styles.cardDesc}>
                            {isNonFicProject ? 'Versana analyzed your Knowledge Base to generate this conceptual image prompt. Edit it, or generate variations.' : 'Versana analyzed Chapter 4 and your Lore Bible to generate this image prompt. Edit it, or generate variations.'}
                        </p>

                        <textarea
                            className={styles.textarea}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />

                        <div className={styles.tunerGrid}>
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.inputLabel}>Art Style</label>
                                <select className={styles.selectField} value={artStyle} onChange={(e) => setArtStyle(e.target.value)}>
                                    {isNonFicProject ? (
                                        <>
                                            <option value="minimalist vector">Minimalist Vector</option>
                                            <option value="abstract 3d">Abstract 3D Render</option>
                                            <option value="conceptual photography">Conceptual Photography</option>
                                            <option value="swiss graphic design">Swiss Graphic Design</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="cinematic">Cinematic Realism</option>
                                            <option value="vintage">Vintage 70s Sci-Fi</option>
                                            <option value="anime">Studio Ghibli Anime</option>
                                            <option value="minimalist">Minimalist Vector</option>
                                            <option value="oil">Classical Oil Painting</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.inputLabel}>Mood / Lighting</label>
                                <select className={styles.selectField} value={mood} onChange={(e) => setMood(e.target.value)}>
                                    {isNonFicProject ? (
                                        <>
                                            <option value="clean">Clean & Bright</option>
                                            <option value="authoritative">Authoritative / Stark</option>
                                            <option value="optimistic">Optimistic / Warm</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="dark">Dark & Gritty</option>
                                            <option value="ethereal">Ethereal & Dreamy</option>
                                            <option value="epic">Epic High-Contrast</option>
                                            <option value="neon">Neon Cyberpunk</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className={styles.inputGroup} style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                                <label className={styles.inputLabel}>Color Palette focus</label>
                                <select className={styles.selectField} value={palette} onChange={(e) => setPalette(e.target.value)}>
                                    <option value="cool">Cool Blues & Cyans</option>
                                    <option value="warm">Warm Oranges & Reds</option>
                                    <option value="monochrome">Monochrome / Noir</option>
                                    <option value="vibrant">Vibrant & Saturated</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div style={{ color: 'var(--bg-primary)', background: 'var(--accent-terracotta)', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '1rem' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button
                                className={styles.buttonSecondary}
                                onClick={handleRefinePrompt}
                                disabled={isRefining}
                                style={{ opacity: isRefining ? 0.7 : 1 }}
                            >
                                <Sparkles size={16} /> {isRefining ? 'Refining...' : 'Refine Prompt'}
                            </button>
                            <button
                                className={styles.buttonPrimary}
                                onClick={handleGenerateCover}
                                disabled={isGenerating}
                                style={{ opacity: isGenerating ? 0.7 : 1 }}
                            >
                                <ImageIcon size={16} /> {isGenerating ? 'Generating...' : 'Generate Art'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Type size={18} /> Typography Overlay
                        </h3>
                        <p className={styles.cardDesc}>
                            Add the title formatting to your generated art.
                        </p>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Book Title</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Author Name</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Subtitle / Series Line</label>
                            <input
                                type="text"
                                className={styles.inputField}
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Canvas */}
                <div className={styles.canvasPanel}>
                    <div
                        className={styles.coverArt}
                        style={{
                            backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'url("https://images.unsplash.com/photo-1542385262-cdf06b2fb50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className={styles.coverOverlay}></div>

                        {/* Interactive Typography Layer */}
                        <div className={`${styles.coverContent} ${layoutMode === 'modern' ? styles.layoutModern : layoutMode === 'cinematic' ? styles.layoutCinematic : styles.layoutClassic}`}>
                            <div className={styles.coverAuthor}>{author}</div>

                            <div className={styles.coverTitle}>
                                {title.split(' ').map((word, i) => (
                                    <React.Fragment key={i}>
                                        {word}{(layoutMode !== 'modern' && layoutMode !== 'cinematic') || layoutMode === 'cinematic' ? <br /> : ' '}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className={styles.coverSubtitle}>{subtitle}</div>
                        </div>
                    </div>

                    <div className={styles.controlsOverlay}>
                        <button className={styles.iconBtn} title="Change Layout" onClick={() => {
                            setLayoutMode(prev => prev === 'classic' ? 'modern' : prev === 'modern' ? 'cinematic' : 'classic');
                        }}>
                            <Palette size={18} />
                        </button>
                        <button className={styles.iconBtn} title="Download High-Res">
                            <Download size={18} />
                        </button>
                        <button className={styles.iconBtn} title="Full Screen">
                            <Maximize2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
