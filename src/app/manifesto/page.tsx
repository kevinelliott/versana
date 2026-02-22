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
                    <Link href="/manifesto" className={styles.navLink}>The Manifesto</Link>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/workspace" className={styles.navLink}>Login</Link>
                    <Link href="/workspace" className={styles.ctaButtonPrimary}>
                        Start Writing Free
                    </Link>
                </div>
            </nav>

            <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <article className={styles.heroContent} style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                    <div className={styles.badge}>
                        The Versana Philosophy
                    </div>
                    <h1 className={styles.heroTitle} style={{ fontSize: '3.5rem', marginTop: '1rem' }}>
                        AI Should Assist Authors. <br /><em>Not Replace Them.</em>
                    </h1>

                    <div className={styles.heroSubtitle} style={{ marginTop: '2rem' }}>
                        <p style={{ marginBottom: '1.5rem' }}>
                            In 2024, the web was flooded with low-effort, AI-generated "books" that regurgitated the same generic plots over and over. Chatbots were designed to replace human labor.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            We built Versana because we believe the exact opposite.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            The magic of a novel is the human soul behind it—the lived experiences, the weird obsessions, the unique voice of the author. An AI cannot generate soul.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>But what AI *can* do, is alleviate the friction of writing.</strong>
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Imagine a world where you never have to interrupt your writing flow to look up what color your protagonist's eyes are in Chapter 2, because your editor has building a localized wiki on the fly.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Imagine an assistant that doesn't write the story for you, but acts as a brilliant, untiring sounding board. It asks you the right questions ("What if the villain isn't lying?") and helps you crack the plot hole that's been bothering you for weeks.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            That is Versana. It is an exoskeleton for your creativity.
                        </p>

                        <div style={{ marginTop: '3rem' }}>
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
