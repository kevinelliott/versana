'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './UserDropdown.module.css';

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<{ full_name: string; email: string; subscription_tier: string } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    if (!profile) {
        return (
            <div className={styles.loadingBadge}>
                <div className={styles.skeleton} />
            </div>
        );
    }

    const { full_name, email, subscription_tier } = profile;
    const initials = full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button className={styles.badge} onClick={toggleDropdown} title="User Menu">
                <div className={styles.avatar}>{initials}</div>
                <span className={styles.name}>{full_name.split(' ')[0]}</span>
                <ChevronDown size={14} className={styles.chevron} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <div className={styles.headerName}>{full_name}</div>
                        <div className={styles.headerEmail}>{email}</div>
                        <div className={styles.tierBadge}>{subscription_tier.toUpperCase()} TIER</div>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.menu}>
                        <Link href="/profile" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <User size={16} /> My Profile
                        </Link>
                        <Link href="/profile" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <Settings size={16} /> Workspace Settings
                        </Link>
                        <Link href="/pricing" className={styles.menuItem} onClick={() => setIsOpen(false)}>
                            <CreditCard size={16} /> Billing & Plan
                        </Link>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.menu}>
                        <button className={`${styles.menuItem} ${styles.logout}`} onClick={() => alert("Sign out handled via Supabase Auth")}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
