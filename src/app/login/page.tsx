'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';
import GradientOrbs from '@/components/marketing/GradientOrbs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push('/workspace');
            router.refresh(); // Crucial to update the SSR session state for Nav
        }
    };

    return (
        <div className={styles.container}>
            <GradientOrbs />
            <div className={styles.authCard}>
                <Link href="/" className={styles.logo}>
                    <BookOpen className={styles.logoIcon} size={28} />
                    Versana
                </Link>
                
                <h1 className={styles.title}>Welcome back</h1>
                <p className={styles.subtitle}>Enter your credentials to access your worlds.</p>

                {error && <div className={styles.errorBox}>{error}</div>}

                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="author@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label className={styles.label}>Password</label>
                            <Link href="#" className={styles.footerLink} style={{ fontSize: '0.8rem', marginRight: 0 }}>Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.primaryButton} disabled={isLoading || !email || !password}>
                        {isLoading ? <Loader2 size={18} className="spinner" /> : null}
                        Sign In <ArrowRight size={16} />
                    </button>
                </form>

                <div className={styles.footerText}>
                    Don&apos;t have an account? 
                    <Link href="/signup" className={styles.footerLink}>Sign up</Link>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.spinner { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </div>
    );
}
