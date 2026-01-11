'use client'

import { type Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  List, 
  ListOrdered, 
  Heading1, 
  Heading2 
} from 'lucide-react'

type Props = {
  editor: Editor | null
}

const Toolbar = ({ editor }: Props) => {
  if (!editor) {
    return null
  }

  const isActive = (type: string, options?: any) => {
    return editor.isActive(type, options) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'
  }

  const buttonClass = "p-2 rounded transition-colors"

  return (
    <div className="border border-gray-200 bg-white rounded-md mb-6 p-2 flex gap-2 sticky top-4 z-50 shadow-sm w-fit mx-auto">
      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${buttonClass} ${isActive('bold')}`}
      >
        <Bold size={20} />
      </button>
      
      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${isActive('italic')}`}
      >
        <Italic size={20} />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${buttonClass} ${isActive('strike')}`}
      >
        <Strikethrough size={20} />
      </button>

      <div className="w-[1px] bg-gray-300 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${isActive('heading', { level: 1 })}`}
      >
        <Heading1 size={20} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${isActive('heading', { level: 2 })}`}
      >
        <Heading2 size={20} />
      </button>

      <div className="w-[1px] bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${isActive('bulletList')}`}
      >
        <List size={20} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${isActive('orderedList')}`}
      >
        <ListOrdered size={20} />
      </button>
    </div>
  )
}

export default Toolbar