// app/extensions/PageBreakExtension.ts
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'

interface PageBreakState {
  decorations: DecorationSet
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
    
    const measureNodeHeight = (node: ProseMirrorNode, view: any, pos: number): number => {
      try {
        // Get the actual DOM element for this node
        const domNode = view.domAtPos(pos)
        if (domNode && domNode.node) {
          let element = domNode.node as HTMLElement
          
          // If it's a text node, get its parent element
          if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentElement as HTMLElement
          }
          
          // If we have an element, measure its actual height
          if (element && element.getBoundingClientRect) {
            const rect = element.getBoundingClientRect()
            // Add some margin for spacing
            return Math.ceil(rect.height) + 4
          }
        }
      } catch (e) {
        // Fallback to estimation
      }
      
      // Fallback: Estimate based on content
      const text = node.textContent
      const type = node.type.name
      
      if (type === 'heading') {
        const level = node.attrs.level || 1
        const baseHeight = level === 1 ? 48 : level === 2 ? 40 : 32
        const lines = Math.ceil(text.length / 60)
        return baseHeight + (lines - 1) * 24
      }
      
      if (type === 'paragraph') {
        if (text.length === 0) return 24
        const lines = Math.ceil(text.length / 85)
        return lines * 24 + 12
      }
      
      if (type === 'listItem') {
        if (text.length === 0) return 28
        const lines = Math.ceil(text.length / 80)
        return lines * 24 + 4
      }
      
      if (type === 'codeBlock') {
        const lines = text.split('\n').length
        return lines * 20 + 24
      }
      
      if (type === 'blockquote') {
        const lines = Math.ceil(text.length / 75)
        return lines * 24 + 16
      }
      
      if (type === 'horizontalRule') {
        return 32
      }
      
      return 24
    }
    
    const calculatePageBreaks = (doc: ProseMirrorNode, view: any): DecorationSet => {
      const decorations: Decoration[] = []
      let currentPageHeight = 0
      let pageNumber = 1
      let lastBreakPos = 0
      
      doc.descendants((node, pos) => {
        // Only process block-level nodes
        if (!node.isBlock) return
        
        // Skip empty text blocks and list containers
        if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
          return // Continue to process children
        }
        
        // Measure the actual node height
        const nodeHeight = measureNodeHeight(node, view, pos)
        
        // Check if adding this node would overflow the page
        if (currentPageHeight + nodeHeight > PAGE_CONTENT_HEIGHT && currentPageHeight > 100) {
          // Only add page break if we're not too close to the last one (avoid consecutive breaks)
          if (pos - lastBreakPos > 10) {
            // Create page break decoration
            const breakWidget = document.createElement('div')
            breakWidget.className = 'page-break-indicator'
            breakWidget.contentEditable = 'false'
            
            // Create the visual line
            const line = document.createElement('div')
            line.className = 'page-break-line'
            
            // Create page label
            const label = document.createElement('div')
            label.className = 'page-number-label'
            label.textContent = `Page ${pageNumber + 1}`
            
            line.appendChild(label)
            breakWidget.appendChild(line)
            
            decorations.push(
              Decoration.widget(pos, breakWidget, {
                side: -1,
                key: `page-break-${pageNumber}-${pos}`,
              })
            )
            
            // Reset for new page
            currentPageHeight = nodeHeight
            pageNumber++
            lastBreakPos = pos
          }
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
              decorations: DecorationSet.empty,
            }
          },
          
          apply(tr, value, oldState, newState) {
            // Only recalculate if document changed
            if (!tr.docChanged && !tr.getMeta('forceUpdate')) {
              return {
                ...value,
                decorations: value.decorations.map(tr.mapping, tr.doc),
              }
            }
            
            // Get the editor view from the transaction meta
            const view = tr.getMeta('view')
            if (!view) {
              return value
            }
            
            // Recalculate page breaks with actual measurements
            return {
              decorations: calculatePageBreaks(newState.doc, view),
            }
          },
        },

        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state)
            return pluginState?.decorations || DecorationSet.empty
          },
        },
        
        view(editorView) {
          // Initial calculation after a short delay to ensure DOM is ready
          setTimeout(() => {
            const tr = editorView.state.tr
            tr.setMeta('view', editorView)
            tr.setMeta('forceUpdate', true)
            editorView.dispatch(tr)
          }, 100)
          
          return {
            update(view, prevState) {
              // Recalculate on every update with view info
              if (view.state.doc !== prevState.doc) {
                // Use requestAnimationFrame to ensure DOM is updated
                requestAnimationFrame(() => {
                  const tr = view.state.tr
                  tr.setMeta('view', view)
                  view.dispatch(tr)
                })
              }
            }
          }
        }
      }),
    ]
  },
})