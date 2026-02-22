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
                            <li><Check size={16} /> 1 Active Book Project</li>
                            <li><Check size={16} /> Temporary AI Memory (Forgets after close)</li>
                            <li><Check size={16} /> 50,000 AI-generated words / month</li>
                            <li><Check size={16} /> Distraction-Free Editor</li>
                        </ul>
                        <Link href="/workspace" className={styles.pricingBtnOutline}>Get Started</Link>
                    </div>

                    <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                        <div className={styles.featuredBadge}>Most Popular</div>
                        <h3>Pro Author</h3>
                        <div className={styles.price}>$19<span>/mo</span></div>
                        <p className={styles.pricingDesc}>For dedicated novelists who need their AI to remember everything.</p>
                        <ul className={styles.pricingFeatures}>
                            <li><Check size={16} /> 3 Active Book Projects</li>
                            <li><Check size={16} /> <strong>Permanent Story Bible Memory</strong></li>
                            <li><Check size={16} /> 500,000 AI-generated words / month</li>
                            <li><Check size={16} /> Market Research & Visual Boards</li>
                            <li><Check size={16} /> Advanced Co-Pilot features</li>
                        </ul>
                        <Link href="/workspace" className={styles.pricingBtnPrimary}>Start Pro Trial</Link>
                    </div>

                    <div className={styles.pricingCard}>
                        <h3>Master</h3>
                        <div className={styles.price}>$49<span>/mo</span></div>
                        <p className={styles.pricingDesc}>For rapid-release authors and publishing teams.</p>
                        <ul className={styles.pricingFeatures}>
                            <li><Check size={16} /> Unlimited Book Projects</li>
                            <li><Check size={16} /> Permanent Story Bible Memory</li>
                            <li><Check size={16} /> <strong>Unlimited AI Words</strong></li>
                            <li><Check size={16} /> Professional Cover Design Engine</li>
                            <li><Check size={16} /> Instant eBook Export & Promo Sites</li>
                        </ul>
                        <Link href="/workspace" className={styles.pricingBtnOutline}>Go Master</Link>
                    </div>
                </div>

                <div className={styles.faqSection}>
                    <div className={styles.faqHeader}>
                        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
                    </div>
                    <div className={styles.faqItem}>
                        <h3 className={styles.faqQuestion}>Is my writing used to train the AI?</h3>
                        <p className={styles.faqAnswer}>Absolutely not. Your intellectual property is 100% yours. We do not and will never use your private manuscripts to train public LLM models.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3 className={styles.faqQuestion}>What exactly is "Permanent Story Bible Memory"?</h3>
                        <p className={styles.faqAnswer}>Standard AI forgets your protagonist's eye color by chapter three. Versana silently builds a secure database of your universe as you write, ensuring it always knows your characters, lore, and plot.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3 className={styles.faqQuestion}>What happens if I downgrade from Pro to Hobbyist?</h3>
                        <p className={styles.faqAnswer}>Your books are always safe. If you downgrade, your permanent memory databases become read-only, and you'll be limited to 1 active project at a time.</p>
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
