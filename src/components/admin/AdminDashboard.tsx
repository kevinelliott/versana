'use client';

import React from 'react';
import { ShieldAlert, Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Database } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const MOCK_USERS = [
    { id: 1, name: 'Alice Chen', email: 'alice.c@example.com', tier: 'Master', status: 'Active', tokens: '1.2M' },
    { id: 2, name: 'Marcus Thorne', email: 'm.thorne@writer.net', tier: 'Pro Author', status: 'Active', tokens: '450K' },
    { id: 3, name: 'Sarah Jenkins', email: 'sjenk99@gmail.com', tier: 'Hobbyist', status: 'Warning', tokens: '9.8K' },
    { id: 4, name: 'David Kim', email: 'dkim.story@outlook.com', tier: 'Pro Author', status: 'Active', tokens: '890K' },
];

export default function AdminDashboard() {
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
                            <div className={styles.statValue}>12,450</div>
                            <div className={`${styles.statTrend} ${styles.trendUp}`}>
                                <ArrowUpRight size={16} /> +14% this month
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>MRR (Stripe)</div>
                            <div className={styles.statValue}>$142,800</div>
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
                                {MOCK_USERS.map((user) => (
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

                {/* Right Column: API Costs */}
                <div className={styles.column}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}><Activity size={18} /> API Cost Analytics</h3>
                        </div>
                        <div className={styles.costList}>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <Database size={16} color="var(--tag-purple-text)" />
                                    Claude 3.5 Sonnet
                                </div>
                                <div className={styles.costAmount}>$4,250.00</div>
                            </div>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <Database size={16} color="var(--tag-blue-text)" />
                                    GPT-4o-mini (NER)
                                </div>
                                <div className={styles.costAmount}>$840.50</div>
                            </div>
                            <div className={styles.costItem}>
                                <div className={styles.costModel}>
                                    <Database size={16} color="var(--tag-gold-text)" />
                                    Nano Banana Pro (Art)
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
