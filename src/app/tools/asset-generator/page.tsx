'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Wand2, Sparkles, Loader2, Download, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AssetGenerator() {
    const [prompt, setPrompt] = useState('A sprawling cyberpunk metropolis with neon pink and cyan lights, rain slicked streets, flying cars, cinematic lighting, highly detailed');
    const [style, setStyle] = useState('Cinematic Concept Art');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateAsset = async () => {
        setIsGenerating(true);
        setResultUrl(null);
        setEnhancedPrompt(null);

        try {
            const res = await fetch('/api/ai/generate-asset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    type: "Environment Concept",
                    style: `${style}, Aspect Ratio: ${aspectRatio}`
                })
            });

            const data = await res.json();
            if (data.url) {
                setResultUrl(data.url);
            }
            if (data.promptUsed) {
                setEnhancedPrompt(data.promptUsed);
            }
        } catch (e) {
            console.error("Failed to generate asset:", e);
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
                    <ImageIcon size={28} color="var(--accent-blue)" /> Standalone Asset Generator
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem' }}>
                    Generate character portraits, mood boards, or architecture reference concepts using Nano Banana Pro.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Input Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Image Prompt</label>
                                <div style={{ position: 'relative' }}>
                                    <Wand2 size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
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
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Art Style</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                    >
                                        <option value="Cinematic Concept Art">Cinematic Concept Art</option>
                                        <option value="Anime / Manga">Anime / Manga</option>
                                        <option value="Dark Fantasy">Dark Fantasy</option>
                                        <option value="Minimalist Vector">Minimalist Vector</option>
                                        <option value="Photorealistic">Photorealistic</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aspect Ratio</label>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                    >
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                        <option value="2:3">2:3 (Book Cover)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                style={{
                                    background: 'var(--accent-blue)',
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
                                onClick={generateAsset}
                                disabled={isGenerating}
                            >
                                {isGenerating ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                                {isGenerating ? 'Rendering Asset...' : 'Generate with Nano Banana Pro'}
                            </button>
                        </div>

                        {enhancedPrompt && (
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Optimized Prompt</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    {enhancedPrompt}
                                </p>
                            </div>
                        )}
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
                                <ImageIcon size={48} opacity={0.2} />
                                <span>Your generated asset will appear here.</span>
                            </div>
                        )}

                        {isGenerating && (
                            <div style={{ color: 'var(--accent-blue)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <div className="pulse-circle"></div>
                                <span style={{ fontWeight: 500 }}>Nano Banana Pro is dreaming...</span>
                            </div>
                        )}

                        {resultUrl && !isGenerating && (
                            <>
                                <img
                                    src={resultUrl}
                                    alt="Generated Asset"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        background: '#111'
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
                    .pulse-circle {
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        background: var(--accent-blue);
                        animation: pulse 1.5s infinite ease-out;
                    }
                    @keyframes pulse {
                        0% { transform: scale(0.8); opacity: 0.8; }
                        100% { transform: scale(1.5); opacity: 0; }
                    }
                `}} />
            </div>
        </div>
    );
}
