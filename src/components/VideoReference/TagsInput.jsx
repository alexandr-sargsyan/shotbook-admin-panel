import { useState, useEffect, useRef } from 'react';
import { tagsAPI } from '../../services/api';
import ErrorModal from '../ErrorModal';
import './TagsInput.css';

const TagsInput = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllTagsModal, setShowAllTagsModal] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Загружаем все теги для модального окна
  useEffect(() => {
    if (showAllTagsModal) {
      loadAllTags();
    }
  }, [showAllTagsModal]);

  // Поиск тегов при вводе (debounce)
  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const timer = setTimeout(() => {
        searchTags(inputValue.trim());
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  // Закрываем автодополнение при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllTags = async () => {
    try {
      const response = await tagsAPI.getAll();
      setAllTags(response.data.data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const searchTags = async (query) => {
    try {
      const response = await tagsAPI.getAll(query);
      const tags = response.data.data || [];
      setSuggestions(tags);
      setShowSuggestions(tags.length > 0);
    } catch (error) {
      console.error('Error searching tags:', error);
    }
  };

  // Валидация: латинские буквы и цифры, без пробелов
  const validateTag = (tag) => {
    return /^[a-zA-Z0-9]+$/.test(tag);
  };

  const addTag = (tagName) => {
    const trimmed = tagName.trim();
    
    if (!trimmed) {
      return;
    }

    // Валидация
    if (!validateTag(trimmed)) {
      setErrorModal({
        isOpen: true,
        message: 'Tag can only contain Latin letters and numbers without spaces'
      });
      return;
    }

    // Проверка на дубликаты (case-insensitive)
    const lowerTrimmed = trimmed.toLowerCase();
    if (value.some(tag => tag.toLowerCase() === lowerTrimmed)) {
      return;
    }

    // Добавляем тег
    onChange([...value, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (tag) => {
    addTag(tag.name);
  };

  // Фильтрация тегов для модального окна
  const filteredAllTags = allTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Теги, которые еще не выбраны
  const availableTags = filteredAllTags.filter(tag =>
    !value.some(selectedTag => selectedTag.toLowerCase() === tag.name.toLowerCase())
  );

  const handleTagFromModalClick = (tagName) => {
    addTag(tagName);
  };

  return (
    <div className="tags-input-container">
      <div className="tags-display">
        {value.map((tag, index) => (
          <span key={index} className="tag-badge">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="tag-remove"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="tags-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Enter tag name (Latin letters and numbers only)"
          className="tags-input"
        />
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          className="btn-add-tag"
          disabled={!inputValue.trim()}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowAllTagsModal(true)}
          className="btn-browse-tags"
          title="Browse all tags"
        >
          📋
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="tags-suggestions">
          {suggestions.map((tag) => (
            <div
              key={tag.id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(tag)}
            >
              {tag.name}
            </div>
          ))}
        </div>
      )}

      {showAllTagsModal && (
        <div className="modal-overlay" onClick={() => setShowAllTagsModal(false)}>
          <div className="modal-content tags-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Browse All Tags</h3>
              <button
                className="close-btn"
                onClick={() => setShowAllTagsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="tags-modal-content">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tags-search-input"
              />
              <div className="tags-list">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="tag-item"
                      onClick={() => handleTagFromModalClick(tag.name)}
                    >
                      {tag.name}
                    </button>
                  ))
                ) : (
                  <div className="no-tags">No available tags</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Validation Error"
        message={errorModal.message}
      />
    </div>
  );
};

export default TagsInput;
