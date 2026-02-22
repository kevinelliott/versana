'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Tag, Globe, Download, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import styles from './PublishPrep.module.css';

export default function PublishPrep() {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 7: Publishing & Marketing Prep</h1>
                <p className={styles.subtitle}>Generate optimized blurbs, extract metadata, and export your final manuscript.</p>
            </div>

            <div className={styles.grid}>
                {/* Column 1: Generators */}
                <div className={styles.column}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Sparkles size={18} color="var(--tag-purple-text)" /> Blurb & Synopsis Generator
                        </h3>
                        <p className={styles.cardDesc}>
                            Versana synthesizes your entire Context Matrix to write a compelling Amazon/KDP book description highlighting core tropes.
                        </p>
                        <textarea
                            className={styles.textareaBox}
                            defaultValue="In a galaxy fractured by the Iron Hegemony, one rogue captain holds the key to the rebellion's survival.&#10;&#10;Captain Aris is no hero. He’s a smuggler with a stolen frigate, a battered crew, and a plasma wound that won't heal. But when a routine cargo run unearths a Hegemony superweapon hidden on the ice world of Xol, Aris is forced to choose: keep running, or stand and fight.&#10;&#10;With his ruthless engineer Mira by his side, Aris must navigate a deadly web of planetary blockades, mercenary guilds, and ghosts from his past. As the Winter Siege begins, the line between survival and sacrifice blurs.&#10;&#10;Perfect for fans of gritty space opera and morally gray protagonists, *The Winter Siege* is a high-octane thrill ride across the stars."
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button className={styles.buttonSecondary}>Generate Short Pitch</button>
                            <button className={styles.buttonPrimary}>Regenerate Blurb</button>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Tag size={18} /> Metadata Extractor
                        </h3>
                        <p className={styles.cardDesc}>
                            AI-extracted keywords and recommended BISAC categories for optimal KDP ranking.
                        </p>

                        <div className={styles.tagGroup} style={{ marginBottom: '1rem' }}>
                            <div className={styles.tagLabel}>Top 7 SEO Keywords</div>
                            <div className={styles.tagList}>
                                <span className={styles.tag}>Space Opera</span>
                                <span className={styles.tag}>Morally Gray Hero</span>
                                <span className={styles.tag}>Sci-Fi Rebellion</span>
                                <span className={styles.tag}>Spaceship Crew</span>
                                <span className={styles.tag}>Military Science Fiction</span>
                                <span className={styles.tag}>Ice Planet Survival</span>
                                <span className={styles.tag}>Found Family Trope</span>
                            </div>
                        </div>

                        <div className={styles.tagGroup}>
                            <div className={styles.tagLabel}>Recommended BISAC</div>
                            <div className={styles.tagList}>
                                <span className={styles.tag}>FIC028030 - FICTION / Science Fiction / Space Opera</span>
                                <span className={styles.tag}>FIC028010 - FICTION / Science Fiction / Action & Adventure</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Export & Share */}
                <div className={styles.column}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Globe size={18} color="var(--tag-blue-text)" /> Hosted Mini-Site
                        </h3>
                        <p className={styles.cardDesc}>
                            A public, indexable landing page to share the first chapter as a lead magnet. Includes a mailing list sign-up natively integrated.
                        </p>
                        <div className={styles.shareBox}>
                            <span className={styles.shareLink}>versana.app/read/the-winter-siege</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={styles.buttonSecondary} style={{ padding: '0.5rem', width: 'auto' }} onClick={handleCopy} title="Copy Link">
                                    {isCopied ? <CheckCircle2 size={16} color="var(--tag-green-text)" /> : <Copy size={16} />}
                                </button>
                                <button className={styles.buttonSecondary} style={{ padding: '0.5rem', width: 'auto' }} title="Open in new tab">
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                        <button className={styles.buttonPrimary} style={{ marginTop: '1rem' }}>
                            Update Published Preview
                        </button>
                    </div>

                    <div className={styles.card} style={{ background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
                        <h3 className={styles.cardTitle}>
                            <Download size={18} /> Final Export Engine
                        </h3>
                        <p className={styles.cardDesc}>
                            Download your typeset manuscript and cover assets in industry-standard formats ready for KDP, IngramSpark, or direct sales.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button className={styles.buttonPrimary} style={{ background: 'var(--text-primary)', justifyContent: 'space-between', padding: '1rem' }}>
                                <span>Export Complete ePub 3.0</span>
                                <BookOpen size={16} />
                            </button>
                            <button className={styles.buttonSecondary} style={{ justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-primary)' }}>
                                <span>Export Print-Ready PDF (6x9)</span>
                                <Download size={16} />
                            </button>
                            <button className={styles.buttonSecondary} style={{ justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-primary)' }}>
                                <span>Export Raw Manuscript (.docx)</span>
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
