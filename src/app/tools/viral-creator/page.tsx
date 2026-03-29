'use client';

import React, { useState } from 'react';
import { Share2, FileVideo, Sparkles, Loader2, Save, PenTool } from 'lucide-react';
import Link from 'next/link';

export default function ViralCreator() {
    const [topic, setTopic] = useState('An intro highlighting my magic system where spells cost memories');
    const [platform, setPlatform] = useState('TikTok Hook & Script');
    const [result, setResult] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateViralAsset = async () => {
        setIsGenerating(true);
        setResult(null);
        try {
            const res = await fetch('/api/tools/viral-creator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, platform })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to generate asset';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                throw new Error(`⚠️ System Notification: ${errMsg}`);
            }

            const data = await res.json();
            setResult(data.asset);
        } catch (e) {
            console.error("Failed to generate asset:", e);
            setResult("An error occurred during generation. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Link href="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    &larr; Back to Standalone Tools
                </Link>

                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    <Share2 size={28} color="var(--tag-green-text)" /> Viral Asset Creator
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem' }}>
                    AI scripts for TikTok/Reel videos, Instagram carousel quotes, and author newsletter drafts optimized for engagement.
                </p>

                {/* Input Area */}
                <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Platform & Format</label>
                        <select
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', marginBottom: '1rem' }}
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                        >
                            <option value="TikTok/Reel Hook & Script">TikTok / IG Reel (Hook & Script)</option>
                            <option value="Instagram Carousel Outline">Instagram Carousel (Outline & Copy)</option>
                            <option value="Author Newsletter Draft">Author Newsletter (Storytelling Frame)</option>
                            <option value="Twitter/X Thread">Twitter/X Thread Hook</option>
                        </select>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <PenTool size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                        <textarea
                            placeholder="Describe your hook, premise, or the specific scene you want to adapt..."
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)',
                                background: 'var(--bg-primary)',
                                fontSize: '1.1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                marginBottom: '1.5rem',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            style={{
                                background: 'var(--tag-green-bg)',
                                color: 'var(--tag-green-text)',
                                border: '1px solid var(--tag-green-text)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={generateViralAsset}
                            disabled={isGenerating}
                        >
                            {isGenerating ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                            {isGenerating ? 'Structuring...' : 'Generate Format'}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {result && (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid var(--tag-green-text)',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--tag-green-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <FileVideo size={20} /> Optimized Script
                            </h3>
                            <button style={{
                                background: 'transparent',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-secondary)',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Save size={14} /> Copy to Clipboard
                            </button>
                        </div>

                        <div
                            style={{
                                color: 'var(--text-primary)',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.95rem'
                            }}
                        >
                            {result}
                        </div>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .spinner { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}} />
            </div>
        </div>
    );
}
