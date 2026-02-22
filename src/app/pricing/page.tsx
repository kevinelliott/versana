import Link from 'next/link';
import { BookOpen, Check } from 'lucide-react';
import styles from '../marketing.module.css';

export default function PricingPage() {
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

            <main style={{ padding: '6rem 0' }}>
                <div className={styles.sectionHeader}>
                    <h1 className={styles.sectionTitle}>Simple, Transparent Pricing</h1>
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
