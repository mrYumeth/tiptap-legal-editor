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
    <div className="flex flex-col items-center min-h-screen py-8 bg-gray-100">
      {/* 🟢 FIXED: Toolbar is now INSIDE the container */}
      <div className="toolbar-container sticky top-4 z-50">
        <Toolbar editor={editor} />
      </div>
      
      <div 
        className="bg-white shadow-lg border border-gray-200 overflow-hidden cursor-text"
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