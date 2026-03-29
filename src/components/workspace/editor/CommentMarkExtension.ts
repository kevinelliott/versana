import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentMarkOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentMark: {
      /**
       * Set a comment mark
       */
      setComment: (commentId: string) => ReturnType,
      /**
       * Unset a comment mark
       */
      unsetComment: (commentId: string) => ReturnType,
    }
  }
}

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: 'commentMark',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'collaboration-comment-mark',
      },
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {}
          }
          return { 'data-comment-id': attributes.commentId }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setComment: (commentId) => ({ commands }) => {
        return commands.setMark(this.name, { commentId })
      },
      unsetComment: (commentId) => ({ tr, dispatch }) => {
        // Find all CommentMarks and remove the specific one
        if (dispatch) {
          const { doc } = tr
          doc.descendants((node, pos) => {
            if (node.isText && node.marks) {
              const mark = node.marks.find(m => m.type.name === this.name && m.attrs.commentId === commentId)
              if (mark) {
                tr.removeMark(pos, pos + node.nodeSize, mark.type)
              }
            }
          })
        }
        return true
      },
    }
  },
});
