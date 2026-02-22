'use client';

import React, { useState } from 'react';
import { Activity, ShieldCheck, CheckSquare, RefreshCw } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function DeepEdits() {
    const { chapters } = useWorkspace();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate a deep AI scan across multiple chapters
        setTimeout(() => {
            setAnalysisResult({
                pacing: "Your rising action across chapters 3-5 is a bit slow compared to industry standards.",
                characters: "In chapter 4, Mira uses a blaster, but in chapter 2 you established she only uses melee weapons.",
                grammar: "12 complex run-on sentences detected."
            });
            setIsAnalyzing(false);
        }, 3000);
    };

    return (
        <div style={{ padding: '2rem 4rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Phase 5: Revisions & Deep Edits</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Run global consistency checks, pacing analysis, and refine prose before layout design.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '2rem', minHeight: '400px' }}>

                    {!analysisResult && !isAnalyzing && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            <ShieldCheck size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h3>Ready for Deep Scan</h3>
                            <p style={{ textAlign: 'center', maxWidth: '400px', marginTop: '0.5rem' }}>
                                Scan your entire manuscript against the Context Matrix to find continuity errors, plot holes, and structural weaknesses.
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
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Looking for plot holes and checking character consistency.</p>
                        </div>
                    )}

                    {analysisResult && (
                        <div style={{ animation: 'fadeIn 0.3s ease' }}>
                            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={24} color="var(--tag-purple-text)" /> Analysis Complete
                            </h2>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--tag-blue-text)' }}>
                                <h4 style={{ color: 'var(--tag-blue-text)', marginBottom: '0.5rem' }}>Pacing & Structure</h4>
                                <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{analysisResult.pacing}</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--tag-gold-text)' }}>
                                <h4 style={{ color: 'var(--tag-gold-text)', marginBottom: '0.5rem' }}>Character Arc Consistency</h4>
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
