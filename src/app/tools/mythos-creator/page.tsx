'use client';

import React, { useState } from 'react';
import { ScrollText, Wand2, Sparkles, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function MythosCreator() {
    const [topic, setTopic] = useState('An ancient sun-worshipping desert religion');
    const [result, setResult] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateMythos = async () => {
        setIsGenerating(true);
        setResult(null);
        try {
            const res = await fetch('/api/ai/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Mock workspace ID since this is a standalone tool
                    workspaceId: 'sandbox',
                    systemPrompt: 'You are an expert world-builder and linguist. Generate a highly detailed and coherent mythos, fictional religion, or naming convention based on the user prompt. Include a summary, key tenets/rules, and 5 example vocabulary words or names with meanings. Output in clear markdown format.',
                    messages: [{ role: 'user', content: `Generate a mythos based on: ${topic}` }]
                })
            });

            // Handle the streaming response correctly as we updated in PublishPrep
            const text = await res.text();
            setResult(text);
        } catch (e) {
            console.error("Failed to generate mythos:", e);
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
                    <ScrollText size={28} color="var(--tag-gold-text)" /> Mythology & Linguistics Creator
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '3rem' }}>
                    An isolated sandbox to generate coherent fictional religions, mythos, or naming conventions without committing them to a Lore Bible.
                </p>

                {/* Input Area */}
                <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '3rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Wand2 size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                        <textarea
                            placeholder="Describe your desired mythos (e.g. 'A deep sea cult that worships bioluminescent leviathans...')"
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
                                minHeight: '120px',
                                resize: 'vertical'
                            }}
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            style={{
                                background: 'var(--tag-gold-bg)',
                                color: 'var(--tag-gold-text)',
                                border: '1px solid var(--tag-gold-text)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                fontSize: '0.95rem',
                                fontWeight: 500,
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onClick={generateMythos}
                            disabled={isGenerating}
                        >
                            {isGenerating ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
                            {isGenerating ? 'Conjuring...' : 'Generate Mythos'}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {result && (
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '1px solid var(--tag-gold-text)',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--tag-gold-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <ScrollText size={20} /> Generated Mythos
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
                                <Save size={14} /> Save to Sandbox
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
