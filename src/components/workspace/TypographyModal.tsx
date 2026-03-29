import React, { useRef, useEffect } from 'react';
import styles from './TypographyModal.module.css';
import { useWorkspace } from '@/context/WorkspaceContext';

interface Props {
    onClose: () => void;
}

export default function TypographyModal({ onClose }: Props) {
    const { typography, setTypography } = useWorkspace();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className={styles.typographyModal} ref={modalRef}>
            <div className={styles.modalHeader}>
                Typography & Layout
            </div>
            
            <div className={styles.section}>
                <label className={styles.label}>Font Family</label>
                <div className={styles.buttonRow}>
                    <button 
                        className={`${styles.fontBtn} ${typography.fontFamily === 'serif' ? styles.active : ''}`}
                        onClick={() => setTypography({...typography, fontFamily: 'serif'})}
                        style={{ fontFamily: 'Georgia, serif' }}
                    >
                        Serif
                    </button>
                    <button 
                        className={`${styles.fontBtn} ${typography.fontFamily === 'sans' ? styles.active : ''}`}
                        onClick={() => setTypography({...typography, fontFamily: 'sans'})}
                        style={{ fontFamily: 'system-ui, sans-serif' }}
                    >
                        Sans
                    </button>
                    <button 
                        className={`${styles.fontBtn} ${typography.fontFamily === 'mono' ? styles.active : ''}`}
                        onClick={() => setTypography({...typography, fontFamily: 'mono'})}
                        style={{ fontFamily: 'monospace' }}
                    >
                        Mono
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <label className={styles.label}>Font Size: {typography.fontSize}px</label>
                <input 
                    type="range" 
                    min="14" max="28" step="1" 
                    value={typography.fontSize}
                    onChange={(e) => setTypography({...typography, fontSize: Number(e.target.value)})}
                    className={styles.slider}
                />
            </div>

            <div className={styles.section}>
                <label className={styles.label}>Line Height: {typography.lineHeight}x</label>
                <input 
                    type="range" 
                    min="1.2" max="2.5" step="0.1" 
                    value={typography.lineHeight}
                    onChange={(e) => setTypography({...typography, lineHeight: Number(e.target.value)})}
                    className={styles.slider}
                />
            </div>

            <div className={styles.section}>
                <label className={styles.label}>Paragraph Width: {typography.maxWidth}px</label>
                <input 
                    type="range" 
                    min="500" max="1000" step="50" 
                    value={typography.maxWidth}
                    onChange={(e) => setTypography({...typography, maxWidth: Number(e.target.value)})}
                    className={styles.slider}
                />
            </div>
        </div>
    );
}
