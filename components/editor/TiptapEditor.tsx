"use client"

import { useState, useCallback, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
import FontFamily from "@tiptap/extension-font-family"
import { TextStyle } from "@tiptap/extension-text-style"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Minus, Undo2, Redo2,
  Maximize2, Minimize2, Sparkles, Table as TableIcon,
  type LucideIcon,
} from "lucide-react"

const FontSize = TextStyle.extend({
  name: "fontSize", // Unique name to avoid duplicate 'textStyle'
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize,
        renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
    }
  },
})

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  onOptimize?: () => void
  optimizing?: boolean
}

function ToolBtn({ icon: Icon, action, isActive, label, disabled }: { icon: LucideIcon; action: () => void; isActive?: boolean; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={action}
      disabled={disabled}
      title={label}
      className={`rounded-lg p-1.5 transition-all ${isActive ? "bg-cyan-400/15 text-cyan-400" : "text-white/40 hover:bg-white/[0.06] hover:text-white/70"} ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

export default function TiptapEditor({ content, onChange, onOptimize, optimizing }: TiptapEditorProps) {
  const [fullscreen, setFullscreen] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: "Tulis konten artikel di sini..." }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-4 text-sm leading-relaxed" },
    },
  })

  // Sync content when prop changes (e.g. after AI optimization)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const setFontFamily = useCallback((font: string) => editor?.chain().focus().setFontFamily(font).run(), [editor])
  const setFontSize = useCallback((size: string) => editor?.chain().focus().setMark("fontSize", { fontSize: size }).run(), [editor])
  const setAlignment = useCallback((align: string) => editor?.chain().focus().setTextAlign(align).run(), [editor])

  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setFullscreen(!fullscreen)
  }, [fullscreen])

  if (!editor) return null

  const isActive = (type: string, attrs?: Record<string, string>) => editor.isActive(type, attrs)

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden ${fullscreen ? "fixed inset-0 z-50 bg-slate-950" : ""}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <ToolBtn icon={Bold} action={() => editor.chain().focus().toggleBold().run()} isActive={isActive("bold")} label="Bold" />
        <ToolBtn icon={Italic} action={() => editor.chain().focus().toggleItalic().run()} isActive={isActive("italic")} label="Italic" />
        <ToolBtn icon={UnderlineIcon} action={() => editor.chain().focus().toggleUnderline().run()} isActive={isActive("underline")} label="Underline" />

        <div className="mx-1 h-5 w-px bg-white/10" />

        <select
          onChange={(e) => setFontFamily(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white/70 outline-none focus:border-cyan-400/50"
        >
          <option value="">Font</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="-apple-system, BlinkMacSystemFont, sans-serif">Apple System</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="monospace">Monospace</option>
        </select>

        <select
          onChange={(e) => setFontSize(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white/70 outline-none focus:border-cyan-400/50"
        >
          <option value="">Size</option>
          <option value="12px">12px</option>
          <option value="13px">13px</option>
          <option value="14px">14px</option>
          <option value="15px">15px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
        </select>

        <div className="mx-1 h-5 w-px bg-white/10" />

        <ToolBtn icon={AlignLeft} action={() => setAlignment("left")} isActive={isActive("textAlign", { textAlign: "left" })} label="Left" />
        <ToolBtn icon={AlignCenter} action={() => setAlignment("center")} isActive={isActive("textAlign", { textAlign: "center" })} label="Center" />
        <ToolBtn icon={AlignRight} action={() => setAlignment("right")} isActive={isActive("textAlign", { textAlign: "right" })} label="Right" />
        <ToolBtn icon={AlignJustify} action={() => setAlignment("justify")} isActive={isActive("textAlign", { textAlign: "justify" })} label="Justify" />

        <div className="mx-1 h-5 w-px bg-white/10" />

        <ToolBtn icon={List} action={() => editor.chain().focus().toggleBulletList().run()} isActive={isActive("bulletList")} label="Bullet List" />
        <ToolBtn icon={ListOrdered} action={() => editor.chain().focus().toggleOrderedList().run()} isActive={isActive("orderedList")} label="Ordered List" />
        <ToolBtn icon={Minus} action={() => editor.chain().focus().setHorizontalRule().run()} label="Horizontal Line" />
        
        <div className="mx-1 h-5 w-px bg-white/10" />

        <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.04] p-0.5">
          <ToolBtn icon={TableIcon} action={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label="Insert Table" />
          {isActive("table") && (
            <>
              <div className="mx-0.5 h-3 w-px bg-white/10" />
              <button onClick={() => editor.chain().focus().addRowBefore().run()} className="rounded-md px-1 py-1 text-[10px] text-white/40 hover:bg-white/10 hover:text-white" title="Add Row Above">+Row↑</button>
              <button onClick={() => editor.chain().focus().addRowAfter().run()} className="rounded-md px-1 py-1 text-[10px] text-white/40 hover:bg-white/10 hover:text-white" title="Add Row Below">+Row↓</button>
              <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="rounded-md px-1 py-1 text-[10px] text-white/40 hover:bg-white/10 hover:text-white" title="Add Column Before">+Col←</button>
              <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="rounded-md px-1 py-1 text-[10px] text-white/40 hover:bg-white/10 hover:text-white" title="Add Column After">+Col→</button>
              <button onClick={() => editor.chain().focus().deleteRow().run()} className="rounded-md px-1 py-1 text-[10px] text-red-400/60 hover:bg-red-400/10 hover:text-red-400" title="Delete Row">-Row</button>
              <button onClick={() => editor.chain().focus().deleteColumn().run()} className="rounded-md px-1 py-1 text-[10px] text-red-400/60 hover:bg-red-400/10 hover:text-red-400" title="Delete Column">-Col</button>
              <button onClick={() => editor.chain().focus().deleteTable().run()} className="rounded-md px-1 py-1 text-[10px] text-red-400/60 hover:bg-red-400/10 hover:text-red-400" title="Delete Table">Del Table</button>
            </>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-white/10" />

        <ToolBtn icon={Undo2} action={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} label="Undo" />
        <ToolBtn icon={Redo2} action={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} label="Redo" />

        <div className="mx-1 h-5 w-px bg-white/10" />

        <ToolBtn icon={fullscreen ? Minimize2 : Maximize2} action={toggleFullscreen} label="Fullscreen" />

        {onOptimize && (
          <>
            <div className="ml-auto" />
            <button
              type="button"
              onClick={onOptimize}
              disabled={optimizing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/20 bg-purple-400/5 px-3 py-1.5 text-xs font-medium text-purple-400 transition-all hover:bg-purple-400/10 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {optimizing ? "Mengoptimasi..." : "Optimasi dengan AI"}
            </button>
          </>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
