import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './KnowledgeBase.module.css';
import { BookOpen, MapPin, User, Hash, Edit3, Trash2, Check, X, Shield } from 'lucide-react';

const ICONS: Record<string, React.FC<Record<string, unknown>>> = {
    'character': User,
    'place': MapPin,
    'setting': MapPin,
    'plot hook': Hash,
    'default': BookOpen
};

export default function KnowledgeBase() {
    const { activeWorkspace, selectedLoreId, setSelectedLoreId } = useWorkspace();
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
    const [editName, setEditName] = useState('');
    const [editSynopsis, setEditSynopsis] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

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

    const activeItem = loreEntities.find(l => l.id === selectedLoreId) || loreEntities[0];

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

    if (!loreEntities.length) {
        return (
            <div className={styles.emptyStateContainer}>
                <div className={styles.emptyStateContent}>
                    <Shield size={48} className={styles.emptyIcon} />
                    <h2>Your Knowledge Base is Empty</h2>
                    <p>Go to your planning and outlining phases to create your first entities, or let the AI help you generate them.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
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
                </div>
            </div>

            <div className={styles.contentArea}>
                {activeItem ? (
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
                    </div>
                ) : (
                    <div className={styles.noSelection}>Select an entry from the sidebar to view details.</div>
                )}
            </div>
        </div>
    );
}
