'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { upload } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import API_BASE_URL from '@/lib/api/config';

interface ThinkEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// 后端返回相对路径 /uploads/...，拼接 API_BASE_URL 形成可访问的绝对地址。
async function uploadImage(file: File): Promise<string> {
  const res = await upload<{ url: string }>(API_ENDPOINTS.uploadImage, file);
  return `${API_BASE_URL}${res.url}`;
}

/**
 * 「思考一下」作答编辑器：基于 RichTextEditor 的暗色主题变体（/me 模块为黑底）。
 */
export default function ThinkEditor({ value, onChange }: ThinkEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'think-editor-content max-w-none min-h-[280px] px-5 py-4 focus:outline-none text-white/90 leading-[1.9]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // 外部 value 变化时（如异步加载到已有草稿）同步进编辑器。
  // 仅在编辑器未聚焦时同步，避免在用户输入过程中 setContent 重置光标/清空内容。
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // 允许重复选择同一文件
    if (!file || !editor) return;
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : '图片上传失败');
    }
  }

  const btn = (active: boolean) =>
    `px-2.5 py-1 text-xs rounded border transition-colors ${
      active
        ? 'bg-white text-black border-white'
        : 'bg-transparent text-white/60 border-white/15 hover:border-white/40 hover:text-white'
    }`;

  return (
    <div className="border border-white/15 rounded-lg overflow-hidden bg-white/[0.03] focus-within:border-white/50 transition-colors">
      <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>粗体</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>斜体</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>• 列表</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}>1. 列表</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))}>引用</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive('codeBlock'))}>代码块</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className={btn(false)}>插入图片</button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
