'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import styles from './TopBar.module.css';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();

    // We only want to render the toggle once the client has mounted to prevent hydration errors.
    // However, to fix the lint rule against setting state synchronously in useEffect,
    // we use a slight trick or just disable the rule for this specific well-known NextThemes pattern.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className={styles.iconButton} aria-label="Toggle theme">
                <div style={{ width: 18, height: 18 }} />
            </button>
        );
    }

    return (
        <button
            className={styles.iconButton}
            onClick={() => setTheme(theme === 'dark' || resolvedTheme === 'dark' ? 'light' : 'dark')}
            title={`Current theme: ${theme}. Click to switch.`}
        >
            {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}
