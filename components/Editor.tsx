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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none h-full',
      },
    },
    immediatelyRender: false, 
  })

  if (!editor) {
    return null
  }

  return (
    // Added print:bg-white to ensure background is clean
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100 print:bg-white print:py-0 print:block">
      
      {/* Added print:hidden to hide the toolbar */}
      <div className="toolbar-container sticky top-4 z-50 print:hidden">
        <Toolbar editor={editor} />
      </div>
      
      <div 
        // Added print classes to override styles:
        // print:!w-full -> Overrides the inline width
        // print:!h-auto -> Allows full height expansion
        // print:!p-0 -> Removes padding so @page margins take over
        // print:overflow-visible -> CRITICAL: allows content to flow to next pages
        // print:border-none print:shadow-none -> Removes UI box styling
        className="bg-white shadow-lg border border-gray-200 overflow-hidden cursor-text 
                   print:!w-full print:!h-auto print:!min-h-0 print:!p-0 print:overflow-visible 
                   print:border-none print:shadow-none print:m-0"
        style={{
            width: '816px',       
            minHeight: '1056px',  
            padding: '96px',      
        }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Editor