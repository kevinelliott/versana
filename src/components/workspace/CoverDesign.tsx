'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Type, Download, Maximize2, Palette } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './CoverDesign.module.css';

export default function CoverDesign() {
    const { activeWorkspace, setActiveWorkspace } = useWorkspace();
    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState('The Winter Siege');
    const [author, setAuthor] = useState('K. R. Author');
    const [subtitle, setSubtitle] = useState('A Tale of the Hegemony');
    const [prompt, setPrompt] = useState('A lone starship captain standing in the snow outside a massive stone fortress, clutching a plasma rifle. Dark, gritty sci-fi aesthetic, cinematic lighting, dramatic shadows. --ar 2:3');

    // Advanced Style Tuner States
    const [artStyle, setArtStyle] = useState('cinematic');
    const [mood, setMood] = useState('dark');
    const [palette, setPalette] = useState('cool');

    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (activeWorkspace?.board_state?.cover_design && !isLoaded) {
            const cd = activeWorkspace.board_state.cover_design;
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
        try {
            const res = await fetch('/api/ai/generate-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    type: "Book Cover Art",
                    style: `${artStyle} art style, ${mood} mood, ${palette} color palette`
                })
            });
            const data = await res.json();
            if (data.url) setCoverImageUrl(data.url);
        } catch (e) {
            console.error("Failed to generate cover art", e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 7: Cover Design</h1>
                <p className={styles.subtitle}>Translate lore into prompts and generate your book cover.</p>
            </div>

            <div className={styles.grid}>
                {/* Left Sidebar: Controls */}
                <div className={styles.promptPanel}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Sparkles size={18} color="var(--tag-purple-text)" /> Prompt Translator
                        </h3>
                        <p className={styles.cardDesc}>
                            Versana analyzed Chapter 4 and your Lore Bible to generate this image prompt. Edit it, or generate variations.
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
                                    <option value="cinematic">Cinematic Realism</option>
                                    <option value="vintage">Vintage 70s Sci-Fi</option>
                                    <option value="anime">Studio Ghibli Anime</option>
                                    <option value="minimalist">Minimalist Vector</option>
                                    <option value="oil">Classical Oil Painting</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.inputLabel}>Mood / Lighting</label>
                                <select className={styles.selectField} value={mood} onChange={(e) => setMood(e.target.value)}>
                                    <option value="dark">Dark & Gritty</option>
                                    <option value="ethereal">Ethereal & Dreamy</option>
                                    <option value="epic">Epic High-Contrast</option>
                                    <option value="neon">Neon Cyberpunk</option>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button className={styles.buttonSecondary}>
                                Refine Prompt
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
                        <div className={styles.coverContent}>
                            <div className={styles.coverAuthor}>{author}</div>

                            <div className={styles.coverTitle}>
                                {title.split(' ').map((word, i) => (
                                    <React.Fragment key={i}>
                                        {word}<br />
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className={styles.coverSubtitle}>{subtitle}</div>
                        </div>
                    </div>

                    <div className={styles.controlsOverlay}>
                        <button className={styles.iconBtn} title="Change Layout">
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
