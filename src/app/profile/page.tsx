'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, User as UserIcon, LogOut, Settings, CreditCard, ArrowLeft, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import styles from './profile.module.css';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    subscription_tier: string;
}

interface UserUsage {
    tokens: number;
    limit: number;
    usagePercent: number;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [usage, setUsage] = useState<UserUsage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isManagingBilling, setIsManagingBilling] = useState(false);

    const [showStripeModal, setShowStripeModal] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch basic user profile
                const proRes = await fetch('/api/user/profile');
                if (proRes.ok) {
                    const data = await proRes.json();
                    setProfile(data);

                    // Based on tier, calculate limits
                    const currentTokens = data.tokens_used || 0;
                    let limit = 50000;
                    if (data.subscription_tier === 'pro') limit = 1000000;
                    else if (data.subscription_tier === 'master') limit = 999999999; // unlimited

                    setUsage({
                        tokens: currentTokens,
                        limit,
                        usagePercent: limit > 0 ? Math.min(100, Math.round((currentTokens / limit) * 100)) : 0
                    });
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleMockBilling = () => {
        setIsManagingBilling(true);
        setTimeout(() => {
            setIsManagingBilling(false);
            setShowStripeModal(true);
        }, 1500);
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading your profile...</div>;
    }

    if (!profile) {
        return (
            <div className={styles.loading}>
                <p>Not authenticated.</p>
                <Link href="/workspace" className={styles.backBtn}>Return to Workspace</Link>
            </div>
        );
    }

    const { email, full_name, subscription_tier } = profile;

    return (
        <div className={styles.container}>
            <header className={styles.topbar}>
                <Link href="/workspace" className={styles.backLink}>
                    <ArrowLeft size={18} /> Back to Workspace
                </Link>
                <div className={styles.logo}>
                    <BookOpen size={20} className={styles.logoIcon} />
                    <span className={styles.logoText}>Versana Profile</span>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.grid}>

                    {/* LEFT COLUMN: User Info & Nav */}
                    <div className={styles.column}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatar}>
                                <UserIcon size={40} color="var(--text-secondary)" />
                            </div>
                            <h2 className={styles.userName}>{full_name || 'Versana Author'}</h2>
                            <p className={styles.userEmail}>{email || 'author@versana.app'}</p>

                            <div className={styles.tierBadge}>
                                Current Tier: <strong>{subscription_tier.toUpperCase()}</strong>
                            </div>
                        </div>

                        <nav className={styles.profileNav}>
                            <button className={`${styles.navItem} ${styles.active}`}><UserIcon size={18} /> General Settings</button>
                            <button className={styles.navItem}><CreditCard size={18} /> Billing & Plan</button>
                            <button className={styles.navItem}><Settings size={18} /> App Preferences</button>
                            <button className={styles.navItem} style={{ color: '#ef4444', marginTop: '1rem' }}><LogOut size={18} /> Log Out</button>
                        </nav>
                    </div>

                    {/* RIGHT COLUMN: Quota & Plan Upgrades */}
                    <div className={styles.columnExpanded}>

                        {/* Usage Card */}
                        <div className={styles.usageCard}>
                            <h3 className={styles.cardTitle}>Current API Quota</h3>
                            <p className={styles.cardDesc}>Versana uses top-tier context models to map your matrix. Keep track of your monthly AI memory limitations here. Words scale directly with how deeply you utilize automated scene rewrites.</p>

                            {usage && (
                                <div className={styles.meterContainer}>
                                    <div className={styles.meterHeader}>
                                        <span>AI Words Generated (Monthly Lifecycle)</span>
                                        <span>{usage.tokens.toLocaleString()} / {usage.limit > 10000000 ? 'Unlimited' : usage.limit.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.meterTrack}>
                                        <div
                                            className={`${styles.meterFill} ${usage.usagePercent > 80 ? styles.meterWarning : ''}`}
                                            style={{ width: `${usage.usagePercent}%` }}
                                        />
                                    </div>
                                    <div className={styles.resetLabel}>Resets on the 1st of next month</div>
                                </div>
                            )}
                        </div>

                        {/* Subscription Management */}
                        <div className={styles.upgradeCard}>
                            <h3 className={styles.cardTitle}>Subscription Management</h3>

                            {subscription_tier !== 'master' ? (
                                <div className={styles.upgradeBanner}>
                                    <div className={styles.upgradeInfo}>
                                        <h4>Unlock Infinite Memory</h4>
                                        <p>Upgrade to Pro or Master to expand your universe capacities and unlock deep narrative analysis tools.</p>
                                    </div>
                                    <button className={styles.upgradeBtn} onClick={handleMockBilling} disabled={isManagingBilling}>
                                        {isManagingBilling ? 'Redirecting to Stripe...' : <><ArrowUpCircle size={18} /> Upgrade Plan</>}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.upgradeBanner} style={{ background: 'var(--tag-gold-bg)', borderColor: 'var(--tag-gold-text)' }}>
                                    <div className={styles.upgradeInfo}>
                                        <h4 style={{ color: 'var(--tag-gold-text)' }}><CheckCircle2 size={18} style={{ display: 'inline', marginBottom: '-4px' }} /> Master Tier Active</h4>
                                        <p style={{ color: '#b45309' }}>You have unlimited universe scaling and infinite AI memory context.</p>
                                    </div>
                                    <button className={styles.manageBtn} onClick={handleMockBilling} disabled={isManagingBilling}>
                                        {isManagingBilling ? 'Loading...' : 'Manage Billing'}
                                    </button>
                                </div>
                            )}

                            <div className={styles.billingHistory}>
                                <h4>Recent Invoices</h4>
                                <div className={styles.invoiceItem}>
                                    <span>Feb 01, 2026 - {subscription_tier.charAt(0).toUpperCase() + subscription_tier.slice(1)} Tier</span>
                                    <span>Paid <a href="#">Download</a></span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Mock Stripe Modal */}
            {showStripeModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.stripeHeader}>
                            <CreditCard size={24} color="#6366f1" />
                            <span>Stripe Checkout (Test Mode)</span>
                        </div>
                        <div className={styles.stripeBody}>
                            <h3>Upgrade to {profile.subscription_tier === 'free' ? 'Pro Author' : 'Master Tier'}</h3>
                            <div className={styles.priceRow}>
                                <span>Total due today</span>
                                <strong>{profile.subscription_tier === 'free' ? '$39.00' : '$89.00'}</strong>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Card Information</label>
                                <div className={styles.mockInput}>4242 4242 4242 4242</div>
                            </div>
                            <button
                                className={styles.payBtn}
                                onClick={() => {
                                    setShowPaymentSuccess(true);
                                    setShowStripeModal(false);
                                }}
                            >
                                Pay Now
                            </button>
                            <button className={styles.cancelBtn} onClick={() => setShowStripeModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showPaymentSuccess && (
                <div className={styles.modalOverlay}>
                    <div className={styles.stripeModal}>
                        <div className={styles.stripeHeader} style={{ background: 'var(--accent-green, #10b981)' }}>
                            <span>Payment Successful</span>
                        </div>
                        <div className={styles.stripeBody}>
                            <h3>Thank You!</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Your payment was successful (Mock). Your subscription will be updated shortly.
                            </p>
                            <button
                                className={styles.payBtn}
                                onClick={() => setShowPaymentSuccess(false)}
                                style={{ background: 'var(--accent-green, #10b981)' }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
