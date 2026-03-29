import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentOptions {
    HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            setComment: (id: string) => ReturnType;
            unsetComment: (id: string) => ReturnType;
        };
    }
}

export const CommentExtension = Mark.create<CommentOptions>({
    name: 'comment',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'comment-highlight',
            },
        };
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-comment-id'),
                renderHTML: attributes => {
                    if (!attributes.id) return {};
                    return { 'data-comment-id': attributes.id };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-comment-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setComment:
                (id: string) =>
                ({ commands }) => {
                    return commands.setMark(this.name, { id });
                },
            unsetComment:
                (id: string) =>
                ({ tr, dispatch }) => {
                    if (dispatch) {
                        // Find all instances of this exact comment ID and remove the mark
                        const { doc } = tr;
                        doc.descendants((node, pos) => {
                            if (node.marks) {
                                const mark = node.marks.find(m => m.type.name === this.name && m.attrs.id === id);
                                if (mark) {
                                    tr.removeMark(pos, pos + node.nodeSize, mark.type);
                                }
                            }
                        });
                    }
                    return true;
                },
        };
    },
});
