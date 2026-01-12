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
            
            // 1. Exact Content Height (11in - 2in margins = 864px)
            const PAGE_HEIGHT = 864
            
            let currentHeight = 0
            let pageNumber = 1

            doc.descendants((node, pos) => {
              if (node.isBlock) {
                // 2. Calculate Height based on our STRICT CSS rules
                let nodeHeight = 0
                
                if (node.type.name === 'heading') {
                   const level = node.attrs.level
                   // H1: 40px line-height + 24px margin = 64px
                   // H2: 32px line-height + 16px margin = 48px
                   nodeHeight = level === 1 ? 64 : 48 
                } else {
                   // Paragraph: 24px line-height + 12px margin
                   // Approx 85 chars per line for US Letter width
                   const lines = Math.ceil(node.textContent.length / 85) || 1
                   nodeHeight = lines * 24 + 12
                }

                // 3. The Break Logic
                if (currentHeight + nodeHeight > PAGE_HEIGHT) {
                   const breakElement = document.createElement('div')
                   breakElement.className = 'page-break-gap'
                   breakElement.dataset.page = (pageNumber + 1).toString()
                   
                   decorations.push(
                     Decoration.widget(pos, breakElement, { side: -1 })
                   )
                   
                   // Reset for next page
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