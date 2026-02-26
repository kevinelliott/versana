'use client';

import React, { useState } from 'react';
import { GitMerge, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PremiseHook {
    title: string;
    description: string;
}

export default function PremiseCollider() {
    const [conceptA, setConceptA] = useState("Corporate Espionage");
    const [conceptB, setConceptB] = useState("Necromancy");
    const [isColliding, setIsColliding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hooks, setHooks] = useState<PremiseHook[]>([]);

    const handleCollide = async () => {
        if (!conceptA.trim() || !conceptB.trim()) return;

        setIsColliding(true);
        setError(null);
        setHooks([]);

        try {
            const res = await fetch('/api/tools/premise-collider', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conceptA, conceptB }),
            });

            if (!res.ok) {
                throw new Error('Failed to collide the concepts.');
            }

            const data = await res.json();
            if (data?.hooks) {
                setHooks(data.hooks);
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'An error occurred during collision.');
        } finally {
            setIsColliding(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link href="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    &larr; Back to Standalone Tools
                </Link>

                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    <GitMerge size={28} color="var(--tag-purple-text)" /> Premise Collider
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem' }}>
                    Merge two seemingly unrelated concepts into a cohesive, unique hook for isolated brainstorming.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Concept A</label>
                        <input
                            type="text"
                            placeholder="e.g. Corporate Espionage"
                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-light)', padding: '0.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', outline: 'none' }}
                            value={conceptA}
                            onChange={(e) => setConceptA(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCollide()}
                        />
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--bg-hover)', borderRadius: '50%', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={24} />
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Concept B</label>
                        <input
                            type="text"
                            placeholder="e.g. Necromancy"
                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-light)', padding: '0.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', outline: 'none' }}
                            value={conceptB}
                            onChange={(e) => setConceptB(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCollide()}
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ color: 'var(--accent-terracotta)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <button
                        onClick={handleCollide}
                        disabled={isColliding}
                        style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 500, cursor: isColliding ? 'not-allowed' : 'pointer', opacity: isColliding ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'opacity 0.2s' }}>
                        {isColliding ? <><Loader2 size={18} className="spin" /> Colliding...</> : <><GitMerge size={18} /> Collide Concepts</>}
                    </button>
                </div>

                {/* Results Area */}
                {hooks.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '3rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Generated Hooks</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {hooks.map((hook, idx) => (
                                <div key={idx} style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600, color: 'var(--text-secondary)' }}>{idx + 1}</div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{hook.title}</h4>
                                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{hook.description}</p>
                                        <button style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Promote to New Project</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
