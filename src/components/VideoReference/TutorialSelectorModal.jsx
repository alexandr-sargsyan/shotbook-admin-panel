import React, { useState, useEffect } from 'react';
import { tutorialsAPI } from '../../services/api';
import './TutorialSelectorModal.css';

const TutorialSelectorModal = ({ isOpen, onClose, onSelect, selectedTutorialId }) => {
  const [tutorials, setTutorials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTutorials = async (search = '') => {
    setLoading(true);
    try {
      const response = await tutorialsAPI.getAll(search);
      setTutorials(response.data.data || []);
    } catch (error) {
      console.error('Error loading tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Debounce для поиска
      const timer = setTimeout(() => {
        loadTutorials(searchQuery);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, searchQuery]);

  const filteredTutorials = tutorials;

  const handleTutorialClick = (tutorial) => {
    onSelect(tutorial);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tutorial-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Browse All Tutorials</h3>
          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="tutorial-selector-modal-content">
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tutorial-search-input"
          />
          <div className="tutorial-list">
            {loading ? (
              <div className="no-tutorials">Loading...</div>
            ) : filteredTutorials.length > 0 ? (
              filteredTutorials.map((tutorial) => (
                <button
                  key={tutorial.id}
                  type="button"
                  className={`tutorial-item ${selectedTutorialId === tutorial.id ? 'selected' : ''}`}
                  onClick={() => handleTutorialClick(tutorial)}
                >
                  {tutorial.label || `Tutorial #${tutorial.id}`}
                </button>
              ))
            ) : (
              <div className="no-tutorials">No tutorials found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialSelectorModal;
