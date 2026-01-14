'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import { PageBreakExtension } from '../app/extensions/PageBreakExtension'

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      PageBreakExtension,
    ],
    content: `
      <h1>Legal Document Draft</h1>
      <p>This document demonstrates real-time pagination for legal document drafting.</p>
      <p>As you type, page breaks will automatically appear to show exactly how your document will look when printed.</p>
      <p>The system calculates US Letter page boundaries (8.5" x 11") with 1-inch margins.</p>
      <h2>Instructions</h2>
      <ul>
        <li>Type continuously to see the page breaks appear.</li>
        <li>Paste a long document to see multiple pages.</li>
        <li>Use the Print button (or Ctrl+P) to verify the output.</li>
      </ul>
      <p>Keep typing to see the page break indicator appear below...</p>
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
      
      {/* Sticky Toolbar */}
      <div className="sticky top-6 z-50 mb-6 print:hidden">
        <Toolbar editor={editor} />
      </div>

      {/* Editor Container - 8.5 inches wide */}
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