'use client';

import React, { useState } from 'react';
import { Settings2, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import styles from './BookLayout.module.css';

export default function BookLayout() {
    const [trimSize, setTrimSize] = useState('6x9');
    const [font, setFont] = useState('Garamond');
    const [dropCapEnabled, setDropCapEnabled] = useState(true);
    const [ornamentEnabled, setOrnamentEnabled] = useState(true);

    const [generatedOrnamentUrl, setGeneratedOrnamentUrl] = useState<string | null>(null);
    const [generatedDropCapUrl, setGeneratedDropCapUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateAssets = async () => {
        setIsGenerating(true);
        try {
            if (ornamentEnabled) {
                const res = await fetch('/api/ai/generate-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: "A beautiful, minimalist, highly stylized sci-fi scene break ornament, sharp black vector on white background, symmetrical, centered, thin lines.",
                        type: "Scene Break Icon"
                    })
                });
                const data = await res.json();
                if (data.url) setGeneratedOrnamentUrl(data.url);
            }

            if (dropCapEnabled) {
                const res = await fetch('/api/ai/generate-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: "An incredibly ornate, illuminated manuscript style capital letter 'T', sci-fi theme, silver and neon blue, highly detailed, black background, readable.",
                        type: "Drop Cap Letter"
                    })
                });
                const data = await res.json();
                if (data.url) setGeneratedDropCapUrl(data.url);
            }
        } catch (e) {
            console.error("Failed to generate assets", e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phase 5: Book Layout & Formatting</h1>
                <p className={styles.subtitle}>Configure Auto-Typesetting and generate chapter ornamentations.</p>
            </div>

            <div className={styles.layoutGrid}>
                {/* Left Sidebar: Controls */}
                <div className={styles.controlsPanel}>
                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <Settings2 size={18} /> Typographic Settings
                        </h3>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Trim Size (Print)</label>
                            <select
                                className={styles.select}
                                value={trimSize}
                                onChange={(e) => setTrimSize(e.target.value)}
                            >
                                <option value="5x8">5" x 8" (Trade Paperback)</option>
                                <option value="5.5x8.5">5.5" x 8.5" (Digest)</option>
                                <option value="6x9">6" x 9" (Standard Hardcover)</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Body Font</label>
                            <select
                                className={styles.select}
                                value={font}
                                onChange={(e) => setFont(e.target.value)}
                            >
                                <option value="Garamond">EB Garamond</option>
                                <option value="Baskerville">Libre Baskerville</option>
                                <option value="Palatino">Palatino Linotype</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Chapter Heading Style</label>
                            <select className={styles.select} defaultValue="classic">
                                <option value="classic">Classic Serif (Centered)</option>
                                <option value="modern">Modern Sans (Left-Aligned)</option>
                                <option value="ornate">Ornate (With Flourish)</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <Sparkles size={18} color="var(--tag-purple-text)" /> AI Front & Back Matter
                        </h3>
                        <p className={styles.label} style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                            Let Versana auto-generate standard book publishing pages using your Context Matrix.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked /> Copyright Page
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked /> Dedication
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" /> Acknowledgments
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked /> About the Author
                            </label>
                        </div>
                        <button className={styles.actionBtn}>
                            Generate Selected Matter
                        </button>
                    </div>

                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <Sparkles size={18} color="var(--tag-purple-text)" /> AI Ornamentation
                        </h3>

                        <div className={styles.toggleRow}>
                            <span className={styles.toggleLabel}>Generate Drop Caps</span>
                            <button
                                className={`${styles.toggleBtn} ${!dropCapEnabled ? styles.toggleBtnOff : ''}`}
                                onClick={() => setDropCapEnabled(!dropCapEnabled)}
                            />
                        </div>

                        <div className={styles.toggleRow}>
                            <span className={styles.toggleLabel}>Scene Break Icons</span>
                            <button
                                className={`${styles.toggleBtn} ${!ornamentEnabled ? styles.toggleBtnOff : ''}`}
                                onClick={() => setOrnamentEnabled(!ornamentEnabled)}
                            />
                        </div>

                        <button
                            className={styles.actionBtn}
                            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', opacity: isGenerating ? 0.7 : 1 }}
                            onClick={handleGenerateAssets}
                            disabled={isGenerating}
                        >
                            <ImageIcon size={16} /> {isGenerating ? 'Generating via Nano Banana Pro...' : 'Generate Assets (Nano Banana Pro)'}
                        </button>
                    </div>

                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <ImageIcon size={18} /> Inline Illustrations
                        </h3>
                        <p className={styles.label} style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                            Generate map inserts, sketches, or symbol pages to place *between* chapters.
                        </p>
                        <select className={styles.select} style={{ marginBottom: '0.75rem' }}>
                            <option value="map">Fantasy Map Insert</option>
                            <option value="sketch">Character Sketch (Graphite)</option>
                            <option value="symbol">Faction Symbol / Crest</option>
                            <option value="tech">Technical Diagram</option>
                        </select>
                        <button className={styles.actionBtn}>
                            Generate Full-Page Insert
                        </button>
                    </div>

                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <Download size={18} /> Export Formats
                        </h3>
                        <p className={styles.label} style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                            Ready to publish? Export your manuscript in industry-standard formats.
                        </p>
                        <button className={styles.actionBtn}>Export as ePub</button>
                        <button className={styles.actionBtn}>Export as Print PDF</button>
                    </div>
                </div>

                {/* Right Panel: Print Preview Simulation */}
                <div className={styles.previewPanel}>
                    <div
                        className={styles.bookPage}
                        style={{
                            fontFamily: font === 'Garamond' ? '"EB Garamond", serif' :
                                font === 'Baskerville' ? '"Libre Baskerville", serif' :
                                    '"Palatino Linotype", "Book Antiqua", Palatino, serif'
                        }}
                    >
                        <div className={styles.chapterTitle}>
                            CHAPTER FOUR
                        </div>

                        <p className={styles.pageTextNoIndent}>
                            {dropCapEnabled && (
                                generatedDropCapUrl
                                    ? <img src={generatedDropCapUrl} alt="Drop Cap" style={{ float: 'left', height: '4rem', marginRight: '0.75rem', marginTop: '0.2rem', borderRadius: '4px' }} />
                                    : <span className={styles.dropCap}>T</span>
                            )}
                            {dropCapEnabled ? "he " : "The "}snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, his breath pluming in the frigid air. The Rebellion could not afford to lose this vantage point. If the Hegemony breached the wall, the entire sector would fall within the week.
                        </p>

                        <p className={styles.pageText}>
                            "They're coming from the eastern ridge," shouted Mira, pointing toward the jagged peaks. She wiped frost from her visor, her expression grim. "The scanners are picking up heavy armor. Mechanized infantry."
                        </p>

                        <p className={styles.pageText}>
                            Aris cursed softly. They had been outmaneuvered. The intelligence reports had promised a skeletal garrison, not a full battalion of shock troops. He signaled the rest of his squad to hold position.
                        </p>

                        {ornamentEnabled && (
                            generatedOrnamentUrl
                                ? <div style={{ textAlign: 'center', margin: '2rem 0' }}><img src={generatedOrnamentUrl} alt="Scene Break Ornament" style={{ height: '40px', objectFit: 'contain' }} /></div>
                                : <div className={styles.sceneBreak}>***</div>
                        )}

                        <p className={styles.pageTextNoIndent}>
                            The first explosion rattled the foundation of the fort. Dust fell from the ancient stone ceiling, coating Aris's armor in a fine, gray powder. The sound was deafening, a concussive wave that vibrated through their boots. The siege had begun.
                        </p>

                        <p className={styles.pageText}>
                            "Hold the line!" Aris bellowed over the comms channel. "Nobody fires until I give the order!"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
