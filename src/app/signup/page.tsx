'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Loader2, Target } from 'lucide-react';
import styles from '../auth.module.css';
import GradientOrbs from '@/components/marketing/GradientOrbs';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupFormContent() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Auto-select tier based on pricing page query
    const [selectedTier, setSelectedTier] = useState('free');

    useEffect(() => {
        const plan = searchParams.get('plan');
        if (plan === 'pro' || plan === 'master') {
            setSelectedTier(plan);
        }
    }, [searchParams]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    tier: selectedTier
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                throw new Error((data as any).error || 'Registration failed');
            }

            // Immediately sign-in the successfully created user on the client to securely set cookies.
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

            if (loginError) {
                throw new Error(loginError.message);
            }

            router.push('/workspace?onboarding=true');
            router.refresh();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authCard}>
            <Link href="/" className={styles.logo}>
                <BookOpen className={styles.logoIcon} size={28} />
                Versana
            </Link>
            
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Start building your permanent story universe.</p>

            {error && <div className={styles.errorBox}>{error}</div>}

            {selectedTier !== 'free' && (
                <div style={{ background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Target size={14} /> Selected Plan: {selectedTier.toUpperCase()} TRIAL
                </div>
            )}

            <form className={styles.form} onSubmit={handleSignup}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Author / Pen Name</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Jane Austen"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

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
                    <label className={styles.label}>Password</label>
                    <input
                        type="password"
                        className={styles.input}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <button type="submit" className={styles.primaryButton} disabled={isLoading || !email || !password || !fullName}>
                    {isLoading ? <Loader2 size={18} className="spinner" /> : null}
                    Start Writing <ArrowRight size={16} />
                </button>
            </form>

            <div className={styles.footerText}>
                Already have an account? 
                <Link href="/login" className={styles.footerLink}>Sign in</Link>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.spinner { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </div>
    );
}

export default function SignupPage() {
    return (
        <div className={styles.container}>
            <GradientOrbs />
            <Suspense fallback={<div className={styles.authCard}><h1 className={styles.title}>Loading...</h1></div>}>
                <SignupFormContent />
            </Suspense>
        </div>
    );
}
