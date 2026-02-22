'use client';

import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Type, Download, Maximize2, Palette } from 'lucide-react';
import styles from './CoverDesign.module.css';

export default function CoverDesign() {
    const [title, setTitle] = useState('The Winter Siege');
    const [author, setAuthor] = useState('K. R. Author');
    const [subtitle, setSubtitle] = useState('A Tale of the Hegemony');
    const [prompt, setPrompt] = useState('A lone starship captain standing in the snow outside a massive stone fortress, clutching a plasma rifle. Dark, gritty sci-fi aesthetic, cinematic lighting, dramatic shadows. --ar 2:3');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 6: Cover Design</h1>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button className={styles.buttonSecondary}>
                                Refine Prompt
                            </button>
                            <button className={styles.buttonPrimary}>
                                <ImageIcon size={16} /> Generate Art
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
                    <div className={styles.coverArt}>
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
