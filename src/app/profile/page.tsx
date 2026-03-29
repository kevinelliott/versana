'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, User as UserIcon, LogOut, Settings, CreditCard, ArrowLeft, ArrowUpCircle, CheckCircle2, Sun, Moon, Monitor, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
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
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Mount effect for next-themes to avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [usage, setUsage] = useState<UserUsage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Tab state
    const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'preferences'>('general');

    const [isManagingBilling, setIsManagingBilling] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

    // General Settings State
    const [editName, setEditName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [nameSaveMessage, setNameSaveMessage] = useState('');

    const [penNames, setPenNames] = useState<{id: string, name: string}[]>([]);
    const [newPenName, setNewPenName] = useState('');
    const [isCreatingPenName, setIsCreatingPenName] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const proRes = await fetch('/api/user/profile');
                if (proRes.ok) {
                    const data = await proRes.json();
                    setProfile(data);
                    setEditName(data.full_name || '');

                    const currentTokens = data.tokens_used || 0;
                    let limit = 50000;
                    if (data.subscription_tier === 'pro') limit = 1000000;
                    else if (data.subscription_tier === 'master') limit = 999999999;

                    setUsage({
                        tokens: currentTokens,
                        limit,
                        usagePercent: limit > 0 ? Math.min(100, Math.round((currentTokens / limit) * 100)) : 0
                    });

                    if (typeof window !== 'undefined') {
                        const params = new URLSearchParams(window.location.search);
                        const upgradeParam = params.get('upgrade');
                        if (upgradeParam && data.subscription_tier !== upgradeParam && data.subscription_tier !== 'master') {
                            setActiveTab('billing');
                            window.history.replaceState({}, '', '/profile');
                        }
                        if (params.get('success') === 'true') {
                            setShowPaymentSuccess(true);
                            window.history.replaceState({}, '', '/profile');
                        }
                    }
                    
                    const penRes = await fetch('/api/user/pen-names');
                    if (penRes.ok) {
                        const pens = await penRes.json();
                        setPenNames(pens);
                    }
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleStripeCheckout = async (productId: string) => {
        setIsManagingBilling(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile?.id, productId, amount: productId === 'basic_mana' ? 1000 : 5000 })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            console.error(e);
            setIsManagingBilling(false);
        }
    };

    const handleSaveName = async () => {
        if (!profile) return;
        setIsSavingName(true);
        setNameSaveMessage('');
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: editName })
            });

            if (res.ok) {
                const updated = await res.json();
                setProfile({ ...profile, full_name: updated.full_name });
                setNameSaveMessage('Profile saved successfully.');
                setTimeout(() => setNameSaveMessage(''), 3000);
            } else {
                const err = await res.json().catch(() => ({}));
                setNameSaveMessage(`Error: ${err.error || 'Failed to update'}`);
            }
        } catch (e) {
            console.error(e);
            setNameSaveMessage('A network error occurred.');
        } finally {
            setIsSavingName(false);
        }
    };

    const handleCreatePenName = async () => {
        if (!newPenName.trim()) return;
        setIsCreatingPenName(true);
        try {
            const res = await fetch('/api/user/pen-names', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPenName })
            });
            if (res.ok) {
                const newPen = await res.json();
                setPenNames([newPen, ...penNames]);
                setNewPenName('');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreatingPenName(false);
        }
    };

    if (isLoading || !mounted) {
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
                            <button className={`${styles.navItem} ${activeTab === 'general' ? styles.active : ''}`} onClick={() => setActiveTab('general')}>
                                <UserIcon size={18} /> General Settings
                            </button>
                            <button className={`${styles.navItem} ${activeTab === 'billing' ? styles.active : ''}`} onClick={() => setActiveTab('billing')}>
                                <CreditCard size={18} /> Billing & Plan
                            </button>
                            <button className={`${styles.navItem} ${activeTab === 'preferences' ? styles.active : ''}`} onClick={() => setActiveTab('preferences')}>
                                <Settings size={18} /> App Preferences
                            </button>
                            <button className={styles.navItem} style={{ color: '#ef4444', marginTop: '1rem' }} onClick={() => window.location.href = '/'}>
                                <LogOut size={18} /> Log Out
                            </button>
                        </nav>
                    </div>

                    <div className={styles.columnExpanded}>
                        {activeTab === 'general' && (
                            <div className={styles.usageCard}>
                                <h3 className={styles.cardTitle}>General Settings</h3>
                                <p className={styles.cardDesc}>Manage your author profile and pen name here. This name is used on your public mini-sites and exports by default.</p>

                                <div className={styles.settingsGroup}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Author / Pen Name</label>
                                        <input 
                                            type="text" 
                                            className={styles.formInput} 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Your Pen Name" 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Contact Email (Locked)</label>
                                        <input type="email" className={styles.formInput} value={email} disabled style={{ opacity: 0.6 }} />
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                        <button className={styles.btnPrimary} onClick={handleSaveName} disabled={isSavingName || editName === profile.full_name}>
                                            {isSavingName ? <Loader2 size={16} className="spinner" /> : null}
                                            Save Changes
                                        </button>
                                        {nameSaveMessage && (
                                            <span style={{ fontSize: '0.85rem', color: nameSaveMessage.includes('Error') ? 'var(--accent-terracotta)' : 'var(--accent-green)' }}>
                                                {nameSaveMessage}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <hr style={{ borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />
                                    
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Your Pen Names</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        Create isolated identities. Your actual name will not be linked publicly with a Pen Name.
                                    </p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        {penNames.length > 0 ? penNames.map((pn) => (
                                            <div key={pn.id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600 }}>{pn.name}</span>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                                                No Pen Names registered yet.
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            type="text" 
                                            className={styles.formInput} 
                                            value={newPenName}
                                            onChange={(e) => setNewPenName(e.target.value)}
                                            placeholder="Create a new Pen Name" 
                                            style={{ flex: 1 }}
                                        />
                                        <button 
                                            className={styles.btnPrimary} 
                                            onClick={handleCreatePenName} 
                                            disabled={isCreatingPenName || !newPenName.trim()}
                                        >
                                            {isCreatingPenName ? <Loader2 size={16} className="spinner" /> : null}
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <>
                                <div className={styles.usageCard}>
                                    <h3 className={styles.cardTitle}>Current API Quota</h3>
                                    <p className={styles.cardDesc}>Versana uses top-tier generative models. Keep track of your monthly AI limitations here.</p>

                                    {usage && (
                                        <div className={styles.meterContainer}>
                                            <div className={styles.meterHeader}>
                                                <span>AI Tokens Used</span>
                                                <span>{usage.tokens.toLocaleString()} / {usage.limit > 10000000 ? 'Unlimited' : usage.limit.toLocaleString()}</span>
                                            </div>
                                            <div className={styles.meterTrack}>
                                                <div className={`${styles.meterFill} ${usage.usagePercent > 80 ? styles.meterWarning : ''}`} style={{ width: `${usage.usagePercent}%` }} />
                                            </div>
                                            <div className={styles.resetLabel}>Resets on the 1st of next month</div>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.upgradeCard}>
                                    <h3 className={styles.cardTitle}>Subscription Management</h3>
                                    {subscription_tier !== 'master' ? (
                                        <div className={styles.upgradeBanner}>
                                            <div className={styles.upgradeInfo}>
                                                <h4>Unlock Infinite Memory</h4>
                                                <p>Upgrade to Pro or Master to expand your capacities.</p>
                                            </div>
                                            <button className={styles.upgradeBtn} onClick={() => handleStripeCheckout('pro_mana')} disabled={isManagingBilling}>
                                                {isManagingBilling ? 'Redirecting...' : <><ArrowUpCircle size={18} /> Buy Pro Mana Pack (100k)</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.upgradeBanner} style={{ background: 'var(--tag-gold-bg)', borderColor: 'var(--tag-gold-text)' }}>
                                            <div className={styles.upgradeInfo}>
                                                <h4 style={{ color: 'var(--tag-gold-text)' }}><CheckCircle2 size={18} style={{ display: 'inline', marginBottom: '-4px' }} /> Master Tier Active</h4>
                                                <p style={{ color: '#b45309' }}>You have unlimited universe scaling.</p>
                                            </div>
                                            <button className={styles.manageBtn} onClick={() => handleStripeCheckout('basic_mana')} disabled={isManagingBilling}>
                                                {isManagingBilling ? 'Loading...' : 'Buy Basic Mana (10k)'}
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
                            </>
                        )}

                        {activeTab === 'preferences' && (
                            <div className={styles.usageCard}>
                                <h3 className={styles.cardTitle}>App Preferences</h3>
                                <p className={styles.cardDesc}>Customize Versana to fit your writing environment.</p>

                                <div className={styles.settingsGroup}>
                                    <h4 className={styles.settingsTitle}>Theme Selection</h4>
                                    <div className={styles.themeSelector}>
                                        <div className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`} onClick={() => setTheme('light')}>
                                            <Sun size={24} />
                                            <span>Light Mode</span>
                                        </div>
                                        <div className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`} onClick={() => setTheme('dark')}>
                                            <Moon size={24} />
                                            <span>Dark Mode</span>
                                        </div>
                                        <div className={`${styles.themeOption} ${theme === 'system' ? styles.active : ''}`} onClick={() => setTheme('system')}>
                                            <Monitor size={24} />
                                            <span>System Default</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Live Stripe Session handler implicitly triggered on Buy buttons */}

            {showPaymentSuccess && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.stripeHeader} style={{ background: 'var(--accent-green, #10b981)', color: 'white' }}>
                            <span>Payment Successful</span>
                        </div>
                        <div className={styles.stripeBody}>
                            <h3>Thank You!</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Your payment was successful. Your subscription and Mana quotas have been updated.
                            </p>
                            <button className={styles.payBtn} onClick={() => setShowPaymentSuccess(false)} style={{ background: 'var(--accent-green, #10b981)' }}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `.spinner { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </div>
    );
}
