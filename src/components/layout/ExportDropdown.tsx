'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileText, Book } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import styles from './ExportDropdown.module.css';

export default function ExportDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { activeWorkspace, activeBook } = useWorkspace();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleExport = async (format: 'epub' | 'docx') => {
        if (!activeWorkspace || !activeBook || isExporting) return;
        setIsExporting(true);
        setIsOpen(false);

        try {
            const url = `/api/export?workspaceId=${activeWorkspace.id}&bookId=${activeBook.id}&format=${format}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;

            const filename = `${activeBook.title ? activeBook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'export'}.${format}`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export manuscript. Make sure you have chapters saved.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.exportButton}
                onClick={toggleDropdown}
                title="Export Manuscript"
                disabled={isExporting || !activeBook}
            >
                {isExporting ? <Download size={16} className="spinner" /> : <Download size={16} />}
                {isExporting ? 'Exporting...' : 'Export'}
                <ChevronDown size={14} />
            </button>

            {isOpen && activeBook && (
                <div className={styles.dropdown}>
                    <button className={styles.menuItem} onClick={() => handleExport('epub')}>
                        <Book size={16} /> Export as EPUB
                    </button>
                    <div className={styles.divider} />
                    <button className={styles.menuItem} onClick={() => handleExport('docx')}>
                        <FileText size={16} /> Export as DOCX (Word)
                    </button>
                </div>
            )}
        </div>
    );
}
