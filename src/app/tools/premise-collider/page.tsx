import React from 'react';
import { GitMerge, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PremiseCollider() {
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Concept A</label>
                        <input type="text" placeholder="e.g. Corporate Espionage" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-light)', padding: '0.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', outline: 'none' }} />
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--bg-hover)', borderRadius: '50%', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={24} />
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Concept B</label>
                        <input type="text" placeholder="e.g. Necromancy" style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--border-light)', padding: '0.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', outline: 'none' }} />
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <button style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', transition: 'opacity 0.2s' }}>
                        <GitMerge size={18} /> Collide Concepts
                    </button>
                </div>

                {/* Mock Results Area */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Generated Hooks</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600, color: 'var(--text-secondary)' }}>1</div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>The Soul Ledger</h4>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>In a dystopian corporate state, human resources doesn't just manage the living. A whistleblower discovers her megacorp is enslaving the spirits of deceased employees to process data at zero overhead, and must learn forbidden necromancy to hack their souls free.</p>
                                <button style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Promote to New Project</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
