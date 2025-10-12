"use client";

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Kezdj el gépelni...",
  className = ""
}: RichTextEditorProps) {

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link'
  ];

  return (
    <div className={className}>
      <style jsx global>{`
        .quill-editor .ql-container {
          min-height: 200px;
          font-size: 16px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }

        .quill-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .quill-editor .ql-container {
          border-color: #d1d5db;
        }

        .quill-editor .ql-editor {
          min-height: 200px;
        }

        .quill-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        /* Focus state */
        .quill-editor:focus-within .ql-toolbar {
          border-color: #6366f1;
        }

        .quill-editor:focus-within .ql-container {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Dark mode support */
        .dark .quill-editor .ql-toolbar {
          background: #374151;
          border-color: #4b5563;
        }

        .dark .quill-editor .ql-container {
          border-color: #4b5563;
          background: #1f2937;
        }

        .dark .quill-editor .ql-editor {
          color: #f3f4f6;
        }

        .dark .quill-editor .ql-stroke {
          stroke: #9ca3af;
        }

        .dark .quill-editor .ql-fill {
          fill: #9ca3af;
        }

        .dark .quill-editor .ql-picker-label {
          color: #9ca3af;
        }
      `}</style>

      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="quill-editor"
      />
    </div>
  );
}
