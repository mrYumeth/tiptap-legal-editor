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
      <p>This document is configured for <strong>US Letter</strong> size with exact <strong>1-inch margins</strong>.</p>
      <p>When you print, our code overrides the browser defaults to ensure the spacing is perfect.</p>
      <h2>Pagination Features</h2>
      <ul>
        <li><strong>Page 1:</strong> Starts 1 inch from the top.</li>
        <li><strong>Page 2+:</strong> Automatically calculates breaks and adds a 1-inch top margin spacer.</li>
        <li><strong>Bottom:</strong> Text stops exactly 1 inch from the bottom edge.</li>
      </ul>
      <p>Keep typing to test the multi-page layout...</p>
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
    <div className="flex flex-col items-center min-h-screen pb-10 print:block print:pb-0 print:h-auto">
      
      <div className="sticky top-6 z-50 mb-6 print:hidden">
        <Toolbar editor={editor} />
      </div>

      {/* SCREEN: 816px width (8.5in). 
        PRINT: Width is handled by CSS (6.5in + 1in margins).
      */}
      <div 
        className="w-[816px] bg-white print:w-auto print:m-0"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>

    </div>
  )
}

export default Editor