import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './KnowledgeBase.module.css';
import workspaceStyles from './Workspace.module.css';
import { BookOpen, MapPin, User, Hash, Edit3, Trash2, Check, X, Shield, MessageCircle, Send, Plus } from 'lucide-react';

const ICONS: Record<string, React.FC<Record<string, unknown>>> = {
    'character': User,
    'place': MapPin,
    'setting': MapPin,
    'plot hook': Hash,
    'default': BookOpen
};

export default function KnowledgeBase() {
    const { activeWorkspace, selectedLoreId, setSelectedLoreId } = useWorkspace();
    const isNonFicProject = activeWorkspace?.genre?.toLowerCase().includes('[non-fiction]') ?? false;
    interface LoreEntity {
        id: string;
        name: string;
        synopsis: string;
        type: string;
        aliases?: string[];
    }
    const [loreEntities, setLoreEntities] = useState<LoreEntity[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('Character');
    const [newSynopsis, setNewSynopsis] = useState('');
    const [editName, setEditName] = useState('');
    const [editSynopsis, setEditSynopsis] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');

    const activeItem = loreEntities.find(l => l.id === selectedLoreId) || loreEntities[0];
    const isCharacter = activeItem?.type?.toLowerCase().includes('character') ?? false;

    const [messages, setMessages] = useState<{ id: string, role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset tab and messages when active item changes
    useEffect(() => {
        setActiveTab('details');
        setMessages([]);
        setInput('');
    }, [activeItem?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newMessage = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/character-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: activeWorkspace?.id,
                    characterContext: activeItem ? `${activeItem.name}: ${activeItem.synopsis}` : '',
                    messages: updatedMessages
                })
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => null);
                let errMsg = 'Failed to connect to AI server';
                try {
                    const errJson = JSON.parse(errText || '{}');
                    if (errJson.error) errMsg = errJson.error;
                } catch {
                    if (errText) errMsg = errText;
                }
                setMessages(prev => [...prev, { id: 'bot_' + Date.now().toString(), role: 'assistant', content: `⚠️ System Notification: ${errMsg}` }]);
                return;
            }

            if (!res.body) throw new Error('Network error: No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            setMessages(prev => [...prev, { id: 'bot_' + Date.now().toString(), role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1].content += chunk;
                    return next;
                });
            }
        } catch (err: unknown) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, { id: 'bot_' + Date.now().toString(), role: 'assistant', content: (err as Error).message || "⚠️ System Notification: An unexpected error occurred." }]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!activeWorkspace) return;
        setLoading(true);
        fetch(`/api/lore?workspaceId=${activeWorkspace.id}`)
            .then(res => res.json())
            .then(data => {
                setLoreEntities(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [activeWorkspace]);

    // Active item already defined above

    const handleEdit = (item: LoreEntity) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditSynopsis(item.synopsis);
    };

    const handleSave = async (id: string) => {
        if (!editName.trim()) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/lore/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, synopsis: editSynopsis })
            });
            if (res.ok) {
                const updated = await res.json();
                setLoreEntities(prev => prev.map(l => l.id === id ? updated : l));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            setEditingId(null);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteConfirmation(id);
    };

    const handleCreate = async () => {
        if (!newName.trim() || !newType.trim() || !activeWorkspace) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/lore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    workspaceId: activeWorkspace.id,
                    name: newName, 
                    type: newType,
                    synopsis: newSynopsis 
                })
            });
            if (res.ok) {
                const newEntry = await res.json();
                setLoreEntities(prev => [...prev, newEntry]);
                setIsCreatingNew(false);
                setSelectedLoreId(newEntry.id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        const id = deleteConfirmation;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/lore/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLoreEntities(prev => prev.filter(l => l.id !== id));
                if (selectedLoreId === id) setSelectedLoreId(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
            setDeleteConfirmation(null);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading Knowledge Base...</div>;
    }

    if (!loreEntities.length && !isCreatingNew) {
        return (
            <div className={styles.emptyStateContainer}>
                <div className={styles.emptyStateContent}>
                    <Shield size={48} className={styles.emptyIcon} />
                    <h2>Your {isNonFicProject ? 'Knowledge Base' : 'Lore Bible'} is Empty</h2>
                    <p style={{ maxWidth: '500px', margin: '0 auto', lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        This is the beating heart of your universe. Go to Phase 3 to let the AI organically brainstorm entities for you, or jump into Phase 4 and tag words manually while drafting. Alternatively, you can add an entry manually below.
                    </p>
                    <button
                        onClick={() => {
                            setIsCreatingNew(true);
                            setSelectedLoreId(null);
                            setNewName('');
                            setNewType(isNonFicProject ? 'Topic' : 'Character');
                            setNewSynopsis('');
                        }}
                        style={{
                            background: 'var(--text-primary)',
                            color: 'var(--bg-primary)',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}
                    >
                        <Plus size={16} /> Add First Entry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={workspaceStyles.workspaceContainer}>
            <div className={workspaceStyles.workspaceGlobalHeader}>
                <h1 className={workspaceStyles.phaseTitle}>
                    <span className={workspaceStyles.phaseLabel}>{isNonFicProject ? 'Reference' : 'Lore'}</span>
                    {isNonFicProject ? 'Knowledge Base' : 'Context Matrix'}
                </h1>
                <p className={workspaceStyles.phaseSubtitle}>
                    {isNonFicProject ? 'Manage your topics, research data, and factual entities.' : 'Manage your characters, settings, and lore entities.'}
                </p>
            </div>

            <div className={`${workspaceStyles.workspace} ${styles.kbWrapper}`}>
                {deleteConfirmation && (
                    <div className={styles.modalOverlay} style={{ zIndex: 10000 }}>
                        <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                            <h2 className={styles.modalTitle} style={{ color: 'var(--text-danger, #ef4444)', marginBottom: '1rem' }}>Delete Entry</h2>
                            <p className={styles.modalDesc} style={{ marginBottom: '2rem' }}>Are you sure you want to delete this knowledge base entry? This action is permanent and cannot be undone.</p>
                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={() => setDeleteConfirmation(null)} disabled={isSaving}>Cancel</button>
                                <button className={styles.modalActionBtn} onClick={confirmDelete} disabled={isSaving} style={{ background: 'var(--text-danger, #ef4444)', borderColor: 'var(--text-danger, #ef4444)' }}>
                                    {isSaving ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>Entries ({loreEntities.length})</h3>
                    </div>
                    <div className={styles.entryList}>
                        {loreEntities.map(item => {
                            const typeStr = (item.type || 'Other').toLowerCase();
                            let Icon = ICONS.default;
                            if (typeStr.includes('character')) Icon = ICONS.character;
                            else if (typeStr.includes('place') || typeStr.includes('setting')) Icon = ICONS.place;
                            else if (typeStr.includes('plot')) Icon = ICONS['plot hook'];

                            return (
                                <button
                                    key={item.id}
                                    className={`${styles.entryBtn} ${selectedLoreId === item.id || (!selectedLoreId && activeItem?.id === item.id) ? styles.activeEntry : ''}`}
                                    onClick={() => setSelectedLoreId(item.id)}
                                >
                                    <Icon size={16} className={styles.entryIcon} />
                                    <span className={styles.entryName}>{item.name}</span>
                                </button>
                            );
                        })}
                        <button
                            className={styles.entryBtn}
                            style={{ opacity: 0.8, marginTop: '0.5rem', border: '1px dashed var(--border-light)' }}
                            onClick={() => {
                                setIsCreatingNew(true);
                                setSelectedLoreId(null);
                                setNewName('');
                                setNewType(isNonFicProject ? 'Topic' : 'Character');
                                setNewSynopsis('');
                            }}
                        >
                            <Plus size={16} className={styles.entryIcon} />
                            <span className={styles.entryName}>New Entry</span>
                        </button>
                    </div>
                </div>

                <div className={styles.contentArea}>
                    {isCreatingNew ? (
                        <div className={styles.itemDetails}>
                            <div className={styles.itemHeader}>
                                <div className={styles.headerTitle} style={{ width: '100%' }}>
                                    <h2>Create New {isNonFicProject ? 'Knowledge Entry' : 'Lore Entity'}</h2>
                                </div>
                                <div className={styles.headerActions}>
                                    <button onClick={handleCreate} disabled={isSaving || !newName.trim() || !newType.trim()} className={styles.saveBtn}><Check size={16} /> Create</button>
                                    <button onClick={() => setIsCreatingNew(false)} disabled={isSaving} className={styles.cancelBtn}><X size={16} /> Cancel</button>
                                </div>
                            </div>
                            <div className={styles.itemBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Entity Name</label>
                                    <input
                                        type="text"
                                        className={styles.editTitleInput}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Aria, The Nexus, Hyper-Drive"
                                        disabled={isSaving}
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Entity Type</label>
                                    <input
                                        type="text"
                                        className={styles.editTitleInput}
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        placeholder="e.g. Character, Place, Object, Rule"
                                        disabled={isSaving}
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Synopsis & Details</label>
                                    <textarea
                                        className={styles.editSynopsisArea}
                                        value={newSynopsis}
                                        onChange={(e) => setNewSynopsis(e.target.value)}
                                        placeholder="Describe this entity in detail..."
                                        disabled={isSaving}
                                        style={{ width: '100%', minHeight: '200px', fontSize: '1rem', padding: '0.75rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : activeItem ? (
                        <div className={styles.itemDetails}>
                            <div className={styles.itemHeader}>
                                <div className={styles.headerTitle}>
                                    <span className={styles.itemBadge}>{activeItem.type || 'Entity'}</span>
                                    {editingId === activeItem.id ? (
                                        <input
                                            type="text"
                                            className={styles.editTitleInput}
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            disabled={isSaving}
                                        />
                                    ) : (
                                        <h2>{activeItem.name}</h2>
                                    )}
                                </div>
                                <div className={styles.headerActions}>
                                    {editingId === activeItem.id ? (
                                        <>
                                            <button onClick={() => handleSave(activeItem.id)} disabled={isSaving || !editName.trim()} className={styles.saveBtn}><Check size={16} /> Save</button>
                                            <button onClick={() => setEditingId(null)} disabled={isSaving} className={styles.cancelBtn}><X size={16} /> Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(activeItem)} className={styles.actionBtn}><Edit3 size={16} /> Edit</button>
                                            <button onClick={() => handleDelete(activeItem.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}><Trash2 size={16} /> Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={styles.itemBody}>
                                <h3>Synopsis & Details</h3>
                                {editingId === activeItem.id ? (
                                    <textarea
                                        className={styles.editSynopsisArea}
                                        value={editSynopsis}
                                        onChange={(e) => setEditSynopsis(e.target.value)}
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <div className={styles.synopsisText}>
                                        {activeItem.synopsis ? activeItem.synopsis.split('\n').map((para: string, i: number) => (
                                            <p key={i}>{para}</p>
                                        )) : <span style={{ opacity: 0.5 }}>No synopsis provided for this entry.</span>}
                                    </div>
                                )}
                            </div>

                            {/* Character Chat specific feature */}
                            {isCharacter && (
                                <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '2rem', paddingTop: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => setActiveTab('details')}
                                            style={{
                                                background: activeTab === 'details' ? 'var(--bg-hover)' : 'transparent',
                                                border: '1px solid var(--border-light)',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)'
                                            }}
                                        >
                                            Metadata & Details
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('chat')}
                                            style={{
                                                background: activeTab === 'chat' ? 'var(--tag-purple-bg)' : 'transparent',
                                                border: activeTab === 'chat' ? '1px solid var(--tag-purple-text)' : '1px solid var(--border-light)',
                                                color: activeTab === 'chat' ? 'var(--tag-purple-text)' : 'var(--text-primary)',
                                                padding: '0.4rem 1rem',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <MessageCircle size={16} /> Character Lab Chat (GPT-4o)
                                        </button>
                                    </div>

                                    {activeTab === 'chat' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '400px', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
                                            <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                You are now chatting with the AI simulation of <strong>{activeItem.name}</strong>. They will respond strictly in character based on their Context Matrix synopsis.
                                            </div>
                                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {messages.length === 0 && (
                                                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary)' }}>
                                                        <MessageCircle size={32} style={{ opacity: 0.2, margin: '0 auto 0.5rem' }} />
                                                        <p>Say hello to {activeItem.name}.</p>
                                                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Ask them about their motivations, fears, or how they feel about other characters.</p>
                                                    </div>
                                                )}
                                                {messages.map((m) => (
                                                    <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                                            {m.role === 'user' ? 'You' : activeItem.name}
                                                        </div>
                                                        <div style={{
                                                            padding: '0.75rem 1rem',
                                                            borderRadius: '8px',
                                                            background: m.role === 'user' ? 'var(--text-primary)' : 'var(--bg-hover)',
                                                            color: m.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                                                            lineHeight: 1.5,
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {m.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {isLoading && (
                                                    <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                        {activeItem.name} is typing...
                                                    </div>
                                                )}
                                            </div>
                                            <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-secondary)', alignItems: 'center' }}>
                                                <input
                                                    value={input}
                                                    onChange={e => setInput(e.target.value)}
                                                    placeholder={`Message ${activeItem.name}...`}
                                                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                                    disabled={isLoading}
                                                />
                                                <button type="submit" disabled={isLoading || !input.trim()} style={{ marginLeft: '0.5rem', background: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid var(--tag-purple-text)', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Send size={18} />
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={styles.noSelection}>Select an entry from the sidebar to view details.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
