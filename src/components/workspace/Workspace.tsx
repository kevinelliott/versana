'use client';

import React, { useState, MouseEvent, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { LoreTag } from './editor/LoreTagExtension';
import HoverCard from './HoverCard';
import styles from './Workspace.module.css';
import './editor/editor.css'; // We'll need a tiny bit of CSS for TipTap

// Pre-fetched mock data representing the Context Matrix / Lore Bible
const LORE_DATABASE = [
    {
        id: 'char_1',
        name: 'Captain Aris',
        aliases: ['Aris'],
        type: 'character' as const,
        synopsis: 'Rogue starship captain. Secretly loyal to the rebellion. Currently carrying a severe blaster wound to the left shoulder.',
        firstAppearance: 'Chapter 2',
        mentions: 143,
        status: 'Alive / On Ship',
        associated: ['The Rebellion', 'The Iron Hawk']
    },
    {
        id: 'plot_1',
        name: 'The Rebellion',
        aliases: ['Rebellion'],
        type: 'plot' as const,
        synopsis: 'A scattered coalition of outer-rim planets fighting against the Hegemony. Severely underfunded and relying on guerrilla tactics.',
        firstAppearance: 'Chapter 1',
        mentions: 412,
        status: 'Active',
        associated: ['Captain Aris', 'Mira']
    },
    {
        id: 'char_2',
        name: 'Mira',
        aliases: [],
        type: 'character' as const,
        synopsis: 'Aris’s second-in-command and chief engineer. Pragmatic, ruthless, and distrustful of the core worlds.',
        firstAppearance: 'Chapter 3',
        mentions: 89,
        status: 'Alive / On Ridge',
        associated: ['Captain Aris', 'The Iron Hawk']
    }
];

export default function Workspace() {
    const [hoverState, setHoverState] = useState<{
        entity: any | null;
        x: number;
        y: number;
        visible: boolean;
    }>({
        entity: null,
        x: 0,
        y: 0,
        visible: false,
    });

    const [hideTags, setHideTags] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Write your masterpiece...',
            }),
            LoreTag,
        ],
        immediatelyRender: false,
        content: `
            <p>The snow fell heavy over the battlements of the old fort. Captain Aris tightened his grip on the plasma rifle, his breath pluming in the frigid air. The Rebellion could not afford to lose this vantage point.</p>
            <p>"They're coming from the eastern ridge," shouted Mira, pointing toward the jagged peaks.</p>
        `,
        editorProps: {
            attributes: {
                class: styles.editorArea,
            },
        },
    });

    // Debounced NER matcher
    useEffect(() => {
        if (!editor) return;

        const updateTags = () => {
            // Very naive NER mock: scan text and apply LoreTag Marks
            // In reality, this would be a server action or background worker 
            // returning positions to update.
            const { state, view } = editor;
            const tr = state.tr;
            let docChanged = false;

            // Remove all existing LoreTags first to avoid overlap issues in this mock
            // This is unoptimized mock logic: 
            state.doc.descendants((node, pos) => {
                if (node.isText) {
                    node.marks.forEach(mark => {
                        if (mark.type.name === 'loreTag') {
                            tr.removeMark(pos, pos + node.nodeSize, mark.type);
                            docChanged = true;
                        }
                    });
                }
            });

            // Re-apply marks
            state.doc.descendants((node, pos) => {
                if (node.isText && node.text) {
                    LORE_DATABASE.forEach(entity => {
                        const terms = [entity.name, ...entity.aliases];
                        terms.forEach(term => {
                            const regex = new RegExp(`\\b(${term})\\b`, 'gi');
                            let match;
                            while ((match = regex.exec(node.text!)) !== null) {
                                const start = pos + match.index;
                                const end = start + match[0].length;

                                const mark = state.schema.marks.loreTag.create({
                                    id: entity.id,
                                    entityType: entity.type,
                                    class: `${styles.loreTag} ${styles[entity.type]}`,
                                    'data-entity-str': JSON.stringify(entity)
                                });
                                tr.addMark(start, end, mark);
                                docChanged = true;
                            }
                        });
                    });
                }
            });

            if (docChanged) {
                view.dispatch(tr);
            }
        };

        // Run initially
        updateTags();

        // Listen for updates
        let timeout: NodeJS.Timeout;
        const onUpdate = () => {
            clearTimeout(timeout);
            timeout = setTimeout(updateTags, 500); // 500ms debounce
        };

        editor.on('update', onUpdate);
        return () => {
            editor.off('update', onUpdate);
            clearTimeout(timeout);
        };
    }, [editor]);

    // Handle hovering via Event Delegation on the editor container
    useEffect(() => {
        const handleMouseOver = (e: Event) => {
            const mouseEvent = e as globalThis.MouseEvent;
            const target = mouseEvent.target as HTMLElement;
            if (target && target.hasAttribute('data-lore-tag')) {
                if (hideTags) return; // Don't show if tags are hidden

                const entityStr = target.getAttribute('data-entity-str');
                if (entityStr) {
                    const entity = JSON.parse(entityStr);
                    const rect = target.getBoundingClientRect();
                    setHoverState({
                        entity,
                        x: rect.left,
                        y: rect.top,
                        visible: true
                    });
                }
            }
        };

        const documentWrapper = document.querySelector('.ProseMirror');
        if (documentWrapper) {
            documentWrapper.addEventListener('mouseover', handleMouseOver);
        }

        return () => {
            if (documentWrapper) {
                documentWrapper.removeEventListener('mouseover', handleMouseOver);
            }
        };
    }, [editor, hideTags]);

    const handleEntityLeave = () => {
        setHoverState(prev => ({ ...prev, visible: false }));
    };

    return (
        <div className={styles.workspace} onClick={hoverState.visible ? handleEntityLeave : undefined}>
            <div className={`${styles.editorContainer} ${hideTags ? 'hide-lore-tags' : ''}`}>
                <div className={styles.toolbar}>
                    <button
                        className={styles.toolBtn}
                        onClick={() => setHideTags(!hideTags)}
                    >
                        {hideTags ? 'Show Tags' : 'Hide Tags'}
                    </button>
                </div>

                <div className={styles.documentHeader}>
                    <h1 className={styles.documentTitle} contentEditable suppressContentEditableWarning>
                        Chapter 4: The Winter Siege
                    </h1>
                </div>

                <EditorContent editor={editor} />
            </div>

            <HoverCard
                entity={hoverState.entity || LORE_DATABASE[0]}
                x={hoverState.x}
                y={hoverState.y}
                visible={hoverState.visible}
                onClose={handleEntityLeave}
            />
        </div>
    );
}
