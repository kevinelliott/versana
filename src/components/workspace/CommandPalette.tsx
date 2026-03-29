'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Hash, MapPin, User, Bookmark, BookOpen, PenTool, LayoutTemplate, Image as ImageIcon, CheckSquare, Shield, Rocket, UserPlus } from 'lucide-react';
import styles from './CommandPalette.module.css';
import { useWorkspace } from '@/context/WorkspaceContext';
import { usePhase } from '@/context/PhaseContext';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const { activeWorkspace, books, activeBook, setActiveBook, setSelectedLoreId } = useWorkspace();
    const { setActivePhase, activePhase } = usePhase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lore, setLore] = useState<any[]>([]);

    // Fetch lore for the active workspace so we can search it
    useEffect(() => {
        if (!activeWorkspace || !open) return;
        
        const fetchLore = async () => {
            try {
                const res = await fetch(`/api/lore?workspaceId=${activeWorkspace.id}`);
                const data = await res.json();
                setLore(data);
            } catch (err) {
                console.error("Failed to fetch lore for cmdk", err);
            }
        };
        fetchLore();
    }, [activeWorkspace, open]);

    // Global Key Listener for Cmd/Ctrl + K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    if (!open) return null;

    const navigateToLore = (loreId: string) => {
        setActivePhase('lore');
        setSelectedLoreId(loreId);
        setOpen(false);
    };

    const navigateToPhase = (phaseId: string) => {
        setActivePhase(phaseId);
        setOpen(false);
    };

    const navigateToBook = (bookId: string) => {
        const book = books.find((b: any) => b.id === bookId);
        if (book) {
            setActiveBook(book);
            // If we're not inside a drafting or preview phase, maybe switch to phase 4
            if (activePhase !== '4' && activePhase !== '2' && activePhase !== '5' && activePhase !== '6') {
                setActivePhase('4'); 
            }
            setOpen(false);
        }
    };

    const getLoreIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t === 'character') return <User size={14} />;
        if (t === 'place' || t === 'setting') return <MapPin size={14} />;
        if (t === 'plot hook') return <Bookmark size={14} />;
        if (t === 'lore' || t === 'rule') return <BookOpen size={14} />;
        return <Hash size={14} />;
    };

    // Determine current theme
    const isDark = document.body.classList.contains('dark-theme');

    return (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <Command className={styles.command}>
                    <Command.Input placeholder="Type a command or search..." className={styles.input} autoFocus />
                    <Command.List className={styles.list}>
                        <Command.Empty className={styles.empty}>No results found.</Command.Empty>

                        <Command.Group heading="Projects & Books">
                            {books.map((b: any) => (
                                <Command.Item key={b.id} onSelect={() => navigateToBook(b.id)} className={styles.item}>
                                    <BookOpen size={14} /> <span>Open: {b.title}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>

                        {lore.length > 0 && (
                            <Command.Group heading="Lore Bible">
                                {lore.map(item => (
                                    <Command.Item key={item.id} onSelect={() => navigateToLore(item.id)} className={styles.item}>
                                        {getLoreIcon(item.type)} <span>{item.name}</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        <Command.Group heading="Workflow Tools">
                            <Command.Item onSelect={() => navigateToPhase('1')} className={styles.item}>
                                <PenTool size={14} /> <span>Phase 1: Concept & Ideation</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigateToPhase('2')} className={styles.item}>
                                <Shield size={14} /> <span>Phase 2: Planning & Outlining</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigateToPhase('4')} className={styles.item}>
                                <PenTool size={14} /> <span>Phase 4: Drafting & Writing</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigateToPhase('5')} className={styles.item}>
                                <CheckSquare size={14} /> <span>Phase 5: Revisions & Deep Edits</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigateToPhase('6')} className={styles.item}>
                                <LayoutTemplate size={14} /> <span>Phase 6: Layout & Formatting</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigateToPhase('7')} className={styles.item}>
                                <ImageIcon size={14} /> <span>Phase 7: Cover Design</span>
                            </Command.Item>
                            <Command.Item onSelect={() => navigateToPhase('8')} className={styles.item}>
                                <Rocket size={14} /> <span>Phase 8: Publishing Prep</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Settings">
                            <Command.Item onSelect={() => {
                                const newTheme = isDark ? 'light' : 'dark';
                                document.body.classList.remove('light-theme', 'dark-theme');
                                document.body.classList.add(`${newTheme}-theme`);
                                localStorage.setItem('theme', newTheme);
                                setOpen(false);
                            }} className={styles.item}>
                                <LayoutTemplate size={14} /> <span>Toggle Theme ({isDark ? 'Light' : 'Dark'})</span>
                            </Command.Item>
                        </Command.Group>

                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
