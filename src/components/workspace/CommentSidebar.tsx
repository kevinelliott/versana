import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { X, Send, MoreVertical, MessageSquare } from 'lucide-react';

interface Comment {
    id: string;
    chapter_id: string;
    user_id: string;
    from_pos: number;
    to_pos: number;
    highlighted_text: string;
    comment_body: string;
    resolved: boolean;
    created_at: string;
    users?: { email: string };
}

export default function CommentSidebar({ currentChapterId, onResolve }: { currentChapterId: string, onResolve: (commentId: string) => void }) {
    const { activeWorkspace } = useWorkspace();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // We would use standard supabase API or realtime here
    const fetchComments = async () => {
        if (!currentChapterId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chapters/${currentChapterId}/comments`);
            if (res.ok) {
                setComments(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        
        const handleRefresh = () => fetchComments();
        window.addEventListener('VERSANA_REFRESH_COMMENTS', handleRefresh);
        return () => window.removeEventListener('VERSANA_REFRESH_COMMENTS', handleRefresh);
    }, [currentChapterId]);

    if (!activeWorkspace || !currentChapterId) return null;

    return (
        <div style={{ width: 300, background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 10 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={16} color="var(--accent-blue)" /> 
                    Comments
                </h3>
            </div>
            
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLoading ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', fontStyle: 'italic' }}>No active comments. Highlight text and right-click to add one.</div>
                ) : (
                    comments.map(c => (
                        <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>
                                            {(c.users?.email || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.users?.email || 'Unknown User'}</div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (onResolve) onResolve(c.id);
                                            try {
                                                await fetch(`/api/chapters/${currentChapterId}/comments`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ commentId: c.id, resolved: true })
                                                });
                                                setComments(prev => prev.filter(x => x.id !== c.id));
                                                // We should ideally remove the mark from TipTap here! That's what onResolve prop might do!
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        Resolve
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-light)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
                                    "{c.highlighted_text}"
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    {c.comment_body}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
