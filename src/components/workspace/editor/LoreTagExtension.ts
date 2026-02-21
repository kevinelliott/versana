import { Mark, mergeAttributes } from '@tiptap/core';

export interface LoreTagOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        loreTag: {
            setLoreTag: (attributes: { id: string; entityType: string; class: string }) => ReturnType;
            unsetLoreTag: () => ReturnType;
        };
    }
}

export const LoreTag = Mark.create<LoreTagOptions>({
    name: 'loreTag',

    addOptions() {
        return {
            HTMLAttributes: {
                'data-lore-tag': '',
            },
        };
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-id'),
                renderHTML: (attributes) => {
                    if (!attributes.id) return {};
                    return { 'data-id': attributes.id };
                },
            },
            entityType: {
                default: 'character',
                parseHTML: (element) => element.getAttribute('data-type'),
                renderHTML: (attributes) => {
                    if (!attributes.entityType) return {};
                    return { 'data-type': attributes.entityType };
                },
            },
            class: {
                default: null,
                parseHTML: (element) => element.getAttribute('class'),
                renderHTML: (attributes) => {
                    if (!attributes.class) return {};
                    return { class: attributes.class };
                }
            },
            'data-entity-str': {
                default: null,
                parseHTML: (element) => element.getAttribute('data-entity-str'),
                renderHTML: (attributes) => {
                    if (!attributes['data-entity-str']) return {};
                    return { 'data-entity-str': attributes['data-entity-str'] };
                }
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-lore-tag]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setLoreTag:
                (attributes) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, attributes);
                    },
            unsetLoreTag:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
