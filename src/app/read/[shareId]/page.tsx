import { BookOpen, Share2, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function MiniSite({ params }: { params: { shareId: string } }) {
    const supabase = createAdminClient();

    // 1. Fetch Book
    const { data: book, error: bookError } = await supabase
        .from('books')
        .select('*, workspaces(*, users(full_name))')
        .eq('id', params.shareId)
        .single();

    if (bookError || !book || !book.workspaces) {
        return notFound();
    }

    const workspace = book.workspaces;

    // 2. Fetch Chapters for excerpt & read time
    const { data: chapters } = await supabase
        .from('chapters')
        .select('id, title, content, word_count, order_index')
        .eq('book_id', book.id)
        .order('order_index', { ascending: true });

    // 3. Extract the first chapter with content to show as an excerpt
    let firstChapterContent = '';
    let totalWordCount = 0;

    if (chapters) {
        for (const chap of chapters) {
            totalWordCount += (chap.word_count || 0);

            if (!firstChapterContent && chap.content) {
                // Extremely naive extraction of text from TipTap JSON
                try {
                    let extracted = '';
                    if (typeof chap.content === 'object' && chap.content.content) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const recursiveExtract = (nodes: any[]) => {
                            nodes.forEach(node => {
                                if (node.type === 'paragraph') {
                                    if (node.content) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        extracted += node.content.map((c: any) => c.text).join('') + '\n\n';
                                    }
                                } else if (node.content) {
                                    recursiveExtract(node.content);
                                }
                            });
                        };
                        recursiveExtract(chap.content.content);
                    }
                    firstChapterContent = extracted.trim() || 'Chapter is empty.';
                } catch {

                    firstChapterContent = 'Failed to load chapter content.';
                }
            }
        }
    }

    const bookTitle = book.title || "Untitled Draft";
    const authorName = workspace.users?.full_name || "Unknown Author";
    const synopsis = workspace.description || "A new universe awaits. The author is currently generating the Context Matrix and exploring the realms of this new manuscript.";
    const coverUrl = workspace.board_state?.cover_design?.coverImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
    const genre = book.genre || workspace.genre || "Fiction";

    // Avg reading speed is 250 wpm.
    const readMinutes = Math.max(1, Math.ceil(totalWordCount / 250));
    const readTime = readMinutes > 60 ? `Est. ${Math.floor(readMinutes / 60)} Hours` : `Est. ${readMinutes} Mins`;
    const excerpt = firstChapterContent;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-sans)', color: '#0f172a' }}>
            {/* Minimalist Top Bar */}
            <header style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                background: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 24, height: 24, background: '#0f172a', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>V</div>
                    Versana Reader
                </div>
                <button style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Share2 size={14} /> Share Link
                </button>
            </header>

            <main style={{ maxWidth: '1000px', margin: '4rem auto', padding: '0 2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
                    {/* Left: Book Cover & Metadata */}
                    <div style={{ position: 'sticky', top: '4rem' }}>
                        <div style={{
                            width: '100%',
                            aspectRatio: '2/3',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            position: 'relative'
                        }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: '2rem',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.9 }}>{authorName}</div>
                                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '0.5rem' }}>{bookTitle}</h1>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <div style={{ flex: 1, padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Genre</div>
                                <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{genre}</div>
                            </div>
                            <div style={{ flex: 1, padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Length</div>
                                <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{readTime}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Synopsis & Excerpt */}
                    <div>
                        <div style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Synopsis</h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#334155' }}>
                                {synopsis}
                            </p>
                        </div>

                        <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-12px', left: '2rem', background: '#0f172a', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={12} /> Read Excerpt
                            </div>

                            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginTop: '1rem', marginBottom: '2rem', textAlign: 'center' }}>Chapter 1</h3>

                            <div style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.15rem',
                                lineHeight: 1.8,
                                color: '#1e293b'
                            }}>
                                {excerpt.split('\n\n').map((paragraph, i) => (
                                    <p key={i} style={{ marginBottom: '1.5rem', textIndent: '2rem' }}>{paragraph}</p>
                                ))}
                            </div>

                            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                                <button style={{
                                    background: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem 2rem',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'background 0.2s'
                                }}>
                                    Pre-order Complete Book <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Versana CTA */}
                        <div style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem', borderTop: '1px solid #e2e8f0' }}>
                            <Sparkles size={20} color="#6366f1" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Written with Versana</h4>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                The author used the Versana Context Matrix and AI Co-Pilot to develop this universe.
                            </p>
                            <Link href="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Start your novel today &rarr;</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
