'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, BookOpen, Search, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './discover.module.css';

interface PublicBook {
    id: string;
    title: string;
    blurb: string;
    cover_image_url: string;
    genre: string;
    author_id: string;
    author_name: string;
}

export default function DiscoverPage() {
    const [books, setBooks] = useState<PublicBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPublicBooks = async () => {
            try {
                const res = await fetch('/api/discover');
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                } else {
                    console.error("Failed to load discover books");
                }
            } catch (err) {
                console.error("Discover Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPublicBooks();
    }, []);

    const filtered = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.genre.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.logo}>
                        <Globe className={styles.logoIcon} size={28} />
                        <span className={styles.logoText}>Versana Discover</span>
                    </div>
                    <nav className={styles.nav}>
                        <Link href="/workspace" className={styles.navLink}>My Dashboard</Link>
                        <Link href="/profile" className={styles.navLink}>Profile</Link>
                    </nav>
                </div>

                <div className={styles.heroContent}>
                    <div className={styles.badge}><Sparkles size={14} /> The Global Library</div>
                    <h1 className={styles.heroTitle}>Discover the next great story.</h1>
                    <p className={styles.heroSubtitle}>Explore public manuscripts, interactive lore bibles, and active projects published by the Versana author community.</p>
                    
                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by title, genre, or keyword..." 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}><TrendingUp size={20} /> Trending Now</h2>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>Loading library...</div>
                ) : (
                    <div className={styles.grid}>
                        {filtered.length > 0 ? filtered.map((book, idx) => (
                            <div key={`${book.id}-${idx}`} className={styles.bookCard}>
                                <div className={styles.coverWrapper}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={book.cover_image_url} alt={book.title} className={styles.coverImage} />
                                    <div className={styles.genreTag}>{book.genre}</div>
                                </div>
                                <div className={styles.bookInfo}>
                                    <h3 className={styles.bookTitle}>{book.title}</h3>
                                    <p className={styles.bookAuthor}>
                                        by <Link href={`/profile/${book.author_id}`} className={styles.authorLink} style={{ color: 'inherit', textDecoration: 'underline' }}>{book.author_name}</Link>
                                    </p>
                                    <p className={styles.bookBlurb}>{book.blurb.length > 120 ? book.blurb.substring(0, 120) + '...' : book.blurb}</p>
                                    <Link href={`/read/${book.id}`} className={styles.readMore} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                        Read First Chapter <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyState}>
                                <BookOpen size={48} color="var(--border-color)" />
                                <h3>No books found matching your criteria.</h3>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
