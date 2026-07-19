import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight,
  Highlighter, Undo, Redo, Code2, X,
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({ content, onChange, placeholder = 'Start writing your lesson content...', minHeight = '300px' }: RichTextEditorProps) {
  const [popover, setPopover] = useState<{ type: 'link' | 'image'; value: string } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#7B2CBF] underline' } }),
      Image.configure({ inline: false, allowBase64: true }),
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
        style: `min-height: ${minHeight}`,
      },
    },
  })

  if (!editor) return null

  const addLink = () => {
    setPopover({ type: 'link', value: editor.getAttributes('link').href ?? '' })
  }

  const addImage = () => {
    setPopover({ type: 'image', value: '' })
  }

  const confirmPopover = () => {
    if (!popover) return
    if (popover.type === 'link' && popover.value.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: popover.value.trim() }).run()
    } else if (popover.type === 'image' && popover.value.trim()) {
      editor.chain().focus().setImage({ src: popover.value.trim() }).run()
    }
    setPopover(null)
  }

  return (
    <div className="border border-[#ECECEC] dark:border-[#2D2040] rounded-xl overflow-hidden bg-white dark:bg-[#1A1228]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#160D20]">
        {/* Text formatting */}
        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Lists & blocks */}
        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code block"
          >
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Media & links */}
        <ToolbarGroup>
          <ToolbarButton
            active={editor.isActive('link')}
            onClick={addLink}
            title="Insert link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            onClick={addImage}
            title="Insert image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <ToolbarGroup>
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </ToolbarGroup>
      </div>

      {/* Inline URL popover */}
      {popover && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#F6EEFF] dark:bg-[#1E1030]">
          <span className="text-xs font-medium text-[#7B2CBF] dark:text-[#C77DFF] shrink-0">
            {popover.type === 'link' ? 'URL:' : 'Image URL:'}
          </span>
          <input
            autoFocus
            type="url"
            value={popover.value}
            onChange={e => setPopover({ ...popover, value: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); confirmPopover() }
              if (e.key === 'Escape') setPopover(null)
            }}
            placeholder={popover.type === 'link' ? 'https://example.com' : 'https://example.com/image.png'}
            className="flex-1 px-2.5 py-1.5 text-sm rounded-md border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
          />
          <button
            type="button"
            onClick={confirmPopover}
            disabled={!popover.value.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#7B2CBF] text-white hover:bg-[#6A24A8] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {popover.type === 'link' ? 'Apply' : 'Insert'}
          </button>
          <button
            type="button"
            onClick={() => setPopover(null)}
            className="p-1 text-[#6B7280] hover:text-[#EF4444] rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  )
}

// ── Toolbar sub-components ──────────────────────────────────────────────

function ToolbarButton({ active, onClick, disabled, title, children }: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? 'bg-[#7B2CBF]/10 text-[#7B2CBF] dark:text-[#C77DFF]'
          : 'text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] hover:text-[#7B2CBF]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-[#ECECEC] dark:bg-[#2D2040] mx-1.5" />
}
