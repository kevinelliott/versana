import Link from 'next/link';
import { BookOpen, Check } from 'lucide-react';
import styles from '../marketing.module.css';
import MarketingNav from '@/components/layout/MarketingNav';

export default function PricingPage() {
    return (
        <div className={styles.container}>
            <MarketingNav />

            <main style={{ padding: '6rem 0' }}>
                <div className={styles.sectionHeader}>
                    <h1 className={styles.sectionTitle}>Simple, Transparent Pricing</h1>
                    <p className={styles.sectionSubtitle}>Write your first book for free. Upgrade when you need infinite memory.</p>
                </div>

                <div className={styles.pricingGrid}>
                    <div className={styles.pricingCard}>
                        <h3>Wordcrafter</h3>
                        <div className={styles.price}>$15<span>/mo</span></div>
                        <p className={styles.pricingDesc}>For emerging writers establishing their first interconnected universe.</p>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Includes:</div>
                        <ul className={styles.pricingFeatures}>
                            <li><Check size={16} /> <strong>2 Active Book Projects</strong></li>
                            <li><Check size={16} /> <strong>Permanent Story Bible Memory</strong></li>
                            <li><Check size={16} /> 250,000 AI words / month</li>
                        </ul>
                        <Link href="/signup?plan=pro" className={styles.pricingBtnOutline}>Start 7-Day Trial</Link>
                    </div>

                    <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                        <div className={styles.featuredBadge}>Most Popular</div>
                        <h3>Pro Author</h3>
                        <div className={styles.price}>$39<span>/mo</span></div>
                        <p className={styles.pricingDesc}>For dedicated novelists who need their AI to remember everything.</p>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Everything in Wordcrafter, plus:</div>
                        <ul className={styles.pricingFeatures}>
                            <li><Check size={16} /> <strong>5 Active Book Projects</strong></li>
                            <li><Check size={16} /> 1,000,000 AI words / month</li>
                            <li><Check size={16} /> Market Research & Visual Boards</li>
                            <li><Check size={16} /> Advanced Co-Pilot features</li>
                        </ul>
                        <Link href="/signup?plan=pro" className={styles.pricingBtnPrimary}>Start Pro Trial</Link>
                    </div>

                    <div className={styles.pricingCard}>
                        <h3>Master</h3>
                        <div className={styles.price}>$89<span>/mo</span></div>
                        <p className={styles.pricingDesc}>For rapid-release authors and publishing teams.</p>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Everything in Pro Author, plus:</div>
                        <ul className={styles.pricingFeatures}>
                            <li><Check size={16} /> <strong>Unlimited Book Projects</strong></li>
                            <li><Check size={16} /> <strong>Unlimited AI Words</strong></li>
                            <li><Check size={16} /> Professional Cover Design Engine</li>
                            <li><Check size={16} /> Instant eBook Export</li>
                        </ul>
                        <Link href="/signup?plan=master" className={styles.pricingBtnOutline}>Go Master</Link>
                    </div>
                </div>

                <div className={styles.freeTierBanner}>
                    <div className={styles.freeTierDetails} style={{ flex: 1 }}>
                        <h3>Hobbyist</h3>
                        <p>Perfect for exploring ideas and drafting short stories.</p>
                    </div>
                    <div className={styles.freeTierFeatures}>
                        <span className={styles.freeTierFeature}><Check size={16} /> 1 Active Book Project</span>
                        <span className={styles.freeTierFeature}><Check size={16} /> Temporary AI Memory</span>
                        <span className={styles.freeTierFeature}><Check size={16} /> 50k words / mo</span>
                    </div>
                    <div className={styles.freeTierAction} style={{ flex: 1, alignItems: 'flex-end' }}>
                        <div className={styles.price}>$0<span>/mo</span></div>
                        <Link href="/signup?plan=free" className={styles.pricingBtnOutline} style={{ width: '100%', maxWidth: '200px', padding: '0.6rem' }}>Get Started Free</Link>
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
                        <h3 className={styles.faqQuestion}>What exactly is &quot;Permanent Story Bible Memory&quot;?</h3>
                        <p className={styles.faqAnswer}>Standard AI forgets your protagonist&apos;s eye color by chapter three. Versana silently builds a secure database of your universe as you write, ensuring it always knows your characters, lore, and plot.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3 className={styles.faqQuestion}>What happens if I downgrade from Pro to Hobbyist?</h3>
                        <p className={styles.faqAnswer}>Your books are always safe. If you downgrade, your permanent memory databases become read-only, and you&apos;ll be limited to 1 active project at a time.</p>
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
