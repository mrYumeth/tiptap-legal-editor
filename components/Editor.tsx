'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import { PageBreakExtension } from '../app/extensions/PageBreakExtension'

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Standard heading levels
        heading: { levels: [1, 2, 3] },
      }),
      PageBreakExtension,
    ],
    content: `
      <h1>Legal Document Draft</h1>
      <p>This document demonstrates real-time pagination with exact 1-inch margins.</p>
      <p>The layout you see here matches the US Letter standard (8.5" x 11").</p>
      <h2>Instructions</h2>
      <ul>
        <li>Type continuously to see content flow to the next page.</li>
        <li>Click the Print icon to export as PDF.</li>
        <li>Notice that the text wrapping on screen matches the PDF exactly.</li>
      </ul>
      <p>Keep typing...</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none',
      },
    },
    immediatelyRender: false, 
  })

  if (!editor) return null

  return (
    <div className="flex flex-col items-center min-h-screen pb-10 print:block print:pb-0">
      
      <div className="sticky top-6 z-50 mb-6 print:hidden">
        <Toolbar editor={editor} />
      </div>

      {/* SCREEN CONTAINER
        Width: 816px (8.5 inches @ 96 DPI).
        This fixed width coupled with the 96px padding in CSS
        creates a content area of exactly 6.5 inches.
        
        This matches the Print View where:
        8.5in Page - 1in Left Margin - 1in Right Margin = 6.5in Content.
      */}
      <div 
        className="w-[816px] bg-white print:w-full print:m-0"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

    </div>
  )
}

export default Editor