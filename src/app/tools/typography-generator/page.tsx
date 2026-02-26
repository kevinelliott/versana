'use client';

import React, { useState } from 'react';
import { Type, Sparkles, Loader2, Download, Maximize2, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export default function TypographyGenerator() {
    const [prompt, setPrompt] = useState('An ornate, illuminated manuscript style capital letter "M", intertwined with metallic vines and glowing neon blue runes, dark moody background, highly detailed vector art, perfectly symmetrical.');
    const [textType, setTextType] = useState('drop-cap');
    const [theme, setTheme] = useState('Sci-Fi Fantasy');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateTypography = async () => {
        setIsGenerating(true);
        setResultUrl(null);

        try {
            const res = await fetch('/api/ai/generate-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    type: textType === 'drop-cap' ? 'Drop Cap Letter' : 'Scene Break Ornament',
                    style: `${theme} typography style, transparent or flat background, clean edges.`
                })
            });

            const data = await res.json();
            if (data.url) {
                setResultUrl(data.url);
            }
        } catch (e) {
            console.error("Failed to generate typography asset:", e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <Link href="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    &larr; Back to Standalone Tools
                </Link>

                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    <Type size={28} color="var(--accent-terracotta)" /> Nano Banana Typography
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem' }}>
                    Generate beautiful drop caps, scene break flourishes, and title typography assets directly from text prompts.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Input Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Typography Prompt</label>
                                <div style={{ position: 'relative' }}>
                                    <LayoutTemplate size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                                    <textarea
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-light)',
                                            background: 'var(--bg-primary)',
                                            fontSize: '1rem',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            minHeight: '120px',
                                            resize: 'vertical'
                                        }}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Asset Type</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                                        value={textType}
                                        onChange={(e) => setTextType(e.target.value)}
                                    >
                                        <option value="drop-cap">Drop Cap Letter</option>
                                        <option value="scene-break">Scene Break Ornament</option>
                                        <option value="title-logo">Title Treatment Logo</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Thematic Style</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                    >
                                        <option value="Sci-Fi Fantasy">Sci-Fi Fantasy</option>
                                        <option value="High Fantasy">High Fantasy Gothic</option>
                                        <option value="Cyberpunk">Cyberpunk Neon</option>
                                        <option value="Victorian">Victorian Steampunk</option>
                                        <option value="Minimalist">Modern Minimalist</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                style={{
                                    background: 'var(--accent-terracotta)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    width: '100%'
                                }}
                                onClick={generateTypography}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                                {isGenerating ? 'Rendering Typography...' : 'Generate Vector Asset'}
                            </button>
                        </div>
                    </div>

                    {/* Output/Canvas Area */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '400px'
                    }}>
                        {!resultUrl && !isGenerating && (
                            <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <Type size={48} opacity={0.2} />
                                <span>Your generated typography will appear here.</span>
                            </div>
                        )}

                        {isGenerating && (
                            <div style={{ color: 'var(--accent-terracotta)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <div className="pulse-circle-typography"></div>
                                <span style={{ fontWeight: 500 }}>Rendering curves and glyphs...</span>
                            </div>
                        )}

                        {resultUrl && !isGenerating && (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={resultUrl}
                                    alt="Generated Typography Asset"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        background: '#fff' // Better for examining typical typography assets
                                    }}
                                    crossOrigin="anonymous"
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '1rem',
                                    right: '1rem',
                                    display: 'flex',
                                    gap: '0.5rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Full Screen">
                                        <Maximize2 size={18} />
                                    </button>
                                    <button
                                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        title="Download"
                                        onClick={() => window.open(resultUrl, '_blank')}
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .spinner { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    .pulse-circle-typography {
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: var(--accent-terracotta);
                        animation: pulse-typography 1.5s infinite ease-out;
                    }
                    @keyframes pulse-typography {
                        0% { transform: scale(0.8); opacity: 0.8; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                `}} />
            </div>
        </div>
    );
}
