'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import { PageBreakExtension } from '../extensions/PageBreakExtension'

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit, PageBreakExtension],
    content: `
      <h1>Legal Document Draft</h1>
      <p>This is the start of your legal document. Try using the toolbar above to format this text.</p>
      <p>We need enough content to test the pagination later, so feel free to copy-paste some long text here.</p>
    `,
    editorProps: {
      attributes: {
        // prose-base: Sets correct font size (16px) matching our math
        // max-w-none: Allows text to fill the printable area
        class: 'prose prose-base max-w-none mx-auto focus:outline-none h-full',
      },
    },
    immediatelyRender: false, 
  })

  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100 print:bg-white print:py-0 print:block">
      
      <div className="toolbar-container sticky top-4 z-50 print:hidden">
        <Toolbar editor={editor} />
      </div>
      
      <div 
        // 🟢 FIXED: p-[96px] creates the 1-inch visible margin in the editor
        className="bg-white shadow-lg border border-gray-200 overflow-hidden cursor-text 
                   p-[96px] 
                   print:!w-full print:!h-auto print:!min-h-0 print:!p-0 print:overflow-visible 
                   print:border-none print:shadow-none print:m-0"
        style={{
            width: '816px',       
            minHeight: '1056px',
            // Padding is handled by the Tailwind class above to be print-safe
        }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Editor