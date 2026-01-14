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
            
            // MATH EXPLANATION:
            // US Letter Height: 11 inches = 1056px (@ 96 DPI)
            // Top Margin: 1 inch = 96px
            // Bottom Margin: 1 inch = 96px
            // Writable Height = 1056 - 96 - 96 = 864px
            const CONTENT_HEIGHT = 864 
            
            let currentHeight = 0
            let pageNumber = 1

            doc.descendants((node, pos) => {
              if (node.isBlock && !node.isTextblock && !node.isAtom) {
                return true // Visit children of container blocks
              }

              if (node.isTextblock || node.isAtom) {
                let nodeHeight = 0
                
                try {
                  const domNode = view.nodeDOM(pos) as HTMLElement
                  if (domNode && domNode instanceof HTMLElement) {
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
                  
                  currentHeight = nodeHeight
                  pageNumber++
                } else {
                  currentHeight += nodeHeight
                }
                
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