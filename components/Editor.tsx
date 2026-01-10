'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello world! This is the start of the legal editor.</p>',
    editorProps: {
      attributes: {
        class: 'focus:outline-none', 
      },
    },
    // 👇 ADD THIS LINE TO FIX THE ERROR
    immediatelyRender: false, 
  })

  if (!editor) {
    return null
  }

  return (
    <div className="w-[816px] min-h-[1056px] bg-white shadow-lg border border-gray-200 p-[96px]">
      <EditorContent editor={editor} />
    </div>
  )
}

export default Editor