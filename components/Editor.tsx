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
      <p>This document demonstrates <strong>WYGIWYS</strong> (What You Get Is What You See) printing.</p>
      <p>The layout is strictly controlled to ensure US Letter (8.5" x 11") compliance with exactly 1-inch margins.</p>
      <h2>Export Instructions</h2>
      <ul>
        <li>Click the Print icon.</li>
        <li>In the printer dialog, ensure <strong>"Margins"</strong> is set to <strong>"Default"</strong> or <strong>"None"</strong> (Our code handles the rest).</li>
        <li>You will see the text is perfectly aligned 1 inch from the edge.</li>
      </ul>
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
    <div className="flex flex-col items-center min-h-screen pb-10 print:block print:pb-0 print:min-h-0">
      
      <div className="sticky top-6 z-50 mb-6 print:hidden">
        <Toolbar editor={editor} />
      </div>

      {/* SCREEN: Width 816px (8.5in). Padding 96px (1in) comes from .ProseMirror in CSS.
         PRINT: Width 100%. Margins/Padding are handled by body in CSS.
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