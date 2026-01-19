import React, { useState } from 'react';
import TutorialSelectorModal from './TutorialSelectorModal';
import './TutorialEditor.css';

const TutorialEditor = ({
  tutorial,
  index,
  availableTutorials = [],
  onChange,
  onRemove,
}) => {
  const mode = tutorial.mode || 'new';
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  const handleTutorialSelect = (tutorial) => {
    handleChange('tutorial_id', tutorial.id);
    // Обновляем label и tutorial_url из выбранного туториала
    handleChange('label', tutorial.label || '');
    handleChange('tutorial_url', tutorial.tutorial_url || '');
  };

  const getSelectedTutorialLabel = () => {
    if (!tutorial.tutorial_id) return 'Select Tutorial';
    const selectedTutorial = availableTutorials.find(t => t.id === parseInt(tutorial.tutorial_id));
    return selectedTutorial ? (selectedTutorial.label || `Tutorial #${selectedTutorial.id}`) : 'Select Tutorial';
  };

  return (
    <div className="tutorial-item">
      <div className="tutorial-header">
        <h4>Tutorial {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="btn btn-delete-small"
        >
          Remove
        </button>
      </div>
      
      {/* Переключатель New/Select */}
      <div className="form-group">
        <label>Mode</label>
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'new' ? 'active' : ''}`}
            onClick={() => handleChange('mode', 'new')}
          >
            New
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'select' ? 'active' : ''}`}
            onClick={() => handleChange('mode', 'select')}
          >
            Select
          </button>
        </div>
      </div>

      {mode === 'select' ? (
        // Режим Select: показываем кнопку для открытия модального окна
        <div className="form-group">
          <label>Select Tutorial *</label>
          <div className="tutorial-select-wrapper">
            <button
              type="button"
              className="tutorial-select-btn"
              onClick={() => setShowTutorialModal(true)}
            >
              <span className={tutorial.tutorial_id ? '' : 'placeholder'}>
                {getSelectedTutorialLabel()}
              </span>
              <span className="tutorial-select-arrow">▼</span>
            </button>
          </div>
          <TutorialSelectorModal
            isOpen={showTutorialModal}
            onClose={() => setShowTutorialModal(false)}
            onSelect={handleTutorialSelect}
            selectedTutorialId={tutorial.tutorial_id}
          />
        </div>
      ) : (
        // Режим New: показываем поля для создания нового tutorial
        <>
          <div className="form-group">
            <label>Tutorial URL *</label>
            <input
              type="url"
              value={tutorial.tutorial_url || ''}
              onChange={(e) => handleChange('tutorial_url', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Label *</label>
            <input
              type="text"
              value={tutorial.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              required
            />
          </div>
        </>
      )}

      {/* Поля start_sec и end_sec доступны в обоих режимах */}
      <div className="form-row">
        <div className="form-group">
          <label>Start (sec)</label>
          <input
            type="number"
            value={tutorial.start_sec || ''}
            onChange={(e) => handleChange('start_sec', e.target.value)}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>End (sec)</label>
          <input
            type="number"
            value={tutorial.end_sec || ''}
            onChange={(e) => handleChange('end_sec', e.target.value)}
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default TutorialEditor;
