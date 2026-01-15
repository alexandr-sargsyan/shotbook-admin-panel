import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { videoReferencesAPI, categoriesAPI, tutorialsAPI } from '../../services/api';
import TagsInput from './TagsInput';
import './VideoReferenceForm.css';

const VideoReferenceForm = ({ video, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    public_summary: '',
    category_ids: [],
    pacing: '',
    hook_type: '',
    production_level: '',
    has_visual_effects: false,
    has_3d: false,
    has_animations: false,
    has_typography: false,
    has_sound_design: false,
    search_profile: '',
    search_metadata: '',
    tags: [],
    tutorials: [],
  });

  useEffect(() => {
    loadCategories();
    loadTutorials();
  }, []);

  // Загружаем данные видео после загрузки категорий
  useEffect(() => {
    if (video && categories.length > 0) {
      loadVideoData();
    }
  }, [video, categories]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTutorials = async () => {
    try {
      const response = await tutorialsAPI.getAll();
      setTutorials(response.data.data);
    } catch (error) {
      console.error('Error loading tutorials:', error);
    }
  };

  const loadVideoData = async () => {
    try {
      const response = await videoReferencesAPI.getById(video.id);
      const data = response.data.data;
      
      // Format tags as array
      const tagsArray = data.tags?.map(tag => tag.name) || [];

      // Получаем массив ID категорий
      const categoryIds = data.categories?.map(cat => cat.id) || [];

      setSelectedCategoryIds(categoryIds);

      setFormData({
        title: data.title || '',
        source_url: data.source_url || '',
        public_summary: data.public_summary || '',
        category_ids: categoryIds,
        pacing: data.pacing || '',
        hook_type: data.hook_type || '',
        production_level: data.production_level || '',
        has_visual_effects: data.has_visual_effects || false,
        has_3d: data.has_3d || false,
        has_animations: data.has_animations || false,
        has_typography: data.has_typography || false,
        has_sound_design: data.has_sound_design || false,
        search_profile: data.search_profile || '',
        search_metadata: data.search_metadata || '',
        tags: tagsArray,
        tutorials: (data.tutorials || []).map(t => ({
          mode: 'select', // При редактировании всегда select, так как tutorial уже существует
          tutorial_id: t.id,
          tutorial_url: t.tutorial_url || '',
          label: t.label || '',
          start_sec: t.start_sec || '',
          end_sec: t.end_sec || '',
        })),
      });
    } catch (error) {
      console.error('Error loading video data:', error);
      toast.error('Error loading video data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Обработка выбора категории (чекбокс)
  const handleCategoryToggle = (categoryId, event) => {
    if (event) {
      event.stopPropagation();
    }
    const newCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    
    setSelectedCategoryIds(newCategoryIds);
    setFormData(prev => ({ ...prev, category_ids: newCategoryIds }));
  };

  // Переключение раскрытия/сворачивания категории
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Рекурсивная функция для отображения категорий (как на фронтенде)
  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && Array.isArray(category.children) && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];
    const isSelected = selectedCategoryIds.includes(category.id);

    return (
      <div key={category.id} style={{ marginBottom: '4px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 0',
            paddingLeft: `${level * 20 + 12}px`,
            cursor: 'pointer',
            borderRadius: '4px',
            backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {/* Чекбокс */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleCategoryToggle(category.id, e)}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              flexShrink: 0,
              margin: 0,
            }}
          />
          
          {/* Название категории */}
          <label
            onClick={() => handleCategoryToggle(category.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              color: isSelected ? '#1976d2' : '#333',
              padding: '4px 8px',
              borderRadius: '4px',
              flex: 1,
              userSelect: 'none',
              fontWeight: isSelected ? 500 : 'normal',
              margin: 0,
            }}
          >
            {category.name}
          </label>
          
          {/* Стрелка для раскрытия подкатегорий */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategoryExpand(category.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#666',
                padding: '2px 4px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#007bff';
                e.currentTarget.style.backgroundColor = '#f0f7ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div style={{ marginLeft: 0 }}>
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Получаем корневые категории (parent_id === null)
  const rootCategories = categories.filter(cat => !cat.parent_id);

  // Получить выбранные категории как объекты
  const getSelectedCategories = () => {
    return selectedCategoryIds
      .map(id => {
        const findCategory = (cats) => {
          for (const cat of cats) {
            if (cat.id === id) return cat;
            if (cat.children && cat.children.length > 0) {
              const found = findCategory(cat.children);
              if (found) return found;
            }
          }
          return null;
        };
        return findCategory(categories);
      })
      .filter(cat => cat !== null);
  };

  // Удалить категорию по ID
  const handleRemoveCategory = (categoryId, event) => {
    if (event) {
      event.stopPropagation();
    }
    const newCategoryIds = selectedCategoryIds.filter(id => id !== categoryId);
    setSelectedCategoryIds(newCategoryIds);
    setFormData(prev => ({ ...prev, category_ids: newCategoryIds }));
  };

  // Сохранить выбранные категории из модального окна
  const handleCategoryModalSave = () => {
    setFormData(prev => ({ ...prev, category_ids: selectedCategoryIds }));
    setIsCategoryModalOpen(false);
  };

  const handleTutorialChange = (index, field, value) => {
    setFormData(prev => {
      const tutorials = [...prev.tutorials];
      const currentTutorial = tutorials[index] || {};
      
      if (field === 'mode') {
        // При переключении mode очищаем соответствующие поля
        if (value === 'select') {
          // Переключаемся на select - очищаем tutorial_url и label
          tutorials[index] = {
            ...currentTutorial,
            mode: 'select',
            tutorial_id: '',
            tutorial_url: '',
            label: '',
            // Сохраняем start_sec и end_sec
            start_sec: currentTutorial.start_sec || '',
            end_sec: currentTutorial.end_sec || '',
          };
        } else {
          // Переключаемся на new - очищаем tutorial_id
          tutorials[index] = {
            ...currentTutorial,
            mode: 'new',
            tutorial_id: '',
            tutorial_url: currentTutorial.tutorial_url || '',
            label: currentTutorial.label || '',
            // Сохраняем start_sec и end_sec
            start_sec: currentTutorial.start_sec || '',
            end_sec: currentTutorial.end_sec || '',
          };
        }
      } else {
        tutorials[index] = {
          ...currentTutorial,
          [field]: value,
        };
      }
      
      return { ...prev, tutorials };
    });
  };

  const addTutorial = () => {
    setFormData(prev => ({
      ...prev,
      tutorials: [...prev.tutorials, { 
        mode: 'new', 
        tutorial_id: '', 
        tutorial_url: '', 
        label: '', 
        start_sec: '', 
        end_sec: '' 
      }],
    }));
  };

  const removeTutorial = (index) => {
    setFormData(prev => ({
      ...prev,
      tutorials: prev.tutorials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Валидация категорий
      if (!formData.category_ids || formData.category_ids.length === 0) {
        toast.error('Please select at least one category');
        setLoading(false);
        return;
      }

      // Теги уже в формате массива
      const tagNames = formData.tags || [];

      // Prepare tutorials data с учетом mode
      const tutorials = formData.tutorials
        .filter(t => {
          // Фильтруем только заполненные tutorials
          if (t.mode === 'select') {
            return t.tutorial_id; // В режиме select нужен tutorial_id
          } else {
            return t.tutorial_url && t.label; // В режиме new нужны оба поля
          }
        })
        .map(t => {
          const tutorial = {
            mode: t.mode || 'new',
          };
          
          if (t.mode === 'select') {
            tutorial.tutorial_id = parseInt(t.tutorial_id);
          } else {
            tutorial.tutorial_url = t.tutorial_url.trim();
            tutorial.label = t.label.trim();
          }
          
          // Добавляем start_sec и end_sec если они заполнены
          if (t.start_sec && t.start_sec.toString().trim()) {
            const startSec = parseInt(t.start_sec);
            if (!isNaN(startSec) && startSec >= 0) {
              tutorial.start_sec = startSec;
            }
          }
          if (t.end_sec && t.end_sec.toString().trim()) {
            const endSec = parseInt(t.end_sec);
            if (!isNaN(endSec) && endSec >= 0) {
              tutorial.end_sec = endSec;
            }
          }
          
          return tutorial;
        });

      // Формируем объект данных, исключая null и пустые значения
      const data = {
        title: formData.title,
        source_url: formData.source_url,
        category_ids: formData.category_ids.map(id => parseInt(id)),
        has_visual_effects: formData.has_visual_effects,
        has_3d: formData.has_3d,
        has_animations: formData.has_animations,
        has_typography: formData.has_typography,
        has_sound_design: formData.has_sound_design,
        search_profile: formData.search_profile,
        tags: tagNames, // Теги всегда отправляем (валидация требует минимум 1 при создании)
      };

      // Добавляем опциональные поля только если они не пустые
      if (formData.public_summary && formData.public_summary.trim()) {
        data.public_summary = formData.public_summary.trim();
      }

      if (formData.pacing && formData.pacing.trim()) {
        data.pacing = formData.pacing.trim();
      }

      if (formData.hook_type && formData.hook_type.trim()) {
        data.hook_type = formData.hook_type.trim();
      }

      if (formData.production_level && formData.production_level.trim()) {
        data.production_level = formData.production_level.trim();
      }

      if (formData.search_metadata && formData.search_metadata.trim()) {
        data.search_metadata = formData.search_metadata.trim();
      }

      // Всегда отправляем tutorials (даже если пустой массив) для явной синхронизации
      data.tutorials = tutorials;

      if (video) {
        await videoReferencesAPI.update(video.id, data);
        toast.success('Video reference updated successfully');
      } else {
        await videoReferencesAPI.create(data);
        toast.success('Video reference created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving video reference:', error);
      toast.error(error.response?.data?.message || 'Error saving video reference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{video ? 'Edit Video Reference' : 'Add Video Reference'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="video-reference-form">
          <div className="form-section">
            <h3>Display Fields</h3>
            
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Source URL *</label>
              <input
                type="url"
                name="source_url"
                value={formData.source_url}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Public Summary</label>
              <textarea
                name="public_summary"
                value={formData.public_summary}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <TagsInput
                value={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Categories *</h3>
            <div className="form-group">
              <label>Select Categories (at least one required)</label>
              <div
                onClick={() => setIsCategoryModalOpen(true)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  minHeight: '40px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                {selectedCategoryIds.length > 0 ? (
                  <>
                    {getSelectedCategories().map((category) => (
                      <span
                        key={category.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveCategory(category.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '18px',
                            lineHeight: 1,
                            padding: 0,
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <span
                      style={{
                        color: '#666',
                        fontSize: '14px',
                        marginLeft: 'auto',
                        paddingLeft: '8px',
                      }}
                    >
                      ▼
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ 
                      color: '#999',
                      fontSize: '14px',
                      flex: 1
                    }}>
                      Click to select categories
                    </span>
                    <span style={{ color: '#666', fontSize: '18px' }}>▼</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Filter Fields</h3>

            <div className="form-group">
              <label>Pacing</label>
              <select
                name="pacing"
                value={formData.pacing}
                onChange={handleChange}
              >
                <option value="">Select Pacing</option>
                <option value="slow">Slow</option>
                <option value="fast">Fast</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hook Type</label>
              <input
                type="text"
                name="hook_type"
                value={formData.hook_type}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Production Level</label>
              <select
                name="production_level"
                value={formData.production_level}
                onChange={handleChange}
              >
                <option value="">Select Level</option>
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group checkboxes">
              <label>Flags:</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="has_visual_effects"
                    checked={formData.has_visual_effects}
                    onChange={handleChange}
                  />
                  Has Visual Effects
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_3d"
                    checked={formData.has_3d}
                    onChange={handleChange}
                  />
                  Has 3D
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_animations"
                    checked={formData.has_animations}
                    onChange={handleChange}
                  />
                  Has Animations
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_typography"
                    checked={formData.has_typography}
                    onChange={handleChange}
                  />
                  Has Typography
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="has_sound_design"
                    checked={formData.has_sound_design}
                    onChange={handleChange}
                  />
                  Has Sound Design
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Search Fields</h3>

            <div className="form-group">
              <label>Search Profile *</label>
              <textarea
                name="search_profile"
                value={formData.search_profile}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Search Metadata</label>
              <textarea
                name="search_metadata"
                value={formData.search_metadata}
                onChange={handleChange}
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Tutorials (Optional)</h3>
            {formData.tutorials.map((tutorial, index) => (
              <div key={index} className="tutorial-item">
                <div className="tutorial-header">
                  <h4>Tutorial {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeTutorial(index)}
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
                      className={`mode-btn ${(tutorial.mode || 'new') === 'new' ? 'active' : ''}`}
                      onClick={() => handleTutorialChange(index, 'mode', 'new')}
                    >
                      New
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${(tutorial.mode || 'new') === 'select' ? 'active' : ''}`}
                      onClick={() => handleTutorialChange(index, 'mode', 'select')}
                    >
                      Select
                    </button>
                  </div>
                </div>

                {(tutorial.mode || 'new') === 'select' ? (
                  // Режим Select: показываем селектор существующих tutorials
                  <>
                    <div className="form-group">
                      <label>Select Tutorial *</label>
                      <select
                        value={tutorial.tutorial_id || ''}
                        onChange={(e) => handleTutorialChange(index, 'tutorial_id', e.target.value)}
                      >
                        <option value="">Select Tutorial</option>
                        {tutorials.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label || `Tutorial #${t.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  // Режим New: показываем поля для создания нового tutorial
                  <>
                    <div className="form-group">
                      <label>Tutorial URL *</label>
                      <input
                        type="url"
                        value={tutorial.tutorial_url || ''}
                        onChange={(e) => handleTutorialChange(index, 'tutorial_url', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Label *</label>
                      <input
                        type="text"
                        value={tutorial.label || ''}
                        onChange={(e) => handleTutorialChange(index, 'label', e.target.value)}
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
                      onChange={(e) => handleTutorialChange(index, 'start_sec', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>End (sec)</label>
                    <input
                      type="number"
                      value={tutorial.end_sec || ''}
                      onChange={(e) => handleTutorialChange(index, 'end_sec', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTutorial}
              className="btn btn-secondary"
            >
              Add Tutorial
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : video ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* Модальное окно для выбора категорий */}
      {isCategoryModalOpen && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div 
            className="modal-content" 
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '15px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Select Categories</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '20px',
            }}>
              {rootCategories.length > 0 ? (
                rootCategories.map((category) => renderCategory(category))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                  No categories available
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px',
              borderTop: '1px solid #eee',
              paddingTop: '15px'
            }}>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCategoryModalSave}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }}
              >
                Save ({selectedCategoryIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReferenceForm;

