'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Tag, Globe, Download, Copy, ExternalLink, CheckCircle2, Loader2, TrendingUp, Eye, Heart } from 'lucide-react';
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
    const [error, setError] = useState<string | null>(null);

    // Pen Name State
    const [penNames, setPenNames] = useState<{ id: string, name: string }[]>([]);
    const [selectedPenName, setSelectedPenName] = useState<string>('');

    React.useEffect(() => {
        const fetchPenNames = async () => {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase.from('author_profiles').select('id, name').order('name');
            if (data && data.length > 0) {
                setPenNames(data);
                if (activeBook?.pen_name_id) {
                    setSelectedPenName(activeBook.pen_name_id);
                } else {
                    setSelectedPenName(data[0].id);
                }
            }
        };
        fetchPenNames();
    }, [activeBook?.id, activeBook?.pen_name_id]);

    const handleUpdatePreview = () => {
        setIsUpdatingPreview(true);
        setTimeout(() => setIsUpdatingPreview(false), 1500);
    };

    const generateBlurb = async () => {
        if (!activeWorkspace) return;
        setIsGeneratingBlurb(true);
        setError(null);
        try {
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();
            const contextText = Array.isArray(loreData) ? loreData.map((e: { name: string, type: string, synopsis: string }) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n') : '';

            const res = await fetch('/api/tools/blurb-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contextText, workspaceId: activeWorkspace.id })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate blurb';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            if (data.blurb) setBlurb(data.blurb);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGeneratingBlurb(false);
        }
    };

    const generateShortPitch = async () => {
        if (!activeWorkspace) return;
        setIsGeneratingPitch(true);
        setError(null);
        try {
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const loreData = await loreRes.json();
            const contextText = Array.isArray(loreData) ? loreData.map((e: { name: string, type: string, synopsis: string }) => `${e.name} (${e.type}): ${e.synopsis}`).join('\n') : '';

            const res = await fetch('/api/tools/blurb-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contextText, workspaceId: activeWorkspace.id, type: 'short' })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate pitch';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            if (data.blurb) setBlurb(data.blurb);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred");
        } finally {
            setIsGeneratingPitch(false);
        }
    };

    const extractMetadata = async () => {
        if (!activeWorkspace) return;
        setIsExtractingMeta(true);
        setError(null);
        try {
            const res = await fetch('/api/tools/metadata-extractor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blurb: blurb || (isNonFicProject ? 'A comprehensive guide solving a real-world problem.' : 'Science fiction space opera with a rogue captain.'), workspaceId: activeWorkspace.id })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to extract metadata';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const json = await res.json();
            if (json.keywords) setKeywords(json.keywords);
            if (json.bisac) setBisac(json.bisac);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An error occurred");
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
                    {error && (
                        <div style={{ color: 'var(--bg-primary)', background: 'var(--accent-terracotta)', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}
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
                            <button className={styles.buttonSecondary} onClick={generateShortPitch} disabled={isGeneratingPitch || isGeneratingBlurb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {isGeneratingPitch ? <><Loader2 size={14} className="spinner" /> Generating...</> : 'Generate Short Pitch'}
                            </button>
                            <button className={styles.buttonPrimary} onClick={generateBlurb} disabled={isGeneratingBlurb || isGeneratingPitch} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {isGeneratingBlurb ? <><Loader2 size={14} className="spinner" /> Generating...</> : 'Regenerate Blurb'}
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
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                onClick={extractMetadata}
                                disabled={isExtractingMeta}
                            >
                                {isExtractingMeta ? <><Loader2 size={12} className="spinner" /> Extracting...</> : 'Extract Metadata'}
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

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <input 
                                type="checkbox" 
                                id="publicToggle"
                                checked={activeBook?.is_public || false}
                                onChange={async (e) => {
                                    const checked = e.target.checked;
                                    
                                    if (checked && penNames.length === 0) {
                                        alert("Please create a Pen Name in your Profile Settings first!");
                                        return;
                                    }

                                    if (activeBook) {
                                        try {
                                            await fetch(`/api/books/${activeBook.id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ 
                                                    is_public: checked,
                                                    ...(checked && selectedPenName ? { pen_name_id: selectedPenName } : {})
                                                })
                                            });
                                            // Mock activeBook update visually
                                            activeBook.is_public = checked;
                                            if (checked) activeBook.pen_name_id = selectedPenName;
                                        } catch (err) {
                                            console.error("Failed to update public status", err);
                                            e.target.checked = !checked;
                                        }
                                    }
                                }}
                                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--tag-purple-text)', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="publicToggle" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Publish to Discover Hub</label>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allow readers globally to find your book on the Versana homepage.</span>
                            </div>
                        </div>

                        {activeBook?.is_public === false && penNames.length > 0 && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Select Pen Name</label>
                                <select 
                                    className={styles.formInput} 
                                    value={selectedPenName} 
                                    onChange={(e) => setSelectedPenName(e.target.value)}
                                    style={{ padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
                                >
                                    {penNames.map(pn => (
                                        <option key={pn.id} value={pn.id}>{pn.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {activeBook?.is_public === false && penNames.length === 0 && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', color: '#92400e', borderRadius: '6px', fontSize: '0.8rem' }}>
                                ⚠️ You must create an Author Pen Name in your Profile before distributing publicly.
                            </div>
                        )}
                        <button
                            className={styles.buttonPrimary}
                            style={{ marginTop: '1rem' }}
                            onClick={handleUpdatePreview}
                            disabled={isUpdatingPreview}
                        >
                            {isUpdatingPreview ? 'Updating Live Site...' : 'Update Published Preview'}
                        </button>
                    </div>

                    <div className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                                <TrendingUp size={18} color="var(--tag-green-text)" /> Discover Analytics
                            </h3>
                            {activeBook?.is_public ? (
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--tag-green-bg)', color: 'var(--tag-green-text)', borderRadius: '12px', fontWeight: 600 }}>LIVE</span>
                            ) : (
                                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--tag-red-bg)', color: 'var(--tag-red-text)', borderRadius: '12px', fontWeight: 600 }}>OFFLINE</span>
                            )}
                        </div>
                        <p className={styles.cardDesc}>
                            Track engagement for your manuscript published on the Versana public network.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <Eye size={16} /> Total Views
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {activeBook?.total_views?.toLocaleString() || '0'}
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <Heart size={16} color="var(--accent-terracotta)" /> Likes / Tips
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {activeBook?.total_likes?.toLocaleString() || '0'}
                                </div>
                            </div>
                        </div>
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
                                onClick={() => activeWorkspace && activeBook && window.open(`/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=pdf`, '_blank')}
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
