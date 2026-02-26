import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import styles from '../marketing.module.css';

export default function ManifestoPage() {
    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                    <BookOpen className={styles.logoIcon} size={24} />
                    <span className={styles.logoText}>Versana</span>
                </Link>
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

            <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <article style={{ alignItems: 'flex-start', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.badge} style={{ alignSelf: 'center', marginBottom: '2.5rem' }}>
                        The Versana Philosophy
                    </div>
                    <h1 className={styles.heroTitle} style={{ fontSize: '4.5rem', marginTop: '1rem', letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1.15 }}>
                        AI Should Assist Authors. <br /><em style={{ color: 'var(--accent-terracotta)', fontStyle: 'italic', fontWeight: 400 }}>Not Replace Them.</em>
                    </h1>

                    <div style={{ marginTop: '4rem', fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}>
                        <p style={{ marginBottom: '2rem' }}>
                            <span style={{ float: 'left', fontSize: '5rem', lineHeight: '0.8', paddingTop: '8px', paddingRight: '12px', color: 'var(--accent-terracotta)', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>I</span>n 2024, the web was flooded with low-effort, AI-generated &quot;books&quot; that regurgitated the same generic plots over and over. Chatbots were designed to replace human labor, churning out soulless content by the megabyte.
                        </p>
                        <p style={{ marginBottom: '2rem' }}>
                            We built Versana because we believe the exact opposite.
                        </p>
                        <p style={{ marginBottom: '2.5rem' }}>
                            The magic of a novel is the human soul behind it—the lived experiences, the weird obsessions, the unique voice of the author. An AI cannot generate a soul. It hasn&apos;t lived, it hasn&apos;t felt heartbreak, and it hasn&apos;t stayed awake until 3 AM agonizing over a character arc.
                        </p>

                        <blockquote style={{ margin: '3rem 0', padding: '2rem 3rem', borderLeft: '4px solid var(--accent-terracotta)', background: 'linear-gradient(to right, rgba(234, 88, 12, 0.05), transparent)', borderRadius: '0 12px 12px 0', fontSize: '1.5rem', color: 'var(--text-primary)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6 }}>
                            &quot;But what AI <em>can</em> do, is alleviate the friction of writing.&quot;
                        </blockquote>

                        <p style={{ marginBottom: '2rem' }}>
                            Imagine a world where you never have to interrupt your writing flow to look up what color your protagonist&apos;s eyes are in Chapter 2, because your editor is building a localized wiki on the fly.
                        </p>
                        <p style={{ marginBottom: '2.5rem' }}>
                            Imagine an assistant that doesn&apos;t write the story for you, but acts as a brilliant, untiring sounding board. It asks you the right questions—<em>&quot;What if the villain isn&apos;t lying?&quot;</em>—and helps you crack the plot hole that&apos;s been bothering you for weeks.
                        </p>
                        <p style={{ marginBottom: '3rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            That is Versana. It is an exoskeleton for your creativity.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-light)' }}>
                            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '2rem' }}>
                                — The Versana Team
                            </p>
                            <Link href="/workspace" className={styles.ctaButtonPrimaryLarge}>
                                Join the Rebellion
                            </Link>
                        </div>
                    </div>
                </article>
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
