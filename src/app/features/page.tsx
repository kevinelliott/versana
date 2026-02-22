import Link from 'next/link';
import { BookOpen, Sparkles, Brain, Shield, PenTool, LayoutTemplate, Map } from 'lucide-react';
import styles from '../marketing.module.css';
import ContextVisualizer from '@/components/marketing/ContextVisualizer';

export default function FeaturesPage() {
    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                    <BookOpen className={styles.logoIcon} size={24} />
                    <span className={styles.logoText}>Versana</span>
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/features" className={styles.navLink}>Features</Link>
                    <Link href="/manifesto" className={styles.navLink}>The Manifesto</Link>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/workspace" className={styles.navLink}>Login</Link>
                    <Link href="/workspace" className={styles.ctaButtonPrimary}>
                        Start Writing Free
                    </Link>
                </div>
            </nav>

            <main style={{ paddingBottom: '6rem' }}>

                {/* Core Architecture */}
                <section className={styles.featuresSection} style={{ paddingTop: '6rem' }}>
                    <div className={styles.sectionHeader}>
                        <h1 className={styles.sectionTitle}>An AI That Reads Everything You Write</h1>
                        <p className={styles.sectionSubtitle}>Dive into the technical architecture that enables perfect narrative continuity.</p>
                    </div>

                    <ContextVisualizer />
                </section>

                {/* 7 Phases Breakdown */}
                <section className={styles.toolsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The 7-Phase Workspace</h2>
                        <p className={styles.sectionSubtitle}>Everything you need to plan, draft, and publish a best-seller, completely integrated.</p>
                    </div>

                    <div className={styles.bentoGrid}>
                        {/* Phase 4: The Core Editor - Large */}
                        <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
                            <div className={styles.bentoIconWrapper}><PenTool size={24} /></div>
                            <h3 className={styles.bentoTitle}>Phase 4: Chapter Drafting</h3>
                            <p className={styles.bentoDesc}>Distraction-free environment with Smart Lore Tags. See character bios dynamically load as you type their names. Instantly generate scenes from your beats and use the AI Editorial Co-Pilot to refine your prose.</p>
                        </div>

                        {/* Phase 2: Planning - Wide */}
                        <div className={`${styles.bentoCard} ${styles.bentoWide}`}>
                            <div className={styles.bentoIconWrapper}><Map size={24} /></div>
                            <h3 className={styles.bentoTitle}>Phase 2: Planning & Outlining</h3>
                            <p className={styles.bentoDesc}>Map your beats on a visual Kanban board formatted to Save the Cat. Build visual Relationship Node Webs to track character alliances.</p>
                        </div>

                        {/* Phase 5: Formatting - Tall */}
                        <div className={`${styles.bentoCard} ${styles.bentoTall}`}>
                            <div className={styles.bentoIconWrapper}><LayoutTemplate size={24} /></div>
                            <h3 className={styles.bentoTitle}>Phase 5: Book Formatting</h3>
                            <p className={styles.bentoDesc}>Skip the expensive Vellum subscription. Auto-typeset your manuscript instantly with beautiful Drop Caps, dynamic margins, and completely automated Front and Back matter generation.</p>
                        </div>

                        {/* Phase 1: Ideation */}
                        <div className={styles.bentoCard}>
                            <div className={styles.bentoIconWrapper}><Brain size={24} /></div>
                            <h3 className={styles.bentoTitle}>Phase 1: Concept & Ideation</h3>
                            <p className={styles.bentoDesc}>Generate genre-specific hooks with the Seed Generator, then pressure test your premise in our interactive "What-If" chat engine.</p>
                        </div>

                        {/* Phase 3: Research */}
                        <div className={styles.bentoCard}>
                            <div className={styles.bentoIconWrapper}><Shield size={24} /></div>
                            <h3 className={styles.bentoTitle}>Phase 3: Deep Research</h3>
                            <p className={styles.bentoDesc}>An integrated fact-checker that cross-references your magic systems and geography against known physics and logic constraints.</p>
                        </div>

                        {/* Phase 6: Cover Design */}
                        <div className={styles.bentoCard}>
                            <div className={styles.bentoIconWrapper}><Sparkles size={24} /></div>
                            <h3 className={styles.bentoTitle}>Phase 6: Cover Design</h3>
                            <p className={styles.bentoDesc}>We read your entire book and automatically extract the themes into a prompt for our Nano Banana Pro image generation engine.</p>
                        </div>
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
