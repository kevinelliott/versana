import { Mark, mergeAttributes } from '@tiptap/core';

export interface InlineSuggestionOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineSuggestion: {
      setInlineSuggestion: (attributes: { id: string, suggestion: string, reason: string }) => ReturnType
      unsetInlineSuggestion: (id: string) => ReturnType
    }
  }
}

export const InlineSuggestionMark = Mark.create<InlineSuggestionOptions>({
  name: 'inlineSuggestion',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'inline-suggestion-mark',
      },
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) return {}
          return { 'data-id': attributes.id }
        },
      },
      suggestion: {
        default: null,
        parseHTML: element => element.getAttribute('data-suggestion'),
        renderHTML: attributes => {
          if (!attributes.suggestion) return {}
          return { 'data-suggestion': attributes.suggestion }
        },
      },
      reason: {
        default: null,
        parseHTML: element => element.getAttribute('data-reason'),
        renderHTML: attributes => {
          if (!attributes.reason) return {}
          return { 'data-reason': attributes.reason }
        },
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-suggestion]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setInlineSuggestion: (attributes) => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      unsetInlineSuggestion: (id) => ({ tr, dispatch }) => {
        if (dispatch) {
          const { doc } = tr
          doc.descendants((node, pos) => {
            if (node.isText && node.marks) {
              const mark = node.marks.find(m => m.type.name === this.name && m.attrs.id === id)
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
