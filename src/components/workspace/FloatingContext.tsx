'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ToggleLeft, ToggleRight, X, Maximize2 } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function FloatingContext() {
    const { activeWorkspace, isContextMatrixDetached, setIsContextMatrixDetached, contextToggles: toggles, setContextToggles: setToggles } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;
    
    const [position, setPosition] = useState({ x: 800, y: 100 });
    useEffect(() => { setPosition({ x: Math.max(0, window.innerWidth - 350), y: 100 }); }, []);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });


    const handleToggle = (id: string) => {
        setToggles(toggles.map(t => t.id === id ? { ...t, active: !t.active } : t));
    };

    // Drag handlers
    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        };
        const onMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    if (!isContextMatrixDetached) return null;

    return (
        <div style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: '300px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header / Drag Handle */}
            <div 
                onMouseDown={onMouseDown}
                style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                    <Sparkles size={14} color="var(--tag-purple-text)" />
                    {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button 
                        onClick={() => setIsContextMatrixDetached(false)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        title="Reattach to Sidebar"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button 
                        onClick={() => setIsContextMatrixDetached(false)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Matrix Content */}
            <div style={{ padding: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {toggles.map(item => (
                        <div
                            key={item.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: item.active ? 'var(--bg-secondary)' : 'transparent',
                                opacity: item.active ? 1 : 0.6
                            }}
                            onClick={() => handleToggle(item.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: `var(--tag-${item.type === 'character' ? 'blue' : item.type === 'setting' ? 'green' : 'orange'}-text, var(--text-primary))`
                                }} />
                                {item.label}
                            </div>
                            {item.active ? (
                                <ToggleRight size={16} color="var(--tag-purple-text)" />
                            ) : (
                                <ToggleLeft size={16} color="var(--text-muted)" />
                            )}
                        </div>
                    ))}
                    {toggles.length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            No active context elements.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
