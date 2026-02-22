import React from 'react';
import { LineChart, Search, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MarketAnalyzer() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Link href="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    &larr; Back to Standalone Tools
                </Link>

                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    <LineChart size={28} color="var(--tag-blue-text)" /> Market Trend & Trope Analyzer
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem' }}>
                    Evaluate your premise against current Amazon/KDP market trends to identify overused clichés and unique subversion opportunities.
                </p>

                {/* Input Area */}
                <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '3rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                        <input
                            type="text"
                            placeholder="Enter a genre, trope, or high-level premise (e.g. 'Enemies to Lovers in a Cyberpunk city')"
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-primary)',
                                fontSize: '1.1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                marginBottom: '1.5rem'
                            }}
                            defaultValue="Enemies to Lovers in a Cyberpunk city"
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}>
                            Analyze Market
                        </button>
                    </div>
                </div>

                {/* Mock Results Dashboard */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                    {/* Left Column: Analysis */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                <TrendingUp size={18} color="var(--tag-green-text)" /> Current Market Viability
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>78%</div>
                                <div style={{ color: 'var(--text-secondary)', paddingBottom: '0.5rem' }}>High Demand, High Competition</div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                "Cyberpunk Romance" is currently experiencing a 42% YoY growth on Amazon KDP, driven heavily by successful indie authors and recent media adaptations. However, the exact "Enemies to Lovers" trope within this space is approaching saturation.
                            </p>
                        </div>

                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                <AlertCircle size={18} color="var(--accent-terracotta)" /> Tropes to Subvert
                            </h3>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>The Cop and the Hacker</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overused. Try: The Corporate Auditor and the Street Ripper Doc.</span>
                                </li>
                                <li style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                                    <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Rainy Neon Monologues</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reader fatigue detected. Try focusing on a daytime, starkly lit, high-class corporate sector to contrast the usual grit.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Key Metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Est. Reader Demographic</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Age 18-35 (65% Female)</div>
                        </div>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Top Target Keyword</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-secondary)', display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>#SciFiRomance</div>
                        </div>
                        <div style={{ padding: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '12px', background: 'var(--bg-primary)' }}>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ideal Word Count</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>75,000 - 90,000 words</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>Readers of this niche prefer fast-paced, action-heavy narratives over sprawling epics.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
