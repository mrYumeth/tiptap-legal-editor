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
            
            // 🟢 FIX: Reduce height to 750px (approx 9.5 inches of content)
            // This leaves a large safety buffer at the bottom so text never overflows unexpectedly.
            const PAGE_CONTENT_HEIGHT = 750 
            
            let currentHeight = 0
            let pageNumber = 1

            doc.descendants((node, pos) => {
              if (node.isBlock) {
                let estimatedHeight = 0
                
                // 🟢 FIX: Handle Headings which are much taller
                if (node.type.name === 'heading') {
                   const level = node.attrs.level
                   // H1 = ~80px, H2 = ~60px
                   estimatedHeight = level === 1 ? 85 : (level === 2 ? 65 : 50)
                } else {
                   // Paragraphs
                   const nodeText = node.textContent
                   // Assume lines are shorter (70 chars) to be safe
                   const lines = Math.ceil(nodeText.length / 70) || 1 
                   estimatedHeight = lines * 24 + 12 
                }

                if (currentHeight + estimatedHeight > PAGE_CONTENT_HEIGHT) {
                   // Insert the break
                   const breakElement = document.createElement('div')
                   breakElement.className = 'page-break-gap'
                   breakElement.dataset.page = (pageNumber + 1).toString()
                   
                   decorations.push(
                     Decoration.widget(pos, breakElement, { side: -1 })
                   )
                   
                   currentHeight = estimatedHeight
                   pageNumber++
                } else {
                   currentHeight += estimatedHeight
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