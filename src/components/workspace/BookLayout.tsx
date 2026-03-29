'use client';

import React, { useState } from 'react';
import { Settings2, Download, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import styles from './BookLayout.module.css';
import workspaceStyles from './Workspace.module.css';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function BookLayout() {
    const { activeWorkspace, activeBook } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const [trimSize, setTrimSize] = useState('6x9');
    const [font, setFont] = useState('Garamond');
    const [chapterStyle, setChapterStyle] = useState('classic');
    const [dropCapEnabled, setDropCapEnabled] = useState(true);
    const [ornamentEnabled, setOrnamentEnabled] = useState(true);

    const [isGeneratingMatter, setIsGeneratingMatter] = useState(false);
    const [isGeneratingInsert, setIsGeneratingInsert] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [generatedOrnamentUrl, setGeneratedOrnamentUrl] = useState<string | null>(null);
    const [generatedDropCapUrl, setGeneratedDropCapUrl] = useState<string | null>(null);
    const [generatedInsertUrl, setGeneratedInsertUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [insertType, setInsertType] = useState(isNonFicProject ? 'chart' : 'map');

    const handleGenerateMatter = async () => {
        if (!activeBook) return;
        setIsGeneratingMatter(true);
        setError(null);
        try {
            // Send requests to generate front-matter chapters sequentially to preserve order
            const matters = [
                { title: "Copyright Page" },
                { title: "Dedication" },
                { title: "About the Author" }
            ];
            for (let i = 0; i < matters.length; i++) {
                const res = await fetch('/api/chapters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookId: activeBook.id, workspaceId: activeWorkspace?.id, title: matters[i].title, orderIndex: -(matters.length - i) }) // Negative order to put at front
                });
                if (!res.ok) {
                    const errText = await res.text().catch(() => null);
                    let errMsg = 'Failed to generate front matter';
                    try {
                        const errJson = JSON.parse(errText || '{}');
                        if (errJson.error) errMsg = errJson.error;
                    } catch {
                        if (errText) errMsg = errText;
                    }
                    throw new Error(`⚠️ System Notification: ${errMsg}`);
                }
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGeneratingMatter(false);
        }
    };

    const handleGenerateInsert = async () => {
        setIsGeneratingInsert(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/generate-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: isNonFicProject
                        ? `A highly detailed, professional ${insertType} illustrating key concepts in a non-fiction book. Minimalist vector art, high contrast, scholarly.`
                        : `A highly detailed, immersive fantasy/sci-fi ${insertType} meant for a book insert. Hand-drawn style, intricate, evocative.`,
                    type: "Full Page Insert",
                    workspaceId: activeWorkspace?.id
                })
            });
            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate insert';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }
            const data = await res.json();
            if (data.url) setGeneratedInsertUrl(data.url);
        } catch (e: any) {
            console.error("Failed to generate insert", e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGeneratingInsert(false);
        }
    };

    const handleGenerateAssets = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            if (ornamentEnabled) {
                const res = await fetch('/api/ai/generate-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: isNonFicProject ? "A clean, minimalist, professional section break ornament, sharp black vector on white background, symmetrical, centered, thin lines, representing knowledge." : "A beautiful, minimalist, highly stylized sci-fi scene break ornament, sharp black vector on white background, symmetrical, centered, thin lines.",
                        type: isNonFicProject ? "Section Break Icon" : "Scene Break Icon",
                        workspaceId: activeWorkspace?.id
                    })
                });
                if (!res.ok) {
                    const errText = await res.text().catch(() => null);
                    let errMsg = 'Failed to generate ornament';
                    try {
                        const errJson = JSON.parse(errText || '{}');
                        if (errJson.error) errMsg = errJson.error;
                    } catch {
                        if (errText) errMsg = errText;
                    }
                    throw new Error(`⚠️ System Notification: ${errMsg}`);
                }
                const data = await res.json();
                if (data.url) setGeneratedOrnamentUrl(data.url);
            }

            if (dropCapEnabled) {
                const res = await fetch('/api/ai/generate-asset', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: isNonFicProject ? "An elegant, clean manuscript style capital letter 'T', non-fiction theme, professional, highly detailed, black background, readable." : "An incredibly ornate, illuminated manuscript style capital letter 'T', sci-fi theme, silver and neon blue, highly detailed, black background, readable.",
                        type: "Drop Cap Letter",
                        workspaceId: activeWorkspace?.id
                    })
                });
                if (!res.ok) {
                    const errText = await res.text().catch(() => null);
                    let errMsg = 'Failed to generate dropcap';
                    try {
                        const errJson = JSON.parse(errText || '{}');
                        if (errJson.error) errMsg = errJson.error;
                    } catch {
                        if (errText) errMsg = errText;
                    }
                    throw new Error(`⚠️ System Notification: ${errMsg}`);
                }
                const data = await res.json();
                if (data.url) setGeneratedDropCapUrl(data.url);
            }
        } catch (e: any) {
            console.error("Failed to generate assets", e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={workspaceStyles.workspaceContainer}>
            <div className={workspaceStyles.workspaceGlobalHeader}>
                <h1 className={workspaceStyles.phaseTitle}>
                    <span className={workspaceStyles.phaseLabel}>Phase 6</span>
                    {isNonFicProject ? 'Document Layout & Formatting' : 'Book Layout & Formatting'}
                </h1>
                <p className={workspaceStyles.phaseSubtitle}>Configure Auto-Typesetting and generate chapter ornamentations.</p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.gridContainer}`}>
                {/* Left Sidebar: Controls */}
                <div className={styles.controlsPanel}>
                    {error && (
                        <div style={{ color: 'var(--bg-primary)', background: 'var(--accent-terracotta)', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

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
                                <option value="5x8">5&quot; x 8&quot; (Trade Paperback)</option>
                                <option value="5.5x8.5">5.5&quot; x 8.5&quot; (Digest)</option>
                                <option value="6x9">6&quot; x 9&quot; (Standard Hardcover)</option>
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
                            <label className={styles.label}>{isNonFicProject ? 'Section' : 'Chapter'} Heading Style</label>
                            <select
                                className={styles.select}
                                value={chapterStyle}
                                onChange={(e) => setChapterStyle(e.target.value)}
                            >
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
                            Let Versana auto-generate standard book publishing pages using your {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked /> Copyright Page
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked /> Dedication
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" /> {isNonFicProject ? 'Foreword / Preface' : 'Acknowledgments'}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <input type="checkbox" defaultChecked /> About the Author
                            </label>
                        </div>
                        <button
                            className={styles.actionBtn}
                            onClick={handleGenerateMatter}
                            disabled={isGeneratingMatter}
                        >
                            {isGeneratingMatter ? 'Generating Pages...' : 'Generate Selected Matter'}
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
                            <span className={styles.toggleLabel}>{isNonFicProject ? 'Section' : 'Scene'} Break Icons</span>
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
                            <ImageIcon size={16} /> {isGenerating ? 'Generating via Versana AI...' : 'Generate Assets (Versana AI)'}
                        </button>
                    </div>

                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <ImageIcon size={18} /> Inline Illustrations
                        </h3>
                        <p className={styles.label} style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                            Generate {isNonFicProject ? 'charts, diagrams, or visual summaries' : 'map inserts, sketches, or symbol pages'} to place *between* {isNonFicProject ? 'sections' : 'chapters'}.
                        </p>
                        <select className={styles.select} style={{ marginBottom: '0.75rem' }} value={insertType} onChange={e => setInsertType(e.target.value)}>
                            {isNonFicProject ? (
                                <>
                                    <option value="chart">Data Chart / Graph</option>
                                    <option value="diagram">Process Diagram</option>
                                    <option value="framework">Framework Illustration</option>
                                    <option value="timeline">Historical Timeline</option>
                                </>
                            ) : (
                                <>
                                    <option value="map">Fantasy Map Insert</option>
                                    <option value="sketch">Character Sketch (Graphite)</option>
                                    <option value="symbol">Faction Symbol / Crest</option>
                                    <option value="tech">Technical Diagram</option>
                                </>
                            )}
                        </select>
                        <button
                            className={styles.actionBtn}
                            onClick={handleGenerateInsert}
                            disabled={isGeneratingInsert}
                        >
                            {isGeneratingInsert ? <><Loader2 size={16} className="spinner" /> Generating Layout Insert...</> : 'Generate Full-Page Insert'}
                        </button>
                    </div>

                    <div className={styles.controlSection}>
                        <h3 className={styles.sectionTitle}>
                            <Download size={18} /> Export Formats
                        </h3>
                        <p className={styles.label} style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
                            Ready to publish? Export your manuscript in industry-standard formats.
                        </p>
                        <button
                            className={styles.actionBtn}
                            onClick={() => activeWorkspace && activeBook && window.open(`/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=epub`, '_blank')}
                        >
                            Export as ePub
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => activeWorkspace && activeBook && window.open(`/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=docx`, '_blank')}
                        >
                            Export as Word (DOCX)
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => activeWorkspace && activeBook && window.open(`/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=pdf`, '_blank')}
                        >
                            Export as PDF
                        </button>
                        <button
                            className={styles.actionBtn}
                            onClick={() => window.print()}
                            style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}
                        >
                            Browser Print Preview
                        </button>
                    </div>
                </div>

                {/* Right Panel: Print Preview Simulation */}
                <div className={styles.previewPanel}>
                    <div
                        className={styles.bookPage}
                        style={{
                            fontFamily: font === 'Garamond' ? '"EB Garamond", serif' :
                                font === 'Baskerville' ? '"Libre Baskerville", serif' :
                                    '"Palatino Linotype", "Book Antiqua", Palatino, serif',
                            maxWidth: trimSize === '5x8' ? '500px' : trimSize === '5.5x8.5' ? '550px' : '600px',
                            minHeight: trimSize === '5x8' ? '800px' : trimSize === '5.5x8.5' ? '850px' : '900px',
                            padding: trimSize === '5x8' ? '3rem' : trimSize === '5.5x8.5' ? '3.5rem' : '4rem',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div
                            className={styles.chapterTitle}
                            style={{
                                textAlign: chapterStyle === 'modern' ? 'left' : 'center',
                                fontFamily: chapterStyle === 'modern' ? 'var(--font-sans)' : 'inherit',
                                fontSize: chapterStyle === 'ornate' ? '2.5rem' : '2rem',
                                borderBottom: chapterStyle === 'modern' ? '2px solid var(--text-primary)' : 'none',
                                paddingBottom: chapterStyle === 'modern' ? '1rem' : '0',
                                textTransform: chapterStyle === 'ornate' ? 'capitalize' : 'uppercase',
                                letterSpacing: chapterStyle === 'modern' ? '0.05em' : '0.2em',
                                position: 'relative'
                            }}
                        >
                            {chapterStyle === 'ornate' && <span style={{ display: 'block', fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontStyle: 'italic', letterSpacing: 'normal' }}>~ {isNonFicProject ? 'Section' : 'Chapter'} Four ~</span>}
                            {chapterStyle === 'ornate' ? (isNonFicProject ? 'The Principles of Growth' : 'The Siege of Kryok') : (isNonFicProject ? 'SECTION FOUR' : 'CHAPTER FOUR')}
                        </div>

                        <p className={styles.pageTextNoIndent}>
                            {dropCapEnabled && (
                                generatedDropCapUrl
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={generatedDropCapUrl} alt="Drop Cap" style={{ float: 'left', height: '4rem', marginRight: '0.75rem', marginTop: '0.2rem', borderRadius: '4px' }} />
                                    : <span className={styles.dropCap}>T</span>
                            )}
                            {dropCapEnabled ? "T" : "T"}{isNonFicProject ? 'he principles of exponential growth dictates that steady application of pressure over time yields compounding results. Business leaders often misunderstand this dynamic. If a company focuses on short-term quarterly gains, they inevitably sacrifice the long-term foundational architecture needed to scale.' : 'he snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, his breath pluming in the frigid air. The Rebellion could not afford to lose this vantage point. If the Hegemony breached the wall, the entire sector would fall within the week.'}
                        </p>

                        <p className={styles.pageText}>
                            {isNonFicProject ? 'In a pivotal study conducted by the Harvard Business Review, over 400 executives were surveyed on their strategic planning cadences. The results were astounding. Less than 12% maintained a rigid commitment to their 5-year visions when faced with immediate market volatility.' : "\"They're coming from the eastern ridge,\" shouted Mira, pointing toward the jagged peaks. She wiped frost from her visor, her expression grim. \"The scanners are picking up heavy armor. Mechanized infantry.\""}
                        </p>

                        <p className={styles.pageText}>
                            {isNonFicProject ? 'We must therefore ask ourselves: how do we build resilient structures? The answer lies not in agility alone, but in anchored agility. It is the ability to pivot tactics while remaining resolute in the core mission.' : 'Aris cursed softly. They had been outmaneuvered. The intelligence reports had promised a skeletal garrison, not a full battalion of shock troops. He signaled the rest of his squad to hold position.'}
                        </p>

                        {ornamentEnabled && (
                            generatedOrnamentUrl
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <div style={{ textAlign: 'center', margin: '2rem 0' }}><img src={generatedOrnamentUrl} alt="Scene Break Ornament" style={{ height: '40px', objectFit: 'contain' }} /></div>
                                : <div className={styles.sceneBreak}>***</div>
                        )}

                        <p className={styles.pageTextNoIndent}>
                            {isNonFicProject ? 'Consider the case of Apollo Systems. In 2018, they faced total market disruption from smaller, leaner startups. Instead of abandoning their enterprise-grade roadmap to chase trend-driven features, they doubled down on their core infrastructure.' : "The first explosion rattled the foundation of the fort. Dust fell from the ancient stone ceiling, coating Aris's armor in a fine, gray powder. The sound was deafening, a concussive wave that vibrated through their boots. The siege had begun."}
                        </p>

                        <p className={styles.pageText}>
                            {isNonFicProject ? 'By 2022, when those agile startups struggled with technical debt and failing scale, Apollo Systems acquired three of their largest competitors. Their foundation proved to be the ultimate competitive moat.' : "\"Hold the line!\" Aris bellowed over the comms channel. \"Nobody fires until I give the order!\""}
                        </p>

                        {generatedInsertUrl && (
                            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>- Plate I -</span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={generatedInsertUrl} alt="Generated Layout Insert" style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid var(--border-color)', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
