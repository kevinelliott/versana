import Link from 'next/link';
import { BookOpen, Sparkles, Brain, Shield, ArrowRight, Check } from 'lucide-react';
import styles from './marketing.module.css';
import ContextVisualizer from '@/components/marketing/ContextVisualizer';

export default function MarketingPage() {
    return (
        <div className={styles.container}>
            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <BookOpen className={styles.logoIcon} size={24} />
                    <span className={styles.logoText}>Versana</span>
                </div>
                <div className={styles.navLinks}>
                    <a href="#features" className={styles.navLink}>Features</a>
                    <a href="#pricing" className={styles.navLink}>Pricing</a>
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
                            <Sparkles size={14} /> The World's First RAG-Powered Co-Writer
                        </div>
                        <h1 className={styles.heroTitle}>
                            Write brilliant fiction with an AI that <em>never</em> forgets.
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Stop fighting with chatbots that lose the plot after three scenes. Versana uses a Dynamic Context Matrix to remember every character, location, and lore detail across a massive multi-book series.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/workspace" className={styles.ctaButtonPrimaryLarge}>
                                Start Your Novel <ArrowRight size={18} />
                            </Link>
                            <a href="#visualizer" className={styles.ctaButtonSecondaryLarge}>
                                See How It Works
                            </a>
                        </div>
                    </div>
                </section>

                {/* Visualizer Section */}
                <section id="visualizer" className={styles.visualizerSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The Context Matrix</h2>
                        <p className={styles.sectionSubtitle}>
                            Traditional AI loses context fast. Versana automatically builds a Vector Story Bible as you write, ensuring it always knows what's happening.
                        </p>
                    </div>
                    <ContextVisualizer />
                </section>

                {/* Features Section */}
                <section id="features" className={styles.featuresSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>A Complete Author Toolchain</h2>
                        <p className={styles.sectionSubtitle}>Everything you need from the first spark of an idea to the final published manuscript.</p>
                    </div>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><Brain size={24} /></div>
                            <h3>7-Phase Architecture</h3>
                            <p>Guided workflows for Ideation, Outlining, World-Building, Drafting, Formatting, Cover Design, and Publishing.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><Shield size={24} /></div>
                            <h3>Absolute Isolation</h3>
                            <p>Multiple Workspaces ensure the lore from your Sci-Fi epic never bleeds into your Fantasy romance.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}><Sparkles size={24} /></div>
                            <h3>Smart Lore Tags</h3>
                            <p>Hover over any character or place in your manuscript to instantly pull up its active standing in the Story Bible.</p>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className={styles.pricingSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
                        <p className={styles.sectionSubtitle}>Write your first book for free. Upgrade when you need infinite memory.</p>
                    </div>

                    <div className={styles.pricingGrid}>
                        <div className={styles.pricingCard}>
                            <h3>Hobbyist</h3>
                            <div className={styles.price}>$0<span>/mo</span></div>
                            <p className={styles.pricingDesc}>Perfect for exploring ideas and drafting short stories.</p>
                            <ul className={styles.pricingFeatures}>
                                <li><Check size={16} /> 1 Active Workspace</li>
                                <li><Check size={16} /> Session-only Context Matrix</li>
                                <li><Check size={16} /> 50,000 AI words / month</li>
                                <li><Check size={16} /> Standard TipTap Editor</li>
                            </ul>
                            <Link href="/workspace" className={styles.pricingBtnOutline}>Get Started</Link>
                        </div>

                        <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                            <div className={styles.featuredBadge}>Most Popular</div>
                            <h3>Pro Author</h3>
                            <div className={styles.price}>$19<span>/mo</span></div>
                            <p className={styles.pricingDesc}>For dedicated novelists who need permanent memory.</p>
                            <ul className={styles.pricingFeatures}>
                                <li><Check size={16} /> 3 Active Workspaces</li>
                                <li><Check size={16} /> <strong>Persistent Vector DB Memory</strong></li>
                                <li><Check size={16} /> 500,000 AI words / month</li>
                                <li><Check size={16} /> Market Research & Asset Tools</li>
                                <li><Check size={16} /> Advanced Co-Pilot features</li>
                            </ul>
                            <Link href="/workspace" className={styles.pricingBtnPrimary}>Start Pro Trial</Link>
                        </div>

                        <div className={styles.pricingCard}>
                            <h3>Master</h3>
                            <div className={styles.price}>$49<span>/mo</span></div>
                            <p className={styles.pricingDesc}>For rapid-release authors and publishing teams.</p>
                            <ul className={styles.pricingFeatures}>
                                <li><Check size={16} /> Unlimited Workspaces</li>
                                <li><Check size={16} /> Persistent Vector DB Memory</li>
                                <li><Check size={16} /> <strong>Unlimited AI Words</strong></li>
                                <li><Check size={16} /> Nano Banana Pro Cover Gen</li>
                                <li><Check size={16} /> Auto-Typesetting & Hosted Mini-Sites</li>
                            </ul>
                            <Link href="/workspace" className={styles.pricingBtnOutline}>Go Master</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
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
