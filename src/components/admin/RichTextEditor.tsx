import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Quote, 
  Code,
  Undo,
  Redo
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface Props {
  value: string;
  onChange: (sanitizedHtml: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || '');

  // Keep editor content in sync when value changes externally
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value || '');
  }, [value, isSourceMode]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const dirty = editorRef.current.innerHTML;
    const clean = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'u',
        'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'code', 'pre', 'img', 'br', 'hr', 'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'width', 'height']
    });
    setRawHtml(clean);
    onChange(clean);
  };

  const executeCommand = (command: string, arg?: string) => {
    if (isSourceMode) return;
    document.execCommand(command, false, arg);
    handleInput();
    editorRef.current?.focus();
  };

  const handleInsertLink = () => {
    const url = prompt('लिंक URL दर्ज करें (Enter Link URL):', 'https://');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('इमेज URL दर्ज करें (Enter Image URL):', 'https://');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="w-full border-collapse border border-slate-300 my-3 text-xs sm:text-sm">
        <thead>
          <tr class="bg-slate-100">
            <th class="border border-slate-300 p-2 text-left font-bold">विवरण (Details)</th>
            <th class="border border-slate-300 p-2 text-left font-bold">जानकारी (Information)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 p-2">पद नाम (Post Name)</td>
            <td class="border border-slate-300 p-2">विवरण भरें</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2">योग्यता (Qualification)</td>
            <td class="border border-slate-300 p-2">स्नातक / 12वीं पास</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawHtml(val);
    const clean = DOMPurify.sanitize(val);
    onChange(clean);
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
        <button
          type="button"
          onClick={() => executeCommand('undo')}
          title="Undo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('redo')}
          title="Redo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
        >
          <Redo className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <Bold className="w-4 h-4 font-bold" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <Italic className="w-4 h-4 italic" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          title="Heading 2"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          title="Heading 3"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<p>')}
          title="Paragraph"
          className="px-2 py-1 text-xs font-semibold hover:bg-slate-200 rounded transition-colors"
        >
          P
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          title="Quote"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Link"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-blue-700"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleInsertTable}
          title="Insert Responsive Table"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-emerald-700"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleInsertImage}
          title="Insert Image URL"
          className="p-1.5 hover:bg-slate-200 rounded transition-colors text-amber-700"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsSourceMode(!isSourceMode)}
            className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
              isSourceMode ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Code className="w-3.5 h-3.5 inline mr-1" />
            {isSourceMode ? 'Visual Editor' : 'HTML Code'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isSourceMode ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          rows={12}
          className="w-full p-4 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter clean HTML markup..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="p-4 min-h-[260px] max-h-[500px] overflow-y-auto focus:outline-none prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed"
          data-placeholder={placeholder || 'विस्तृत विवरण यहां लिखें (Write detailed content here)...'}
        />
      )}
    </div>
  );
};
