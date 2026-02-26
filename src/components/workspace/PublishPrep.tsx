'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Tag, Globe, Download, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import styles from './PublishPrep.module.css';
import workspaceStyles from './Workspace.module.css';

import { useWorkspace } from '@/context/WorkspaceContext';

export default function PublishPrep() {
    const { activeWorkspace, activeBook } = useWorkspace();
    const [isCopied, setIsCopied] = useState(false);
    const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    // UI State
    const [blurb, setBlurb] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);
    const [bisac, setBisac] = useState<string[]>([]);

    // Loading State
    const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
    const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
    const [isExtractingMeta, setIsExtractingMeta] = useState(false);

    const handleUpdatePreview = () => {
        setIsUpdatingPreview(true);
        setTimeout(() => setIsUpdatingPreview(false), 1500);
    };

    const generateBlurb = async () => {
        if (!activeWorkspace) return;
        setIsGeneratingBlurb(true);
        try {
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();
            const contextText = Array.isArray(loreData) ? loreData.map((e: { name: string, type: string, synopsis: string }) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n') : '';

            const res = await fetch('/api/tools/blurb-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contextText, workspaceId: activeWorkspace.id })
            });
            const data = await res.json();
            if (data.blurb) setBlurb(data.blurb);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingBlurb(false);
        }
    };

    const generateShortPitch = async () => {
        if (!activeWorkspace) return;
        setIsGeneratingPitch(true);
        try {
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();
            const contextText = Array.isArray(loreData) ? loreData.map((e: { name: string, type: string, synopsis: string }) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n') : '';

            const res = await fetch('/api/tools/blurb-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contextText, workspaceId: activeWorkspace.id, type: 'short' })
            });
            const data = await res.json();
            if (data.blurb) setBlurb(data.blurb);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingPitch(false);
        }
    };

    const extractMetadata = async () => {
        if (!activeWorkspace) return;
        setIsExtractingMeta(true);
        try {
            const res = await fetch('/api/tools/metadata-extractor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blurb: blurb || (isNonFicProject ? 'A comprehensive guide solving a real-world problem.' : 'Science fiction space opera with a rogue captain.'), workspaceId: activeWorkspace.id })
            });
            const json = await res.json();
            if (json.keywords) setKeywords(json.keywords);
            if (json.bisac) setBisac(json.bisac);

        } catch (e) {
            console.error(e);
        } finally {
            setIsExtractingMeta(false);
        }
    };

    return (
        <div className={workspaceStyles.workspaceContainer}>
            <div className={workspaceStyles.workspaceGlobalHeader}>
                <h1 className={workspaceStyles.phaseTitle}>
                    <span className={workspaceStyles.phaseLabel}>Phase 8</span>
                    Publishing & Marketing Prep
                </h1>
                <p className={workspaceStyles.phaseSubtitle}>Generate optimized blurbs, extract metadata, and export your final manuscript.</p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.gridContainer}`}>
                {/* Column 1: Generators */}
                <div className={styles.column}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Sparkles size={18} color="var(--tag-purple-text)" /> Blurb & Synopsis Generator
                        </h3>
                        <p className={styles.cardDesc}>
                            {isNonFicProject ? 'Versana synthesizes your entire Knowledge Base to write a compelling Amazon/KDP book description highlighting core arguments and value propositions.' : 'Versana synthesizes your entire Context Matrix to write a compelling Amazon/KDP book description highlighting core tropes.'}
                        </p>
                        <textarea
                            className={styles.textareaBox}
                            value={blurb}
                            onChange={(e) => setBlurb(e.target.value)}
                            placeholder="Your blurb will appear here..."
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button className={styles.buttonSecondary} onClick={generateShortPitch} disabled={isGeneratingPitch || isGeneratingBlurb}>
                                {isGeneratingPitch ? 'Generating...' : 'Generate Short Pitch'}
                            </button>
                            <button className={styles.buttonPrimary} onClick={generateBlurb} disabled={isGeneratingBlurb || isGeneratingPitch}>
                                {isGeneratingBlurb ? 'Generating...' : 'Regenerate Blurb'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Tag size={18} /> Metadata Extractor
                        </h3>
                        <p className={styles.cardDesc}>
                            AI-extracted keywords and recommended BISAC categories for optimal KDP ranking.
                            <br /><br />
                            <button
                                className={styles.buttonSecondary}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'fit-content' }}
                                onClick={extractMetadata}
                                disabled={isExtractingMeta}
                            >
                                {isExtractingMeta ? 'Extracting...' : 'Extract Metadata'}
                            </button>
                        </p>

                        <div className={styles.tagGroup} style={{ marginBottom: '1rem' }}>
                            <div className={styles.tagLabel}>Top SEO Keywords</div>
                            <div className={styles.tagList}>
                                {keywords.length > 0 ? keywords.map(kw => (
                                    <span key={kw} className={styles.tag}>{kw}</span>
                                )) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No keywords extracted yet.</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.tagGroup}>
                            <div className={styles.tagLabel}>Recommended BISAC</div>
                            <div className={styles.tagList}>
                                {bisac.length > 0 ? bisac.map(b => (
                                    <span key={b} className={styles.tag}>{b}</span>
                                )) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No BISAC categories extracted yet.</span>
                                )}
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
                            <span className={styles.shareLink}>
                                {activeBook ? `versana.app/read/${activeBook.id}` : 'versana.app/read/the-winter-siege'}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className={styles.buttonSecondary} style={{ padding: '0.5rem', width: 'auto' }} onClick={() => {
                                    if (activeBook) {
                                        navigator.clipboard.writeText(`https://versana.app/read/${activeBook.id}`);
                                    }
                                    setIsCopied(true);
                                    setTimeout(() => setIsCopied(false), 2000);
                                }} title="Copy Link">
                                    {isCopied ? <CheckCircle2 size={16} color="var(--tag-green-text)" /> : <Copy size={16} />}
                                </button>
                                <button className={styles.buttonSecondary} style={{ padding: '0.5rem', width: 'auto' }} title="Open in new tab" onClick={() => window.open(`/read/${activeBook?.id}`, '_blank')}>
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                        <button
                            className={styles.buttonPrimary}
                            style={{ marginTop: '1rem' }}
                            onClick={handleUpdatePreview}
                            disabled={isUpdatingPreview}
                        >
                            {isUpdatingPreview ? 'Updating Live Site...' : 'Update Published Preview'}
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
                            <button
                                className={styles.buttonPrimary}
                                style={{ background: 'var(--text-primary)', justifyContent: 'space-between', padding: '1rem' }}
                                onClick={() => activeWorkspace && activeBook && window.open(`/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=epub`, '_blank')}
                            >
                                <span>Export Complete ePub 3.0</span>
                                <BookOpen size={16} />
                            </button>
                            <button
                                className={styles.buttonSecondary}
                                style={{ justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-primary)' }}
                                onClick={() => window.print()}
                            >
                                <span>Export Print-Ready PDF (6x9)</span>
                                <Download size={16} />
                            </button>
                            <button
                                className={styles.buttonSecondary}
                                style={{ justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-primary)' }}
                                onClick={() => activeWorkspace && activeBook && window.open(`/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=docx`, '_blank')}
                            >
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
