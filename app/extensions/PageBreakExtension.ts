import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const PageBreakExtension = Extension.create({
  name: 'pageBreak',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('page-break'),
        props: {
          decorations(state) {
            const { doc } = state
            const decorations: Decoration[] = []
            
            // 1. PAGE DIMENSIONS
            // US Letter (96 DPI) = 816px x 1056px
            // Margins: 1" top (96px) + 1" bottom (96px) = 192px
            // Content Height: 1056px - 192px = 864px
            const PAGE_CONTENT_HEIGHT = 864 
            
            let currentHeight = 0
            let pageNumber = 1

            doc.descendants((node, pos) => {
              // 2. FILTER: Only measure "leaf" blocks to avoid double-counting
              // We explicitly check for paragraph and headings. 
              // This prevents counting a List Wrapper AND the Paragraphs inside it.
              if (node.type.name === 'paragraph' || node.type.name === 'heading') {
                
                let nodeHeight = 0

                // 3. EXACT MATH (Must match app/globals.css)
                if (node.type.name === 'heading') {
                  const level = node.attrs.level
                  // H1: 40px line-height + 24px margin
                  // H2: 32px line-height + 16px margin
                  // H3+: Treat as H2 for safety
                  nodeHeight = level === 1 ? 64 : 48
                } else {
                  // Paragraph: 24px line-height + 12px margin
                  // Width: ~816px page - 192px padding = 624px content width
                  // Avg char width ~7.5px. 624 / 7.5 ≈ 83 chars per line
                  const lines = Math.ceil(node.textContent.length / 83) || 1
                  nodeHeight = lines * 24 + 12
                }

                // 4. INSERT BREAK IF OVERFLOW
                if (currentHeight + nodeHeight > PAGE_CONTENT_HEIGHT) {
                   const breakElement = document.createElement('div')
                   breakElement.className = 'page-break-gap'
                   breakElement.dataset.page = (pageNumber + 1).toString()
                   
                   decorations.push(
                     Decoration.widget(pos, breakElement, { side: -1 })
                   )
                   
                   // Reset height for the new page
                   currentHeight = nodeHeight
                   pageNumber++
                } else {
                   currentHeight += nodeHeight
                }
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})