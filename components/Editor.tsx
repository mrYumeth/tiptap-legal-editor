// components/Editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import { PageBreakExtension } from '../app/extensions/PageBreakExtension'

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }), 
      PageBreakExtension,
    ],
    content: `
      <h1>Legal Document Draft</h1>
      <p>This document demonstrates real-time pagination for legal document drafting. As you type, page breaks will automatically appear to show exactly how your document will look when printed.</p>
      
      <h2>Background</h2>
      <p>This editor uses US Letter size (8.5" × 11") with standard 1-inch margins on all sides. The content area is calculated to match exactly what will print, ensuring WYSIWYG (What You See Is What You Get) accuracy.</p>
      
      <h2>Features</h2>
      <ul>
        <li>Real-time page break calculation as you type</li>
        <li>Support for headings, paragraphs, lists, and formatting</li>
        <li>Dynamic content reflow when editing</li>
        <li>Print-ready output that matches the editor view</li>
      </ul>
      
      <h2>Usage Instructions</h2>
      <p>Simply start typing or paste your content. Page breaks will appear automatically when content exceeds one page. The gray dividing line with page number indicates where a new page begins.</p>
      
      <p>Try pasting a long document or typing multiple paragraphs to see the pagination in action. Edit text in the middle of the document and watch how page breaks adjust dynamically.</p>
      
      <h3>Formatting Options</h3>
      <p>Use the toolbar above to format your text with bold, italic, strikethrough, headings, and lists. All formatting is taken into account when calculating page breaks.</p>
      
      <blockquote>
        <p>This is an example blockquote. Blockquotes are often used for citations or emphasis in legal documents.</p>
      </blockquote>
      
      <p>Continue adding content to see how the pagination system handles multiple pages. The system is designed to prevent awkward breaks in the middle of paragraphs when printing.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-base max-w-none focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100 print:bg-white print:py-0 print:m-0">
      
      {/* Toolbar */}
      <div className="sticky top-4 z-50 mb-6 print:hidden">
        <Toolbar editor={editor} />
      </div>
      
      {/* Document Info */}
      <div className="w-[816px] mb-4 print:hidden">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">US Letter (8.5" × 11")</span>
            <span>1" margins</span>
            <span className="text-blue-600 font-medium">
              {editor.state.doc.textContent.length} characters
            </span>
          </div>
        </div>
      </div>
      
      {/* Editor Container - Screen View */}
      <div 
        className="bg-white shadow-lg border border-gray-200 cursor-text screen-only
                   print:hidden"
        style={{
          width: '816px',       // 8.5" at 96 DPI
          minHeight: '1056px',  // 11" at 96 DPI
          padding: '96px',      // 1" margins = 96px
        }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Print-only Container */}
      <div className="hidden print:block print-container">
        <EditorContent editor={editor} />
      </div>
      
      {/* Footer Info */}
      <div className="w-[816px] mt-4 print:hidden">
        <div className="text-center text-xs text-gray-500">
          <p>This editor matches print output for accurate document preview</p>
        </div>
      </div>
    </div>
  )
}

export default Editor