import { useState, useRef, useEffect } from 'react';
import './SimpleRichTextEditor.css';

const SimpleRichTextEditor = ({ value = '', onChange, placeholder = 'Enter text...' }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = (e) => {
    const html = e.target.innerHTML;
    onChange(html);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Поддержка Ctrl+B, Ctrl+I, Ctrl+U
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        execCommand('bold');
      } else if (e.key === 'i') {
        e.preventDefault();
        execCommand('italic');
      } else if (e.key === 'u') {
        e.preventDefault();
        execCommand('underline');
      }
    }
  };

  return (
    <div className="simple-rich-text-editor">
      <div className="toolbar">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="toolbar-btn"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="toolbar-btn"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="toolbar-btn"
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h1>')}
          className="toolbar-btn"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="toolbar-btn"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="toolbar-btn"
          title="Heading 3"
        >
          H3
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="toolbar-btn"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="toolbar-btn"
          title="Numbered List"
        >
          1.
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              execCommand('createLink', url);
            }
          }}
          className="toolbar-btn"
          title="Insert Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          className="toolbar-btn"
          title="Quote"
        >
          "
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="toolbar-btn"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="toolbar-btn"
          title="Align Center"
        >
          ⬌
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="toolbar-btn"
          title="Align Right"
        >
          ➡
        </button>
        <div className="toolbar-separator" />
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="toolbar-btn"
          title="Remove Formatting"
        >
          ✕
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className={`editor-content ${isFocused ? 'focused' : ''}`}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default SimpleRichTextEditor;
