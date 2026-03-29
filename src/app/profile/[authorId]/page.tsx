import React from 'react';
import Link from 'next/link';
import { Globe, BookOpen, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import styles from '../../discover/discover.module.css';

export default async function AuthorProfilePage(props: { params: Promise<{ authorId: string }> }) {
    const params = await props.params;
    const authorId = params.authorId;
    const supabase = createAdminClient();

    // Fetch author profile (Pen Name)
    const { data: authorData, error: authorError } = await supabase
        .from('author_profiles')
        .select('id, name, created_at, bio')
        .eq('id', authorId)
        .single();

    if (authorError || !authorData) {
        return notFound();
    }

    // Fetch author's public books using pen_name_id
    const { data: booksData } = await supabase
        .from('books')
        .select(`
            id, title, blurb, cover_image_url, 
            workspaces!inner ( genre )
        `)
        .eq('is_public', true)
        .eq('pen_name_id', authorId)
        .order('created_at', { ascending: false });

    // Format books
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const books = (booksData || []).map((b: any) => ({
        id: b.id,
        title: b.title || 'Untitled Work',
        blurb: b.blurb || '',
        cover_image_url: b.cover_image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
        genre: b.workspaces?.genre || 'Fiction',
    }));

    const authorName = authorData.name || 'Anonymous Author';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.logo}>
                        <Globe className={styles.logoIcon} size={28} />
                        <span className={styles.logoText}>Versana Profiles</span>
                    </div>
                    <nav className={styles.nav}>
                        <Link href="/discover" className={styles.navLink}>Back to Discover</Link>
                    </nav>
                </div>

                <div className={styles.heroContent} style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}>
                            <User size={36} />
                        </div>
                        <div className={styles.badge}>Author Profile</div>
                        <h1 className={styles.heroTitle}>{authorName}</h1>
                        <p className={styles.heroSubtitle}>
                            Member since {new Date(authorData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}. 
                            <br/>{books.length} published {books.length === 1 ? 'work' : 'works'}.
                        </p>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}><BookOpen size={20} /> Works by {authorName}</h2>
                </div>

                <div className={styles.grid}>
                    {books.length > 0 ? books.map((book) => (
                        <div key={book.id} className={styles.bookCard}>
                            <div className={styles.coverWrapper}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={book.cover_image_url} alt={book.title} className={styles.coverImage} />
                                <div className={styles.genreTag}>{book.genre}</div>
                            </div>
                            <div className={styles.bookInfo}>
                                <h3 className={styles.bookTitle}>{book.title}</h3>
                                <p className={styles.bookBlurb}>{book.blurb.length > 120 ? book.blurb.substring(0, 120) + '...' : book.blurb}</p>
                                <Link href={`/read/${book.id}`} className={styles.readMore} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                    Read First Chapter <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className={styles.emptyState}>
                            <BookOpen size={48} color="var(--border-color)" />
                            <h3>This author hasn't published any public works yet.</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
