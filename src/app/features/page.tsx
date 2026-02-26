import React from 'react';
import { BookOpen, Sparkles, Brain, Shield, PenTool, LayoutTemplate, Map } from 'lucide-react';
import styles from '../marketing.module.css';
import ContextVisualizer from '@/components/marketing/ContextVisualizer';
import MarketingNav from '@/components/layout/MarketingNav';

export default function FeaturesPage() {
    return (
        <div className={styles.container}>
            <MarketingNav />

            <main style={{ paddingBottom: '6rem' }}>

                {/* Core Architecture */}
                <section className={styles.featuresSection} style={{ paddingTop: '6rem' }}>
                    <div className={styles.sectionHeader}>
                        <h1 className={styles.sectionTitle}>An AI That Reads Everything You Write</h1>
                        <p className={styles.sectionSubtitle}>Dive into the technical architecture that enables perfect narrative continuity.</p>
                    </div>

                    <ContextVisualizer />
                </section>

                {/* Core Features */}
                <section className={styles.toolsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Core Platform Features</h2>
                        <p className={styles.sectionSubtitle}>Powerful tools designed specifically to help you build immersive worlds and flawless narratives.</p>
                    </div>

                    <div className={styles.bentoGrid}>
                        {/* Distraction-Free Editor */}
                        <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                            <div className={styles.bentoIconWrapper}><PenTool size={24} /></div>
                            <h3 className={styles.bentoTitle}>Context-Aware Co-Pilot Editor</h3>
                            <p className={styles.bentoDesc}>Distraction-free environment with Smart Lore Tags. Never lose track of character bios, generated scenes, or plot beats.</p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', opacity: 0.9 }}>
                                <div style={{ flex: 2, background: '#ffffff', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ width: '30%', height: '6px', background: '#cbd5e1', borderRadius: '3px', marginBottom: '0.25rem' }} />
                                    <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px' }} />
                                    <div style={{ width: '95%', height: '4px', background: '#f1f5f9', borderRadius: '2px' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                                        <div style={{ width: '20%', height: '4px', background: '#f1f5f9', borderRadius: '2px' }} />
                                        <span style={{ background: '#f3e8ff', color: '#9333ea', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, border: '1px solid #e9d5ff' }}>@Aris</span>
                                        <div style={{ flex: 1, height: '4px', background: '#f1f5f9', borderRadius: '2px' }} />
                                    </div>
                                    <div style={{ width: '85%', height: '4px', background: '#f1f5f9', borderRadius: '2px' }} />
                                </div>
                                <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ width: '60%', height: '4px', background: '#cbd5e1', borderRadius: '2px' }} />
                                    <div style={{ width: '100%', height: '20px', background: '#f3e8ff', borderRadius: '4px', border: '1px solid #e9d5ff' }} />
                                    <div style={{ width: '100%', height: '16px', background: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                                </div>
                            </div>
                        </div>

                        {/* Planning - Wide */}
                        <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                            <div className={styles.bentoIconWrapper}><Map size={24} /></div>
                            <h3 className={styles.bentoTitle}>Visual Kanban & Beat Manager</h3>
                            <p className={styles.bentoDesc}>Map your beats on a visual Kanban board formatted to Save the Cat. Build visual Relationship Node Webs to track character alliances.</p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', overflow: 'hidden' }}>
                                {[1, 2, 3, 4].map(col => (
                                    <div key={col} style={{ width: '120px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ width: '60%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', marginBottom: '0.5rem' }} />
                                        <div style={{ width: '100%', height: '40px', background: '#ffffff', borderRadius: '4px', marginBottom: '0.25rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} />
                                        {col % 2 === 0 && <div style={{ width: '100%', height: '30px', background: '#ffffff', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Formatting - Tall */}
                        <div className={`${styles.bentoCard} ${styles.bentoTall}`}>
                            <div className={styles.bentoIconWrapper}><LayoutTemplate size={24} /></div>
                            <h3 className={styles.bentoTitle}>Automated Typesetting & Formatting</h3>
                            <p className={styles.bentoDesc}>Skip the expensive Vellum subscription. Auto-typeset your manuscript instantly with beautiful Drop Caps, dynamic margins, and completely automated Front and Back matter generation.</p>
                            <div style={{ marginTop: '2rem', flex: 1, background: '#f8fafc', padding: '2rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ textAlign: 'center', fontFamily: 'serif', letterSpacing: '2px', fontSize: '0.7rem', color: '#64748b', marginBottom: '2rem', marginTop: '1rem' }}>CHAPTER ONE</div>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                                    <div style={{ fontSize: '3.5rem', lineHeight: '3rem', fontFamily: 'serif', color: '#0f172a' }}>T</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingTop: '0.4rem' }}>
                                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                        <div style={{ width: '90%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                        <div style={{ width: '95%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                        <div style={{ width: '85%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '1rem' }}>
                                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                    <div style={{ width: '95%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                    <div style={{ width: '90%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                    <div style={{ width: '80%', height: '5px', background: '#e2e8f0', borderRadius: '2px' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 1rem' }}>
                                    <div style={{ borderTop: '1px dashed #cbd5e1', width: '40%' }} />
                                </div>
                            </div>
                        </div>

                        {/* Ideation */}
                        <div className={styles.bentoCard}>
                            <div className={styles.bentoIconWrapper}><Brain size={24} /></div>
                            <h3 className={styles.bentoTitle}>Concept Seed Generator</h3>
                            <p className={styles.bentoDesc}>Generate genre-specific hooks with the Seed Generator, then pressure test your premise in our interactive &quot;What-If&quot; chat engine.</p>
                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                                <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '8px', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)' }} />
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(0, 0, 0, 0.08)', borderRadius: '3px' }} />
                                </div>
                                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '8px', padding: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', marginLeft: '1rem' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: '3px' }} />
                                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Cover Design - WIDE */}
                        <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                            <div className={styles.bentoIconWrapper}><Sparkles size={24} /></div>
                            <h3 className={styles.bentoTitle}>Integrated Cover Generations</h3>
                            <p className={styles.bentoDesc}>We read your entire book and automatically extract the themes into a prompt for our Nano Banana Pro image generation engine.</p>
                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-start', gap: '1.5rem', overflow: 'hidden' }}>
                                {[
                                    'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.2) 100%)',
                                    'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                    'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                                ].map((bg, i) => (
                                    <div key={i} style={{ width: '100px', height: '140px', background: bg, border: '1px solid rgba(0,0,0,0.05)', borderRadius: '4px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', textAlign: 'center' }}>
                                            <div style={{ width: '80%', height: '4px', background: 'rgba(0, 0, 0, 0.3)', margin: '0 auto', borderRadius: '2px' }} />
                                            <div style={{ width: '40%', height: '2px', background: 'rgba(0, 0, 0, 0.2)', margin: '4px auto 0', borderRadius: '1px' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Research - Normal */}
                        <div className={styles.bentoCard}>
                            <div className={styles.bentoIconWrapper}><Shield size={24} /></div>
                            <h3 className={styles.bentoTitle}>Logic & Physics Fact-Checker</h3>
                            <p className={styles.bentoDesc}>An integrated fact-checker that cross-references your magic systems and geography against known physics and logic constraints.</p>
                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ width: '100%', height: '2px', background: 'rgba(0, 0, 0, 0.05)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ width: '40%', height: '6px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '3px' }} />
                                    <div style={{ fontSize: '0.7rem', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.05)', fontWeight: 500 }}>VERIFIED</div>
                                </div>
                            </div>
                        </div>

                        {/* Publish Prep - WIDE */}
                        <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                            <div className={styles.bentoIconWrapper}><BookOpen size={24} /></div>
                            <h3 className={styles.bentoTitle}>One-Click Publishing Export</h3>
                            <p className={styles.bentoDesc}>Export cleanly to EPUB, PDF, and DOCX. Finalize your metadata, blurbs, and marketing materials for a perfect launch.</p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', opacity: 0.9 }}>
                                <div style={{ flex: 1, background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.7rem' }}>EPUB</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ width: '60%', height: '6px', background: '#86efac', borderRadius: '3px', marginBottom: '0.25rem' }} />
                                        <div style={{ width: '40%', height: '4px', background: '#bbf7d0', borderRadius: '2px' }} />
                                    </div>
                                </div>
                                <div style={{ flex: 1, background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.7rem' }}>PDF</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ width: '60%', height: '6px', background: '#93c5fd', borderRadius: '3px', marginBottom: '0.25rem' }} />
                                        <div style={{ width: '40%', height: '4px', background: '#bfdbfe', borderRadius: '2px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7-Phase Workflow Sequential View */}
                <section className={styles.featuresSection} style={{ borderTop: '1px solid var(--border-light)', backgroundColor: '#fdfdfc' }}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The 7-Phase Workflow</h2>
                        <p className={styles.sectionSubtitle}>A clear, linear progression that guides you from your first brilliant idea to a published masterpiece.</p>
                    </div>

                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', left: '32px', top: '24px', bottom: '24px', width: '2px', background: 'linear-gradient(to bottom, var(--accent-terracotta), var(--accent-blue))', zIndex: 0 }} />

                        {[
                            { phase: 1, title: 'Concept & Ideation', desc: 'Brainstorm concepts, genre themes, and generate a rock-solid hook with our interactive chat engine.' },
                            { phase: 2, title: 'Planning & Outlining', desc: 'Map out your beats using proven story structures (like Save the Cat) on a dedicated visual Kanban board.' },
                            { phase: 3, title: 'Deep Research', desc: 'Flesh out your world-building lore, magic systems, character bios, and historical timelines.' },
                            { phase: 4, title: 'Chapter Drafting', desc: 'Write the manuscript alongside our AI Context Matrix that never forgets your lore or plot.' },
                            { phase: 5, title: 'Book Formatting', desc: 'Auto-typeset the manuscript, automatically generate front/back matter, and establish margins.' },
                            { phase: 6, title: 'Cover Design', desc: 'Automatically extract themes from your manuscript to generate high-quality cover art with Nano Banana Pro.' },
                            { phase: 7, title: 'Publish Prep', desc: 'Export cleanly to EPUB/PDF and finalize your metadata, blurbs, and marketing materials for launch.' },
                        ].map((step) => (
                            <div key={step.phase} className={styles.workflowCard}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--bg-hover), #f3f4f6)', border: '2px solid rgba(0,0,0,0.05)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.05)' }}>
                                    {step.phase}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text-primary)', fontWeight: 600 }}>{step.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            <footer className={styles.footer} style={{ marginTop: 'auto' }}>
                <div className={styles.footerInner}>
                    <div className={styles.logo}>
                        <BookOpen className={styles.logoIcon} size={20} />
                        <span className={styles.logoText}>Versana</span>
                    </div>
                    <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} Versana AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
