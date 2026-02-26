import Link from 'next/link';
import { BookOpen, Sparkles, Brain, ArrowRight, PenTool, LayoutTemplate } from 'lucide-react';
import styles from './marketing.module.css';
import ContextVisualizer from '@/components/marketing/ContextVisualizer';
import GradientOrbs from '@/components/marketing/GradientOrbs';

export default function MarketingPage() {
    return (
        <div className={styles.container}>
            <GradientOrbs />
            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <BookOpen className={styles.logoIcon} size={24} />
                    <span className={styles.logoText}>Versana</span>
                </div>
                <div className={styles.navLinks}>
                    <Link href="/features" className={styles.navLink}>Features</Link>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/manifesto" className={styles.navLink}>The Manifesto</Link>
                    <Link href="/docs" className={styles.navLink}>Docs</Link>
                    <Link href="/workspace" className={styles.navLink}>Login</Link>
                    <Link href="/workspace" className={styles.ctaButtonPrimary}>
                        Start Writing Free
                    </Link>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <div className={styles.badge}>
                            <Sparkles size={14} /> Overcome Writer&apos;s Block Forever.
                        </div>
                        <h1 className={styles.heroTitle}>
                            Your Co-Author That <em>Never Sleeps</em>.
                        </h1>
                        <p className={styles.heroSubtitle}>
                            From Idea to Published in Record Time. Standard chatbots forget your main character&apos;s name by chapter three—Versana automatically builds a flawless, persistent memory of your entire universe as you write.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/workspace" className={styles.ctaButtonPrimaryLarge}>
                                Start Your First Book <ArrowRight size={18} />
                            </Link>
                            <a href="#the-problem" className={styles.ctaButtonSecondaryLarge}>
                                See Why Writers Switch
                            </a>
                        </div>
                    </div>
                </section>

                {/* The Problem Section */}
                <section id="the-problem" className={styles.problemSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The &quot;Amnesia&quot; Problem</h2>
                        <p className={styles.sectionSubtitle}>
                            Standard AI tools like ChatGPT or Claude are great for a single scene. But write a 90,000-word novel, and they hallucinate. They resurrect dead characters, forget rules of magic, and lose the plot entirely.
                        </p>
                    </div>

                    <div className={styles.problemGrid}>
                        <div className={styles.problemCard}>
                            <div className={styles.problemIcon}>❌</div>
                            <h3>Standard AI Forgets</h3>
                            <p>By page 50, the AI has forgotten the foreshadowing you laid in chapter one. It turns your gritty thriller into a generic action movie.</p>
                        </div>
                        <div className={styles.problemCard}>
                            <div className={styles.problemIcon}>❌</div>
                            <h3>Messy Prompting</h3>
                            <p>You waste hours copying and pasting your 10-page character sheets into the chat window every time you start a new session.</p>
                        </div>
                        <div className={styles.problemCard}>
                            <div className={styles.problemIcon}>✨</div>
                            <h3 className={styles.accentText}>Versana Remembers</h3>
                            <p>We built a permanent &quot;Context Matrix&quot; into the editor. It reads your manuscript and saves every detail to a secure database. It never forgets.</p>
                        </div>
                    </div>
                </section>

                {/* Visualizer Section */}
                <section id="visualizer" className={styles.visualizerSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>See The Difference</h2>
                        <p className={styles.sectionSubtitle}>
                            Watch how Versana&apos;s persistent memory saves the day when a standard AI fails.
                        </p>
                    </div>
                    <ContextVisualizer />
                </section>

                {/* Tools Section */}
                <section id="tools" className={styles.toolsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>From Idea to Published</h2>
                        <p className={styles.sectionSubtitle}>We replaced your 15 different writing apps with one beautifully streamlined studio designed specifically to get your book across the finish line.</p>
                    </div>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><Brain size={24} /></div>
                            <h3>The Ideation Engine</h3>
                            <p>Overcome writer&apos;s block. Our AI acts as a sounding board, asking you tough &quot;What If&quot; questions to pressure-test your premise before you outline. Generate conflict out of thin air.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><PenTool size={24} /></div>
                            <h3>Smart Lore Editor</h3>
                            <p>Write freely. When you type a character&apos;s name, Versana subtly underlines it. Hover over it to instantly view their bio, without breaking your flow. Your Co-Author handles the details.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><LayoutTemplate size={24} /></div>
                            <h3>Instant Typesetting</h3>
                            <p>Stop fighting Microsoft Word margins. When your draft is done, Versana generates a beautifully typeset, Vellum-quality ePub ready for Amazon KDP in literal seconds.</p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link href="/features" className={styles.ctaButtonSecondaryLarge}>See All 7 Phases of Writing <ArrowRight size={18} /></Link>
                    </div>
                </section>

            </main>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.logo}>
                        <BookOpen className={styles.logoIcon} size={20} />
                        <span className={styles.logoText}>Versana</span>
                    </div>
                    <div className={styles.footerLinks}>
                        <Link href="/features">Features</Link>
                        <Link href="/pricing">Pricing</Link>
                        <a href="#">Terms of Service</a>
                    </div>
                    <p className={styles.footerCopy}>&copy; {new Date().getFullYear()} Versana AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
