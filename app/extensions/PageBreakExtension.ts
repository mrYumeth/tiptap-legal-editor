import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

interface PageBreakState {
  decorations: DecorationSet
  pageHeights: number[]
}

export const PageBreakExtension = Extension.create({
  name: 'pageBreak',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey<PageBreakState>('page-break')
    
    // US Letter: 8.5" x 11" at 96 DPI
    // Total height: 11" = 1056px
    // Margins: 1" top + 1" bottom = 192px
    // Content area: 864px per page
    const PAGE_CONTENT_HEIGHT = 864
    
    const calculateNodeHeight = (node: ProseMirrorNode): number => {
      if (!node.isBlock) return 0
      
      const type = node.type.name
      const textLength = node.textContent.length
      
      // Heading heights
      if (type === 'heading') {
        const level = node.attrs.level || 1
        switch (level) {
          case 1: return 68 // 2em font + line-height + margin
          case 2: return 56 // 1.5em font + line-height + margin
          case 3: return 48 // 1.17em font + line-height + margin
          default: return 48
        }
      }
      
      // Paragraph heights
      if (type === 'paragraph') {
        if (textLength === 0) return 36 // Empty paragraph with margin
        
        // Calculate lines based on average characters per line
        // At 816px width (8.5" - 2" margins) with 12pt Times New Roman
        // Average ~80-85 characters per line
        const charsPerLine = 82
        const lineHeight = 24 // 1.5 line-height at 12pt (16px)
        const paragraphMargin = 12
        
        const lines = Math.ceil(textLength / charsPerLine)
        return (lines * lineHeight) + paragraphMargin
      }
      
      // List item heights
      if (type === 'listItem') {
        if (textLength === 0) return 28
        
        const charsPerLine = 78 // Slightly less due to bullet/number
        const lineHeight = 24
        const itemMargin = 4
        
        const lines = Math.ceil(textLength / charsPerLine)
        return (lines * lineHeight) + itemMargin
      }
      
      // Bullet list / Ordered list (container)
      if (type === 'bulletList' || type === 'orderedList') {
        return 12 // Just margin, children are measured separately
      }
      
      // Code block
      if (type === 'codeBlock') {
        const lines = textLength > 0 ? Math.ceil(textLength / 75) : 1
        return (lines * 20) + 16 // Code line height + padding
      }
      
      // Blockquote
      if (type === 'blockquote') {
        return 16 // Padding/margin, content measured separately
      }
      
      // Horizontal rule
      if (type === 'horizontalRule') {
        return 32 // Line + margins
      }
      
      // Default fallback
      return 24
    }
    
    const calculatePageBreaks = (doc: ProseMirrorNode): DecorationSet => {
      const decorations: Decoration[] = []
      let currentPageHeight = 0
      let pageNumber = 1
      
      doc.descendants((node, pos) => {
        // Skip non-block nodes and list containers
        if (!node.isBlock) return
        
        // For lists, we want to measure items, not the container
        if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
          currentPageHeight += 12 // Just the list margin
          return
        }
        
        const nodeHeight = calculateNodeHeight(node)
        
        // Check if adding this node would overflow the page
        if (currentPageHeight + nodeHeight > PAGE_CONTENT_HEIGHT && currentPageHeight > 0) {
          // Insert page break decoration before this node
          const breakWidget = document.createElement('div')
          breakWidget.className = 'page-break-line'
          
          const pageLabel = document.createElement('div')
          pageLabel.className = 'page-number-label'
          pageLabel.textContent = `Page ${pageNumber + 1}`
          
          breakWidget.appendChild(pageLabel)
          
          decorations.push(
            Decoration.widget(pos, breakWidget, {
              side: -1,
              key: `page-break-${pageNumber}-${pos}`,
            })
          )
          
          // Start new page
          currentPageHeight = nodeHeight
          pageNumber++
        } else {
          currentPageHeight += nodeHeight
        }
      })
      
      return DecorationSet.create(doc, decorations)
    }

    return [
      new Plugin<PageBreakState>({
        key: pluginKey,
        
        state: {
          init(_, { doc }) {
            return {
              decorations: calculatePageBreaks(doc),
              pageHeights: [],
            }
          },
          
          apply(tr, value, oldState, newState) {
            if (!tr.docChanged) {
              // Just map existing decorations
              return {
                ...value,
                decorations: value.decorations.map(tr.mapping, tr.doc),
              }
            }
            
            // Recalculate page breaks
            return {
              decorations: calculatePageBreaks(newState.doc),
              pageHeights: [],
            }
          },
        },

        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state)
            return pluginState?.decorations || DecorationSet.empty
          },
        },
      }),
    ]
  },
})