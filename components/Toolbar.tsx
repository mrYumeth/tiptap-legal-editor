'use client'

import { type Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  List, 
  ListOrdered, 
  Heading1, 
  Heading2,
  Heading3,
  Code,
  Printer,
} from 'lucide-react'

type Props = {
  editor: Editor | null
}

const Toolbar = ({ editor }: Props) => {
  if (!editor) {
    return null
  }

  const isActive = (type: string, options?: any) => {
    return editor.isActive(type, options) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
  }

  const buttonClass = "p-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"

  return (
    <div className="border border-gray-200 bg-white rounded-lg shadow-lg p-2 flex flex-wrap gap-1 w-fit">
      
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${buttonClass} ${isActive('bold')}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${isActive('italic')}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${buttonClass} ${isActive('strike')}`}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${buttonClass} ${isActive('code')}`}
        title="Inline Code"
      >
        <Code size={18} />
      </button>

      <div className="w-[1px] bg-gray-300 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${isActive('heading', { level: 1 })}`}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${isActive('heading', { level: 2 })}`}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${buttonClass} ${isActive('heading', { level: 3 })}`}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>

      <div className="w-[1px] bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${isActive('bulletList')}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${isActive('orderedList')}`}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-[1px] bg-gray-300 mx-1" />
      
      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="p-2 rounded text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
        title="Print Document (Ctrl+P)"
      >
        <Printer size={18} />
      </button>
    </div>
  )
}

export default Toolbar