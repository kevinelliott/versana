import Link from 'next/link';
import { BookOpen, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import styles from '../../marketing.module.css';

// This function enables proper static generation for Next.js, meaning
// we can pre-build thousands of these landing pages at compile time for SEO
export async function generateStaticParams() {
    const genres = [
        'scifi', 'fantasy', 'romance', 'thriller',
        'mystery', 'litrpg', 'horror', 'historical-fiction'
    ];

    return genres.map((genre) => ({
        genre: genre,
    }));
}

// Dynamically generate Meta Tags for SEO ranking
export async function generateMetadata(
    // @ts-ignore
    { params }: { params: Promise<{ genre: string }> }
) {
    // Await the params object in Next.js 15
    const resolvedParams = await params;
    const rawGenre = resolvedParams.genre;

    // Format "sci-fi" to "Sci-Fi", "historical-fiction" to "Historical Fiction"
    const formattedGenre = rawGenre.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return {
        title: `How to Write a ${formattedGenre} Novel - Versana AI`,
        description: `Learn how to write, structure, and publish a bestselling ${formattedGenre} novel using Versana's AI-powered Context Matrix and Story Bible.`,
    };
}


export default async function GenreLandingPage(
    // @ts-ignore
    { params }: { params: Promise<{ genre: string }> }
) {
    // Await params object for dynamic routing in App Router Next.js 15
    const resolvedParams = await params;
    const rawGenre = resolvedParams.genre;

    const formattedGenre = rawGenre.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return (
        <div className={styles.container}>
            {/* Navigation */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                    <BookOpen className={styles.logoIcon} size={24} />
                    <span className={styles.logoText}>Versana</span>
                </Link>
                <div className={styles.navLinks}>
                    <Link href="/features" className={styles.navLink}>Features</Link>
                    <Link href="/manifesto" className={styles.navLink}>The Manifesto</Link>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/workspace" className={styles.ctaButtonPrimary}>
                        Start Writing Free
                    </Link>
                </div>
            </nav>

            <main>
                {/* Dynamic SEO Hero */}
                <section className={styles.heroSection} style={{ paddingBottom: '4rem' }}>
                    <div className={styles.heroContent}>
                        <div className={styles.badge}>
                            <Sparkles size={14} /> The Ultimate Guide to {formattedGenre}
                        </div>
                        <h1 className={styles.heroTitle}>
                            How to Write a Bestselling <br /><em>{formattedGenre}</em> Novel
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Building complex magic systems, intricate futuristic tech, or gripping plot twists? Don't rely on sticky notes. Let Versana's Vector AI remember the details of your {formattedGenre} world while you focus on the prose.
                        </p>
                        <div className={styles.heroActions}>
                            <Link href="/workspace" className={styles.ctaButtonPrimaryLarge}>
                                Start Your {formattedGenre} Project
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Dynamic Value Prop */}
                <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '4rem 2rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', textAlign: 'center' }}>
                            Standard AI Fails at {formattedGenre}.
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                <h3 style={{ color: '#c92a2a', marginBottom: '1rem' }}>The Old Way (ChatGPT)</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>You feed it a prompt about your {formattedGenre} setting. By page 30, it forgets the rules you established and starts inserting generic tropes that ruin your world-building.</p>
                            </div>
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: 'var(--tag-green-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={20} /> The Versana Way</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>Versana stores every rule, character, and location of your {formattedGenre} universe into a secure Vector Database. Every time you ask it to expand a scene, it retrieves the exact lore needed to stay perfectly on-canon.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Standard SEO copy hooks */}
                <section className={styles.problemSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>The 3 Pillars of {formattedGenre}</h2>
                    </div>
                    <div className={styles.problemGrid}>
                        <div className={styles.problemCard}>
                            <h3><CheckCircle2 className={styles.logoIcon} /> 1. Ideation & Tropes</h3>
                            <p>Use Versana's Seed Generator to map out the core {formattedGenre} tropes, and the What-If Engine to subvert them.</p>
                        </div>
                        <div className={styles.problemCard}>
                            <h3><CheckCircle2 className={styles.logoIcon} /> 2. Deep Tracking</h3>
                            <p>Track complicated {formattedGenre} timelines and character alliances using our visual Relationship Web.</p>
                        </div>
                        <div className={styles.problemCard}>
                            <h3><CheckCircle2 className={styles.logoIcon} /> 3. Publishing</h3>
                            <p>Generate blurb copy, extract Amazon/KDP keywords specific to {formattedGenre}, and auto-format your ePub.</p>
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
