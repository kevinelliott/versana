import React from 'react';
import { BookOpen, Share2, Sparkles, ChevronRight } from 'lucide-react';

export default function MiniSite({ params }: { params: { shareId: string } }) {
    // In a real application, we would fetch the Workspace/Project by shareId from Supabase
    // const workspace = await supabase.from('workspaces').select('*').eq('share_id', params.shareId).single();

    // Mock data for the demonstration
    const bookTitle = "The Obsidian Crown";
    const authorName = "K. R. Author";
    const synopsis = "When Captain Aris discovers a derelict Hegemony frigate drifting at the edge of the charted sectors, he expects a simple salvage operation. Instead, he uncovers a conspiracy that threatens to ignite a galaxy-wide war. With his crew of misfits and a rogue AI, Aris must race against time to prevent the Obsidian Crown from falling into the hands of the Rebellion.";
    const coverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
    const genre = "Sci-Fi Thriller";
    const readTime = "Est. 12 Hours";

    // Mock excerpt from Phase 4
    const excerpt = `The snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, his breath pluming in the frigid air. The Rebellion could not afford to lose this vantage point. If the Hegemony breached the wall, the entire sector would fall within the week.

"They're coming from the eastern ridge," shouted Mira, pointing toward the jagged peaks. She wiped frost from her visor, her expression grim. "The scanners are picking up heavy armor. Mechanized infantry."

Aris cursed softly. They had been outmaneuvered. The intelligence reports had promised a skeletal garrison, not a full battalion of shock troops. He signaled the rest of his squad to hold position.`;

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
                            <a href="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Start your novel today &rarr;</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
