'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import styles from '@/app/marketing.module.css';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function MarketingNav() {
    return (
        <nav className={styles.nav} style={{ backgroundColor: 'var(--bg-primary)' }}>
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
                <ThemeToggle />
                <Link href="/workspace" className={styles.ctaButtonPrimary}>
                    Start Writing Free
                </Link>
            </div>
        </nav>
    );
}
