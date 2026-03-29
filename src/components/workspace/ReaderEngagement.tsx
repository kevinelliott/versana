'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Heart, Eye } from 'lucide-react';

export default function ReaderEngagement({ bookId, initialLikes, initialViews }: { bookId: string, initialLikes: number, initialViews: number }) {
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);
    const hasViewedRef = useRef(false);

    useEffect(() => {
        if (!hasViewedRef.current) {
            hasViewedRef.current = true;
            fetch(`/api/books/${bookId}/engage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'view' })
            }).catch(err => console.error("Failed to log view", err));
        }
    }, [bookId]);

    const handleLike = async () => {
        if (hasLiked) return;
        setHasLiked(true);
        setLikes(prev => prev + 1);

        try {
            await fetch(`/api/books/${bookId}/engage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'like' })
            });
        } catch (err) {
            console.error("Failed to post like", err);
            setHasLiked(false);
            setLikes(prev => prev - 1);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.9rem' }}>
                <Eye size={16} /> {initialViews + (hasViewedRef.current ? 1 : 0)} Views
            </div>
            <button 
                onClick={handleLike}
                disabled={hasLiked}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.5rem 1rem', borderRadius: '20px', 
                    border: `1px solid ${hasLiked ? '#f43f5e' : '#cbd5e1'}`, 
                    background: hasLiked ? '#fff1f2' : 'white', 
                    color: hasLiked ? '#e11d48' : '#475569',
                    fontSize: '0.9rem', fontWeight: 600, cursor: hasLiked ? 'default' : 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} /> 
                {hasLiked ? 'Liked' : 'Like'} ({likes})
            </button>
        </div>
    );
}
