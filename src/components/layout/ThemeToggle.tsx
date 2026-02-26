'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import topBarStyles from './TopBar.module.css';
import dropdownStyles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // We only want to render the toggle once the client has mounted to prevent hydration errors.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
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

    if (!mounted) {
        return (
            <button className={topBarStyles.iconButton} aria-label="Toggle theme">
                <div style={{ width: 18, height: 18 }} />
            </button>
        );
    }

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelectTheme = (newTheme: string) => {
        setTheme(newTheme);
        setIsOpen(false);
    };

    return (
        <div className={dropdownStyles.container} ref={dropdownRef}>
            <button
                className={topBarStyles.iconButton}
                onClick={toggleDropdown}
                title={`Current theme: ${theme}. Click to change.`}
            >
                {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isOpen && (
                <div className={dropdownStyles.dropdown}>
                    <button
                        className={`${dropdownStyles.menuItem} ${theme === 'light' ? dropdownStyles.active : ''}`}
                        onClick={() => handleSelectTheme('light')}
                    >
                        <Sun size={14} /> Light
                    </button>
                    <button
                        className={`${dropdownStyles.menuItem} ${theme === 'dark' ? dropdownStyles.active : ''}`}
                        onClick={() => handleSelectTheme('dark')}
                    >
                        <Moon size={14} /> Dark
                    </button>
                    <button
                        className={`${dropdownStyles.menuItem} ${theme === 'system' ? dropdownStyles.active : ''}`}
                        onClick={() => handleSelectTheme('system')}
                    >
                        <Monitor size={14} /> System
                    </button>
                </div>
            )}
        </div>
    );
}
