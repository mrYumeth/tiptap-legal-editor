import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

export const PageBreakExtension = Extension.create({
  name: 'pageBreak',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('page-break')

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return DecorationSet.empty
          },
          apply(tr, value) {
            if (tr.getMeta(pluginKey)) {
              return tr.getMeta(pluginKey)
            }
            return value.map(tr.mapping, tr.doc)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handlePaste(view) {
            setTimeout(() => {
              if (view && !view.isDestroyed) {
                const tr = view.state.tr
                tr.setMeta('paste-update', true)
                view.dispatch(tr)
              }
            }, 100)
            return false
          }
        },
        view(editorView) {
          const updatePageBreaks = (view: any, doc: ProseMirrorNode) => {
            if (typeof window === 'undefined') return

            const decorations: Decoration[] = []
            
            // US Letter settings
            const CONTENT_HEIGHT = 864 
            
            let currentHeight = 0
            let pageNumber = 1

            // FIX: Use descendants instead of forEach to traverse nested nodes (lists, blockquotes)
            doc.descendants((node, pos) => {
              // 1. Skip measuring container blocks (like ul, ol, blockquote) 
              //    but return true to visit their children.
              if (node.isBlock && !node.isTextblock && !node.isAtom) {
                return true
              }

              // 2. Only measure "Leaf Blocks" (Paragraphs, Headings, CodeBlocks, Images)
              if (node.isTextblock || node.isAtom) {
                let nodeHeight = 0
                
                try {
                  const domNode = view.nodeDOM(pos) as HTMLElement
                  if (domNode instanceof HTMLElement) {
                    const rect = domNode.getBoundingClientRect()
                    nodeHeight = rect.height
                    
                    const style = window.getComputedStyle(domNode)
                    const marginTop = parseInt(style.marginTop) || 0
                    const marginBottom = parseInt(style.marginBottom) || 0
                    nodeHeight += marginTop + marginBottom
                  }
                } catch (e) {
                  // Fallback
                }

                if (nodeHeight === 0) {
                   const textLength = node.textContent.length
                   nodeHeight = Math.max(24, Math.ceil(textLength / 80) * 24 + 24)
                }

                // 3. Check overflow
                if (currentHeight + nodeHeight > CONTENT_HEIGHT) {
                  const breakWidget = document.createElement('div')
                  breakWidget.className = 'page-break-indicator'
                  breakWidget.contentEditable = 'false'
                  breakWidget.innerHTML = `
                    <div class="page-break-line">
                      <span class="page-number-label">Page ${pageNumber + 1}</span>
                    </div>
                  `
                  
                  decorations.push(
                    Decoration.widget(pos, breakWidget, { 
                      side: -1, 
                      ignoreSelection: true 
                    })
                  )
                  
                  // Reset for next page
                  currentHeight = nodeHeight
                  pageNumber++
                } else {
                  currentHeight += nodeHeight
                }
                
                // Don't descend into the text content of a paragraph
                return false
              }
              
              return false
            })

            const tr = view.state.tr
            tr.setMeta(pluginKey, DecorationSet.create(doc, decorations))
            view.dispatch(tr)
          }

          setTimeout(() => updatePageBreaks(editorView, editorView.state.doc), 100)

          return {
            update(view, prevState) {
              const isPaste = view.state.tr.getMeta('paste-update')
              if (!view.state.doc.eq(prevState.doc) || isPaste) {
                 requestAnimationFrame(() => {
                   if (!view.isDestroyed) {
                     updatePageBreaks(view, view.state.doc)
                   }
                 })
              }
            }
          }
        },
      }),
    ]
  },
})