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
            
            // 1. Define Page Dimensions (in pixels)
            // US Letter (96 DPI): 8.5" x 11" = 816px x 1056px
            // Vertical Margins: 1" top + 1" bottom = 192px
            // Content Height per page = 1056px - 192px = 864px
            const PAGE_CONTENT_HEIGHT = 800 
            
            let currentHeight = 0
            let pageNumber = 1

            // 2. Loop through every node in the document
            doc.descendants((node, pos) => {
              // We only care about block-level nodes (paragraphs, headings, etc.)
              if (node.isBlock) {
                // Approximate height calculation
                // (In a real app, you'd measure the DOM, but this is faster for a prototype)
                // We assume ~24px per line of text + spacing
                const nodeText = node.textContent
                const lines = Math.ceil(nodeText.length / 80) || 1 // Approx 80 chars per line
                const estimatedHeight = lines * 24 + 16 // 24px line-height + 16px margin

                if (currentHeight + estimatedHeight > PAGE_CONTENT_HEIGHT) {
                   // 3. If this node pushes us over the limit, insert a Page Break Decoration BEFORE it
                   const breakElement = document.createElement('div')
                   breakElement.className = 'page-break-gap'
                   breakElement.dataset.page = (pageNumber + 1).toString()
                   
                   decorations.push(
                     Decoration.widget(pos, breakElement, { side: -1 })
                   )
                   
                   // Reset height for the new page
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