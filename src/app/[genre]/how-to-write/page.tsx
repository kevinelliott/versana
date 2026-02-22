import Link from 'next/link';
import { BookOpen, Sparkles, Database, CheckCircle2 } from 'lucide-react';
import styles from '../../marketing.module.css';

const GENRE_CMS_DATA: Record<string, { painPoint: string, feature1: string, feature2: string, sub: string }> = {
    'scifi': {
        painPoint: "By page 30, ChatGPT forgets your FTL drive capabilities and starts inserting generic tropes.",
        feature1: "Use the Seed Generator to map out your core cyberpunk or space opera tropes.",
        feature2: "Track complex interstellar alliances and galactic federations via the visual Relationship Web.",
        sub: "cybernetics, FTL travel rules, planetary ecologies, or alien politics"
    },
    'fantasy': {
        painPoint: "By chapter 3, traditional AI forgets the rigid rules of your hard magic system.",
        feature1: "Generate deep lore for ancient prophecies, mythic beasts, and royal bloodlines.",
        feature2: "Track political factions, noble houses, and secret covens using the Relationship Web.",
        sub: "hard magic systems, pantheons of gods, ancient ruins, or epic multi-continent journeys"
    },
    'romance': {
        painPoint: "AI struggles to maintain the emotional pacing and tension between your key love interests.",
        feature1: "Outline the vital 'Meet Cute', 'False Victory', and 'Dark Moment' using our specific Romance beat sheets.",
        feature2: "Track the emotional distance and intimacy between characters via the Relationship Web.",
        sub: "slow-burn tension, enemies-to-lovers dynamics, romantic pacing, or emotional stakes"
    },
    'thriller': {
        painPoint: "AI tools often spoil the plot twist too early or fail to maintain narrative tension.",
        feature1: "Plot out intricate red herrings and false clues using our detailed Chapter Manager.",
        feature2: "Track suspects, motives, and hidden alliances via the dynamic Relationship Web.",
        sub: "high-stakes ticking clocks, unreliable narrators, gripping plot twists, or suspenseful pacing"
    },
    'historical-fiction': {
        painPoint: "General AI frequently hallucinates modern anachronisms into your historically accurate setting.",
        feature1: "Use the Research Assistant to automatically pull historically accurate facts into your Context Matrix.",
        feature2: "Track real-world historical figures and their relationships with your fictional characters.",
        sub: "accurate period details, realistic historical figures, dialect, or strict timelines"
    },
    'litrpg': {
        painPoint: "AI easily forgets complex stat blocks, inventory management, and leveling progression.",
        feature1: "Keep rigid track of character sheets, skill trees, and EXP requirements in the Lore Bible.",
        feature2: "Visually map party dynamics, raid alliances, and rival guilds on the Relationship Web.",
        sub: "complex stat tables, progression systems, intricate skill trees, or crunchy mechanics"
    }
};

const DEFAULT_CMS = {
    painPoint: "By page 30, standard AI forgets the rules you established and starts inserting generic tropes that ruin your world-building.",
    feature1: "Use Versana's Seed Generator to map out the core tropes, and the What-If Engine to subvert them.",
    feature2: "Track complicated timelines and character alliances using our visual Relationship Web.",
    sub: "intricate logic, overarching lore, or gripping plot twists"
};

export async function generateStaticParams() {
    return Object.keys(GENRE_CMS_DATA).map((genre) => ({
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

    const cmsData = GENRE_CMS_DATA[rawGenre] || DEFAULT_CMS;

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
                            Building {cmsData.sub}? Don't rely on sticky notes. Let Versana's Vector AI remember the details of your {formattedGenre} world while you focus on the prose.
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
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{cmsData.painPoint}</p>
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
                            <p>{cmsData.feature1}</p>
                        </div>
                        <div className={styles.problemCard}>
                            <h3><CheckCircle2 className={styles.logoIcon} /> 2. Deep Tracking</h3>
                            <p>{cmsData.feature2}</p>
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
