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
          // Trigger update on paste
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
            
            // US Letter Specifications
            // 11 inches height = 1056px
            // 1 inch top/bottom margins = 192px total
            // Content area = 864px
            const CONTENT_HEIGHT = 864 
            
            let currentHeight = 0
            let pageNumber = 1

            doc.forEach((node, offset) => {
              let nodeHeight = 0
              
              try {
                const domNode = view.nodeDOM(offset) as HTMLElement
                if (domNode instanceof HTMLElement) {
                  // GetBoundingClientRect is more accurate than offsetHeight
                  const rect = domNode.getBoundingClientRect()
                  nodeHeight = rect.height
                  
                  // Add margin estimation if not captured (ProseMirror blocks usually have margins)
                  const style = window.getComputedStyle(domNode)
                  nodeHeight += parseInt(style.marginTop) + parseInt(style.marginBottom)
                }
              } catch (e) {
                // Fallback
              }

              // Fallback if DOM is not ready
              if (nodeHeight === 0) {
                 const textLength = node.textContent.length
                 nodeHeight = Math.max(24, Math.ceil(textLength / 80) * 24 + 16)
              }

              if (currentHeight + nodeHeight > CONTENT_HEIGHT) {
                // Create the widget DOM
                const breakWidget = document.createElement('div')
                breakWidget.className = 'page-break-indicator'
                // CRITICAL: Prevent cursor from entering the widget
                breakWidget.contentEditable = 'false'
                
                breakWidget.innerHTML = `
                  <div class="page-break-line">
                    <span class="page-number-label">Page ${pageNumber + 1}</span>
                  </div>
                `
                
                decorations.push(
                  Decoration.widget(offset, breakWidget, { 
                    side: -1,
                    ignoreSelection: true 
                  })
                )
                
                currentHeight = nodeHeight
                pageNumber++
              } else {
                currentHeight += nodeHeight
              }
            })

            const tr = view.state.tr
            tr.setMeta(pluginKey, DecorationSet.create(doc, decorations))
            view.dispatch(tr)
          }

          // Initial check
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