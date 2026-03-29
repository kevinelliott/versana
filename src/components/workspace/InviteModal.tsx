'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';

interface Member {
    id: string;
    email: string;
    role: 'owner' | 'editor' | 'commenter' | 'viewer';
}

export default function InviteModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { activeWorkspace } = useWorkspace();
    const [members, setMembers] = useState<Member[]>([]);
    const [emailInput, setEmailInput] = useState('');
    const [roleInput, setRoleInput] = useState<'editor' | 'commenter' | 'viewer'>('editor');
    const [isLoading, setIsLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !activeWorkspace) return;
        
        const fetchMembers = async () => {
            setIsLoading(true);
            try {
                // Fetch members utilizing the new workspace_members table
                // This would be an endpoint like /api/workspaces/[id]/members
                const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members`);
                if (res.ok) {
                    const data = await res.json();
                    setMembers(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMembers();
    }, [isOpen, activeWorkspace]);

    if (!isOpen) return null;

    const handleInvite = async () => {
        if (!emailInput.trim() || !activeWorkspace) return;
        setIsInviting(true);
        setError(null);

        try {
            const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.trim(), role: roleInput })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            const newMember = await res.json();
            if (newMember) {
                setMembers([...members, newMember]);
                setEmailInput('');
            }
        } catch (err: unknown) {
            setError((err as Error).message || 'Failed to invite user. Do they have an account?');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90vw', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', position: 'relative' }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--accent-blue)' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Share Workspace</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Manage co-authors and editorial access.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input 
                            type="email" 
                            placeholder="Collaborator email address" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <select 
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value as any)}
                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                        <option value="editor">Editor</option>
                        <option value="commenter">Commenter</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    <button 
                        onClick={handleInvite}
                        disabled={isInviting || !emailInput}
                        style={{ padding: '0 1rem', borderRadius: '6px', border: 'none', background: 'var(--accent-blue)', color: 'white', fontWeight: 600, cursor: isInviting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {isInviting ? <Loader2 size={16} className="spinner" /> : 'Invite'}
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', background: 'var(--accent-terracotta)', color: 'white', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>People with access</h3>
                    
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                            <Loader2 size={24} className="spinner" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {members.map(member => (
                                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>
                                            {member.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{member.email}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize', padding: '0.25rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                        {member.role === 'owner' ? 'Owner' : member.role}
                                    </span>
                                </div>
                            ))}
                            {members.length === 0 && (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '1rem 0' }}>Only you have access.</p>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <LinkIcon size={16} /> Copy invite link
                    </button>
                    <button 
                        onClick={onClose}
                        style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
