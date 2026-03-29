'use client';

import React, { useState, useEffect } from 'react';
import { Target, PencilLine, Check } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function GoalTracker() {
    const { wordCount, activeBook, setBooks, setActiveBook } = useWorkspace();
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Default target if none set
    const target = activeBook?.target_word_count || 50000;
    
    useEffect(() => {
        setInputValue(target.toString());
    }, [target]);

    const handleSave = async () => {
        if (!activeBook) return;
        const newTarget = parseInt(inputValue, 10);
        if (isNaN(newTarget) || newTarget <= 0) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/books/${activeBook.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_word_count: newTarget })
            });

            if (res.ok) {
                const updatedBook = await res.json();
                setActiveBook(updatedBook);
                setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
            }
        } catch (e) {
            console.error('Failed to update target', e);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    if (!activeBook) return null;

    const progress = Math.min(100, Math.max(0, (wordCount / target) * 100));
    const radius = 9;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
            {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '4px' }}>
                    <input 
                        type="number" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{ width: '60px', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') setIsEditing(false);
                        }}
                        disabled={isSaving}
                    />
                    <button onClick={handleSave} disabled={isSaving} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex' }}>
                        <Check size={14} />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => setIsEditing(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    title={`Goal: ${wordCount.toLocaleString()} / ${target.toLocaleString()} words. Click to edit.`}
                >
                    <div style={{ position: 'relative', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                                cx="11" cy="11" r={radius}
                                stroke="var(--border-light)"
                                strokeWidth="3" fill="none"
                            />
                            <circle
                                cx="11" cy="11" r={radius}
                                stroke={progress >= 100 ? 'var(--accent-green)' : 'var(--accent-blue)'}
                                strokeWidth="3" fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        {progress >= 100 ? (
                            <Target size={10} color="var(--accent-green)" style={{ position: 'absolute' }} />
                        ) : (
                            <PencilLine size={10} color="var(--text-secondary)" style={{ position: 'absolute' }} />
                        )}
                    </div>
                    <span>
                        <span style={{ fontWeight: 600 }}>{wordCount.toLocaleString()}</span>
                        <span style={{ opacity: 0.5 }}> / {target >= 1000 ? `${(target/1000).toFixed(target % 1000 === 0 ? 0 : 1)}k` : target}</span>
                    </span>
                </div>
            )}
            <span style={{ opacity: 0.3 }}>•</span>
        </div>
    );
}
