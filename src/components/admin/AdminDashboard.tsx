'use client';

import React from 'react';
import { ShieldAlert, Users, Activity, ArrowUpRight, ArrowDownRight, Database, AlertCircle, LineChart, Loader2 } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const MOCK_USERS = [
    { id: 1, name: 'Alice Chen', email: 'alice.c@example.com', tier: 'Master', status: 'Active', tokens: '1.2M' },
    { id: 2, name: 'Marcus Thorne', email: 'm.thorne@writer.net', tier: 'Pro Author', status: 'Active', tokens: '450K' },
    { id: 3, name: 'Sarah Jenkins', email: 'sjenk99@gmail.com', tier: 'Hobbyist', status: 'Warning', tokens: '9.8K' },
    { id: 4, name: 'David Kim', email: 'dkim.story@outlook.com', tier: 'Pro Author', status: 'Active', tokens: '890K' },
];

export default function AdminDashboard() {
    const [dbUsers, setDbUsers] = React.useState<{ id: string, full_name?: string, email?: string, subscription_tier: string, created_at: string, last_sign_in_at?: string }[]>([]);
    const [metrics, setMetrics] = React.useState<{ users: number, workspaces: number, chapters: number }>({ users: 0, workspaces: 0, chapters: 0 });
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchData() {
            try {
                const [usersRes, metricsRes] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/metrics')
                ]);

                if (usersRes.ok) {
                    const data = await usersRes.json();
                    if (data.users) setDbUsers(data.users);
                }

                if (metricsRes.ok) {
                    const mData = await metricsRes.json();
                    setMetrics(mData);
                }
            } catch (err) {
                console.error("Error fetching admin data", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // If db doesn't have enough, append mocks for layout visualization
    const displayUsers = dbUsers.length > 0 ? dbUsers.map(u => ({
        id: u.id,
        name: u.full_name || u.email?.split('@')[0] || 'Unknown User',
        email: u.email || 'No email',
        tier: u.subscription_tier === 'pro' ? 'Pro Author' : u.subscription_tier === 'master' ? 'Master' : 'Hobbyist',
        status: new Date().getTime() - new Date(u.last_sign_in_at || u.created_at).getTime() > 14 * 24 * 60 * 60 * 1000 ? 'Warning' : 'Active',
        tokens: Math.floor(Math.random() * 500) + 'K' // Random for now since tokens aren't tracked yet
    })) : MOCK_USERS;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleBox}>
                    <h1 className={styles.title}>
                        <ShieldAlert size={28} color="var(--accent-blue)" /> Platform Administration
                    </h1>
                    <p className={styles.subtitle}>
                        Overview of user subscriptions, API cost analytics, and platform health.
                    </p>
                </div>
                <span className={styles.badge}>Super Admin</span>
            </div>

            <div className={styles.grid}>
                {/* Main Column: Users & Health */}
                <div className={styles.column}>

                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Active Users</div>
                            <div className={styles.statValue}>{metrics.users > 0 ? metrics.users : '12,450'}</div>
                            <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                <ArrowUpRight size={16} /> +14% this month
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Chapters Written</div>
                            <div className={styles.statValue}>{metrics.chapters > 0 ? metrics.chapters : '142,800'}</div>
                            <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                <ArrowUpRight size={16} /> +8.2% this month
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Avg Latency</div>
                            <div className={styles.statValue}>240ms</div>
                            <div className={`${styles.statTrend} ${styles.trendDown}`}>
                                <ArrowDownRight size={16} /> -12ms improved
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><Users size={18} /> User Oversight</h3>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr className={styles.tr}>
                                    <th className={styles.th}>Author</th>
                                    <th className={styles.th}>Tier</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th}>Token Usage (MTD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <Loader2 size={24} className={styles.spinner} style={{ margin: '0 auto', display: 'block' }} />
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Gathering platform telemetry...</div>
                                        </td>
                                    </tr>
                                ) : displayUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <Users size={24} style={{ margin: '0 auto 0.5rem auto', display: 'block', opacity: 0.5 }} />
                                            No active users found.
                                        </td>
                                    </tr>
                                ) : displayUsers.map((user) => (
                                    <tr key={user.id} className={styles.tr}>
                                        <td className={styles.td}>
                                            <div className={styles.userRow}>
                                                <div className={styles.avatar}>{user.name.charAt(0)}</div>
                                                <div>
                                                    <span className={styles.userName}>{user.name}</span>
                                                    <span className={styles.userEmail}>{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.tierBadge} ${user.tier === 'Master' ? styles.tierMaster :
                                                user.tier === 'Pro Author' ? styles.tierPro : styles.tierHobby
                                                }`}>
                                                {user.tier}
                                            </span>
                                        </td>
                                        <td className={styles.td} style={{ color: user.status === 'Warning' ? '#ef4444' : 'var(--tag-green-text)' }}>
                                            • {user.status}
                                        </td>
                                        <td className={styles.td}>{user.tokens}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: API Costs & Insights */}
                <div className={styles.column}>

                    {/* Insights & Churn */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><AlertCircle size={18} color="var(--accent-terracotta)" /> Churn Risk Insights</h3>
                        </div>
                        <div className={styles.costList}>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <span style={{ color: '#ef4444' }}>High Risk (Inactive &gt; 14 days)</span>
                                </div>
                                <div className={styles.costAmount}>142 Users</div>
                            </div>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <span style={{ color: 'var(--tag-gold-text)' }}>Medium Risk (Inactive &gt; 7 days)</span>
                                </div>
                                <div className={styles.costAmount}>890 Users</div>
                            </div>
                        </div>
                    </div>

                    {/* Profit Margin Chart */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><LineChart size={18} color="var(--accent-green)" /> Profit Margin Analysis</h3>
                        </div>
                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                            <div className={styles.chartContainer}>
                                <div className={styles.chartBarGroup}>
                                    <div className={styles.chartBar} style={{ height: '100%', background: 'var(--accent-green)' }}></div>
                                    <span className={styles.chartLabel}>Rev<br />$142k</span>
                                </div>
                                <div className={styles.chartBarGroup}>
                                    <div className={styles.chartBar} style={{ height: '35%', background: 'var(--accent-blue)' }}></div>
                                    <span className={styles.chartLabel}>Server<br />$48k</span>
                                </div>
                                <div className={styles.chartBarGroup}>
                                    <div className={styles.chartBar} style={{ height: '15%', background: 'var(--accent-terracotta)' }}></div>
                                    <span className={styles.chartLabel}>API<br />$6.2k</span>
                                </div>
                                <div className={styles.chartBarGroup}>
                                    <div className={styles.chartBar} style={{ height: '50%', background: 'var(--tag-gold-text)' }}></div>
                                    <span className={styles.chartLabel}>Profit<br />$87.8k</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><Activity size={18} /> API Cost Analytics</h3>
                        </div>
                        <div className={styles.costList}>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <Database size={16} color="var(--tag-purple-text)" />
                                    Claude 3 Haiku (Core)
                                </div>
                                <div className={styles.costAmount}>$4,250.00</div>
                            </div>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <Database size={16} color="var(--tag-blue-text)" />
                                    Claude 3 Haiku (NER)
                                </div>
                                <div className={styles.costAmount}>$840.50</div>
                            </div>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <Database size={16} color="var(--tag-gold-text)" />
                                    DALL-E 3 (Image Generation)
                                </div>
                                <div className={styles.costAmount}>$1,120.00</div>
                            </div>
                            <div className={styles.costItem} style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <div className={styles.costModel} style={{ fontWeight: 600 }}>
                                    Total API Spend (MTD)
                                </div>
                                <div className={styles.costAmount} style={{ fontWeight: 600, color: '#ef4444' }}>
                                    $6,210.50
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
