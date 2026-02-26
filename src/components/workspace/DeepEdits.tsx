'use client';

import React, { useState } from 'react';
import { Activity, ShieldCheck, CheckSquare, RefreshCw, Zap, Layers, Bug } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function DeepEdits() {
    const { chapters, activeWorkspace } = useWorkspace();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ pacing: string, characters: string, grammar: string } | null>(null);

    // Fact Checker State
    const [activeTab, setActiveTab] = useState<'deep_edit' | 'fact_check'>('deep_edit');
    const [isFactChecking, setIsFactChecking] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [factCheckType, setFactCheckType] = useState<'logic' | 'physics'>('logic');
    const [factCheckResults, setFactCheckResults] = useState<{ title: string, status: string, explanation: string }[] | null>(null);
    const [seedSuccess, setSeedSuccess] = useState(false);

    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;

    const handleAnalyze = async () => {
        if (!activeWorkspace) return;
        setIsAnalyzing(true);
        try {
            // Fetch Lore
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const lore = await loreRes.json();

            // Gather and flatten text from all chapters
            let fullText = '';
            for (const ch of chapters) {
                const chRes = await fetch(`/api/chapters/${ch.id}`);
                const chData = await chRes.json();

                if (chData && chData.content) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const flattenNodes = (node: any): string => {
                        if (node.type === 'text') return node.text || '';
                        if (node.content) return node.content.map(flattenNodes).join('') + '\n';
                        return '';
                    };
                    fullText += `\n\n--- Chapter: ${ch.title} ---\n\n`;
                    fullText += flattenNodes(chData.content);
                }
            }

            if (!fullText.trim()) {
                setAnalysisResult({
                    pacing: "Your manuscript is empty. Start writing in Phase 4 first.",
                    characters: "No characters found to analyze.",
                    grammar: "No text found to analyze."
                });
                setIsAnalyzing(false);
                return;
            }

            // Hit the API
            const res = await fetch('/api/ai/deep-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText, lore, workspaceId: activeWorkspace.id })
            });

            if (res.ok) {
                const data = await res.json();
                setAnalysisResult(data);
            } else {
                console.error("Deep Edit Error:", await res.text());
                setAnalysisResult({
                    pacing: "Error: Could not analyze manuscript.",
                    characters: "Error...",
                    grammar: "Error..."
                });
            }
        } catch (e) {
            console.error("Deep Edits Error:", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFactCheck = async () => {
        if (!activeWorkspace) return;
        setIsFactChecking(true);
        setFactCheckResults(null);
        try {
            const loreRes = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
            const lore = await loreRes.json();

            const res = await fetch('/api/ai/fact-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lore, checkType: factCheckType })
            });

            if (res.ok) {
                const data = await res.json();
                setFactCheckResults(data.findings);
            } else {
                console.error("Fact-Check Error:", await res.text());
                setFactCheckResults([]);
            }
        } catch (e) {
            console.error("Fact-Check Error:", e);
        } finally {
            setIsFactChecking(false);
        }
    };

    const handleSeedDefectiveLore = async () => {
        if (!activeWorkspace) return;
        setIsSeeding(true);
        try {
            await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: 'The Amulet of Pyria',
                    type: 'Magic System',
                    synopsis: 'An ancient necklace that produces infinite thermal energy and mass out of nothing, yet the universe otherwise operates strictly on hard Newtonian physics and the laws of thermodynamics.'
                })
            });

            await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace.id,
                    name: 'The Eagle Ride to Mordoria',
                    type: 'Plot Hook',
                    synopsis: 'The heroes must walk for 6 months across deadly terrain to cast the ring into the volcano. Friendly giant eagles who could fly them there in a day exist and are allied with the heroes, but the characters simply choose to walk without ever discussing the eagles.'
                })
            });

            setSeedSuccess(true);
        } catch (e) {
            console.error("Seed error:", e);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
            {seedSuccess && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div className="glass-panel" style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', maxWidth: '400px', border: '1px solid var(--border-light)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Seed Successful</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Successfully seeded defective lore! Run the Logic & Physics audits to see the Fact-Checker catch them.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSeedSuccess(false)}
                                style={{ background: 'var(--accent-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Phase 5: {isNonFicProject ? 'Review & Fact-Checking' : 'Revisions & Deep Edits'}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>{isNonFicProject ? 'Run global consistency checks, factual audits, and refine prose.' : 'Run global consistency checks, pacing analysis, and refine prose before layout design.'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem 2rem 2rem', minHeight: '400px' }}>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                        <button
                            onClick={() => setActiveTab('deep_edit')}
                            style={{ background: 'transparent', border: 'none', padding: '0.5rem', fontWeight: activeTab === 'deep_edit' ? 600 : 400, color: activeTab === 'deep_edit' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'deep_edit' ? '2px solid var(--text-primary)' : 'none' }}>
                            {isNonFicProject ? 'Thematic & Tone Scan' : 'Narrative Deep Edit'}
                        </button>
                        <button
                            onClick={() => setActiveTab('fact_check')}
                            style={{ background: 'transparent', border: 'none', padding: '0.5rem', fontWeight: activeTab === 'fact_check' ? 600 : 400, color: activeTab === 'fact_check' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', borderBottom: activeTab === 'fact_check' ? '2px solid var(--text-primary)' : 'none' }}>
                            {isNonFicProject ? 'Logic & Fact Auditor' : 'Logic & Physics Fact-Checker'}
                        </button>
                    </div>

                    {activeTab === 'deep_edit' && (
                        <>
                            {!analysisResult && !isAnalyzing && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                                    <ShieldCheck size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                                    <h3>Ready for Deep Scan</h3>
                                    <p style={{ textAlign: 'center', maxWidth: '400px', marginTop: '0.5rem' }}>
                                        {isNonFicProject ? 'Scan your entire manuscript against your Knowledge Base to find structural weaknesses, tone inconsistencies, and unsupported claims.' : 'Scan your entire manuscript against the Context Matrix to find continuity errors, plot holes, and structural weaknesses.'}
                                    </p>
                                    <button
                                        onClick={handleAnalyze}
                                        style={{
                                            marginTop: '2rem',
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--tag-purple-bg)',
                                            color: 'var(--tag-purple-text)',
                                            border: '1px solid var(--tag-purple-text)',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                        <Activity size={18} /> Begin Full Manuscript Analysis
                                    </button>
                                </div>
                            )}

                            {isAnalyzing && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--tag-purple-text)' }}>
                                    <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem' }} />
                                    <h3>Running AI Deep Scan...</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {isNonFicProject ? 'Looking for logical gaps and checking tone consistency.' : 'Looking for plot holes and checking character consistency.'}
                                    </p>
                                </div>
                            )}

                            {analysisResult && (
                                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldCheck size={24} color="var(--tag-purple-text)" /> Analysis Complete
                                    </h2>

                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--tag-blue-text)' }}>
                                        <h4 style={{ color: 'var(--tag-blue-text)', marginBottom: '0.5rem' }}>{isNonFicProject ? 'Flow & Structure' : 'Pacing & Structure'}</h4>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{analysisResult.pacing}</p>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--tag-gold-text)' }}>
                                        <h4 style={{ color: 'var(--tag-gold-text)', marginBottom: '0.5rem' }}>{isNonFicProject ? 'Tone & Authority' : 'Character Arc Consistency'}</h4>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{analysisResult.characters}</p>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--tag-green-text)' }}>
                                        <h4 style={{ color: 'var(--tag-green-text)', marginBottom: '0.5rem' }}>Prose & Grammar</h4>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{analysisResult.grammar}</p>
                                    </div>

                                    <button onClick={() => setAnalysisResult(null)} style={{ background: 'transparent', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        Clear Results
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'fact_check' && (
                        <>
                            {!factCheckResults && !isFactChecking && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', minHeight: '300px' }}>
                                    <Zap size={48} style={{ opacity: 0.5, marginBottom: '1rem', color: 'var(--tag-gold-text)' }} />
                                    <h3>Audit {isNonFicProject ? 'Project Content' : 'World Logic'}</h3>
                                    <p style={{ textAlign: 'center', maxWidth: '400px', marginTop: '0.5rem' }}>
                                        {isNonFicProject ? 'Cross-reference your arguments and data points internally within your Knowledge Base.' : 'Cross-reference your magic systems and geography against known physics and logic constraints internally within your Lore Bible.'}
                                    </p>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" name="checkType" value="logic" checked={factCheckType === 'logic'} onChange={() => setFactCheckType('logic')} />
                                            {isNonFicProject ? 'Structural Logic' : 'Narrative Logic'}
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" name="checkType" value="physics" checked={factCheckType === 'physics'} onChange={() => setFactCheckType('physics')} />
                                            {isNonFicProject ? 'Domain Constraints' : 'Hard Science / Physics'}
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleFactCheck}
                                        style={{
                                            padding: '0.75rem 1.5rem',
                                            background: '#fef3c7',
                                            color: '#b45309',
                                            border: '1px solid #fde68a',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                        <Layers size={18} /> Run Audit on {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}
                                    </button>

                                    <button
                                        onClick={handleSeedDefectiveLore}
                                        disabled={isSeeding}
                                        style={{
                                            marginTop: '1.5rem',
                                            padding: '0.5rem 1rem',
                                            background: 'transparent',
                                            color: 'var(--text-secondary)',
                                            border: '1px dashed var(--border-light)',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                        <Bug size={14} /> {isSeeding ? 'Seeding Defective Lore...' : 'Demo: Insert Defective Lore'}
                                    </button>
                                </div>
                            )}

                            {isFactChecking && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--tag-gold-text)', minHeight: '300px' }}>
                                    <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem' }} />
                                    <h3>Analyzing Matrix Vectors...</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Comparing constraints across {activeWorkspace?.name || (isNonFicProject ? 'project' : 'universe')}</p>
                                </div>
                            )}

                            {factCheckResults && factCheckResults.length > 0 && (
                                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Zap size={24} color="var(--tag-gold-text)" /> Audit Findings
                                    </h2>

                                    {factCheckResults.map((finding, idx) => (
                                        <div key={idx} style={{
                                            marginBottom: '1rem',
                                            padding: '1rem',
                                            background: 'var(--bg-primary)',
                                            borderRadius: '8px',
                                            borderLeft: `4px solid ${finding.status === 'VERIFIED' ? '#22c55e' : finding.status === 'FLAGGED' ? '#ef4444' : '#f59e0b'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h4 style={{ color: 'var(--text-primary)' }}>{finding.title}</h4>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px',
                                                    background: finding.status === 'VERIFIED' ? '#f0fdf4' : finding.status === 'FLAGGED' ? '#fef2f2' : '#fffbeb',
                                                    color: finding.status === 'VERIFIED' ? '#16a34a' : finding.status === 'FLAGGED' ? '#dc2626' : '#d97706',
                                                    border: `1px solid ${finding.status === 'VERIFIED' ? '#bbf7d0' : finding.status === 'FLAGGED' ? '#fecaca' : '#fde68a'}`
                                                }}>
                                                    {finding.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{finding.explanation}</p>
                                        </div>
                                    ))}

                                    <button onClick={() => setFactCheckResults(null)} style={{ background: 'transparent', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                        Clear Results
                                    </button>
                                </div>
                            )}

                            {factCheckResults && factCheckResults.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
                                    {isNonFicProject ? 'Your Knowledge Base looks perfectly consistent!' : 'Your Context Matrix looks perfectly consistent!'}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckSquare size={18} /> Revisions Checklist
                        </h3>
                        {chapters.map(ch => (
                            <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                                <input type="checkbox" style={{ cursor: 'pointer' }} />
                                <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
