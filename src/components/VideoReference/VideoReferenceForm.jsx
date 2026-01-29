import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { videoReferencesAPI, categoriesAPI, tutorialsAPI, hooksAPI } from '../../services/api';
import TagsInput from './TagsInput';
import CategoryModal from './CategoryModal';
import TutorialEditor from './TutorialEditor';
import SimpleRichTextEditor from './SimpleRichTextEditor';
import VideoCard from '../VideoCard/VideoCard';
import './VideoReferenceForm.css';

const VideoReferenceForm = ({ video, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewVideoData, setPreviewVideoData] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    public_summary: '',
    public_summary_html: '',
    category_ids: [],
    pacing: '',
    hook_id: '',
    production_level: '',
    has_visual_effects: false,
    has_3d: false,
    has_animations: false,
    has_typography: false,
    has_sound_design: false,
    has_ai: false,
    search_profile: '',
    tags: [],
    tutorials: [],
    rating: 1,
  });

  useEffect(() => {
    loadCategories();
    loadHooks();
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

  const loadHooks = async () => {
    try {
      const response = await hooksAPI.getAll();
      setHooks(response.data.data);
    } catch (error) {
      console.error('Error loading hooks:', error);
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

  // Функции для определения платформы и извлечения video ID
  const detectPlatform = (url) => {
    if (!url || !url.trim()) {
      return null;
    }

    const urlLower = url.toLowerCase().trim();

    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    }

    if (urlLower.includes('tiktok.com')) {
      return 'tiktok';
    }

    if (urlLower.includes('instagram.com')) {
      return 'instagram';
    }

    if (urlLower.includes('facebook.com')) {
      return 'facebook';
    }

    return null;
  };

  const extractYouTubeId = (url) => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const extractTikTokId = (url) => {
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    if (match) {
      return match[1];
    }

    const mobileMatch = url.match(/m\.tiktok\.com\/v\/(\d+)/);
    if (mobileMatch) {
      return mobileMatch[1];
    }

    return null;
  };

  const extractInstagramId = (url) => {
    const patterns = [
      /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const normalizeFacebookUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const search = urlObj.search;

      if (path.includes('/watch') && search) {
        const params = new URLSearchParams(search);
        const videoId = params.get('v');
        if (videoId) {
          return `https://www.facebook.com/watch/?v=${videoId}`;
        }
      }

      return `https://www.facebook.com${path}`;
    } catch (error) {
      console.warn('Facebook: Не удалось нормализовать URL:', url, error);
      return url;
    }
  };

  const extractFacebookId = (url) => {
    const normalizedUrl = normalizeFacebookUrl(url);

    const reelMatch = normalizedUrl.match(/facebook\.com\/reel\/([a-zA-Z0-9_-]+)/);
    if (reelMatch) {
      return reelMatch[1];
    }

    const watchMatch = normalizedUrl.match(/facebook\.com\/watch\/\?v=(\d+)/);
    if (watchMatch) {
      return watchMatch[1];
    }

    const videosMatch = normalizedUrl.match(/facebook\.com\/([^\/]+)\/videos\/(\d+)/);
    if (videosMatch) {
      return videosMatch[2];
    }

    const postsMatch = normalizedUrl.match(/facebook\.com\/([^\/]+)\/posts\/(\d+)/);
    if (postsMatch) {
      return postsMatch[2];
    }

    return null;
  };

  // Обработчик кнопки Preview
  const handlePreview = () => {
    setPreviewError('');
    setPreviewVideoData(null);

    const url = formData.source_url.trim();

    if (!url) {
      setPreviewError('Please enter a URL');
      setIsPreviewModalOpen(true);
      return;
    }

    // Автоматически определяем платформу
    const platform = detectPlatform(url);

    if (!platform) {
      setPreviewError('Could not detect platform from URL. Supported platforms: YouTube, TikTok, Instagram, Facebook');
      setIsPreviewModalOpen(true);
      return;
    }

    let videoId = null;

    switch (platform) {
      case 'youtube':
        videoId = extractYouTubeId(url);
        break;
      case 'tiktok':
        videoId = extractTikTokId(url);
        break;
      case 'instagram':
        videoId = extractInstagramId(url);
        break;
      case 'facebook':
        videoId = extractFacebookId(url);
        break;
      default:
        setPreviewError('Unsupported platform');
        setIsPreviewModalOpen(true);
        return;
    }

    if (!videoId) {
      setPreviewError(`Could not extract video ID from URL for platform: ${platform}`);
      setIsPreviewModalOpen(true);
      return;
    }

    setPreviewVideoData({
      platform,
      platform_video_id: videoId,
      source_url: url,
      title: formData.title || 'Preview Video',
    });

    setIsPreviewModalOpen(true);
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
        public_summary_html: data.public_summary_html || '',
        category_ids: categoryIds,
        pacing: data.pacing || '',
        hook_id: data.hook?.id || '',
        production_level: data.production_level || '',
        has_visual_effects: data.has_visual_effects || false,
        has_3d: data.has_3d || false,
        has_animations: data.has_animations || false,
        has_typography: data.has_typography || false,
        has_sound_design: data.has_sound_design || false,
        has_ai: data.has_ai || false,
        search_profile: data.search_profile || '',
        tags: tagsArray,
        rating: data.rating !== undefined && data.rating !== null ? data.rating : 1,
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
      [name]: type === 'checkbox' ? checked : (type === 'range' ? parseInt(value) : value),
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
  const handleCategoryModalSave = (categoryIds) => {
    setSelectedCategoryIds(categoryIds);
    setFormData(prev => ({ ...prev, category_ids: categoryIds }));
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
        has_ai: formData.has_ai,
        search_profile: formData.search_profile,
        tags: tagNames, // Теги всегда отправляем (валидация требует минимум 1 при создании)
      };

      // Добавляем опциональные поля только если они не пустые
      if (formData.public_summary_html && formData.public_summary_html.trim()) {
        data.public_summary_html = formData.public_summary_html.trim();
      }

      if (formData.pacing && formData.pacing.trim()) {
        data.pacing = formData.pacing.trim();
      }

      if (formData.hook_id) {
        data.hook_id = formData.hook_id;
      } else {
        data.hook_id = null;
      }

      if (formData.production_level && formData.production_level.trim()) {
        data.production_level = formData.production_level.trim();
      }

      // Rating всегда отправляем (по умолчанию 1)
      data.rating = formData.rating !== undefined && formData.rating !== null ? parseInt(formData.rating) : 1;

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
          <div className="modal-header-actions">
            {video && (
              <button
                type="button"
                className="header-update-btn"
                onClick={() => formRef.current?.requestSubmit()}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Update'}
              </button>
            )}
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="video-reference-form">
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
              <div className="source-url-wrapper">
                <input
                  type="url"
                  name="source_url"
                  value={formData.source_url}
                  onChange={handleChange}
                  required
                  className="source-url-input"
                />
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!formData.source_url.trim()}
                  className="btn-preview"
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Public Summary</label>
              <SimpleRichTextEditor
                value={formData.public_summary_html}
                onChange={(value) => setFormData(prev => ({ ...prev, public_summary_html: value }))}
                placeholder="Enter public summary with formatting..."
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
                className="category-select-field"
              >
                {selectedCategoryIds.length > 0 ? (
                  <>
                    {getSelectedCategories().map((category) => (
                      <span
                        key={category.id}
                        className="category-selected-badge"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveCategory(category.id, e)}
                          className="category-selected-badge-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <span className="category-select-arrow">▼</span>
                  </>
                ) : (
                  <>
                    <span className="category-select-placeholder">
                      Click to select categories
                    </span>
                    <span className="category-select-arrow">▼</span>
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
              <label>Hook</label>
              <select
                name="hook_id"
                value={formData.hook_id}
                onChange={handleChange}
              >
                <option value="">Select Hook</option>
                {hooks.map((hook) => (
                  <option key={hook.id} value={hook.id}>
                    {hook.name}
                  </option>
                ))}
              </select>
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

            <div className="form-group">
              <label>Rating: {formData.rating}</label>
              <div className="rating-slider-container">
                <input
                  type="range"
                  name="rating"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={handleChange}
                  className="rating-slider"
                />
                <div className="rating-labels">
                  <span>0</span>
                  <span>10</span>
                </div>
              </div>
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
                <label>
                  <input
                    type="checkbox"
                    name="has_ai"
                    checked={formData.has_ai}
                    onChange={handleChange}
                  />
                  Has AI
                </label>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Search Fields</h3>

            <div className="form-group">
              <label>Search Profile</label>
              <textarea
                name="search_profile"
                value={formData.search_profile}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Tutorials (Optional)</h3>
            {formData.tutorials.map((tutorial, index) => (
              <TutorialEditor
                key={index}
                tutorial={tutorial}
                index={index}
                availableTutorials={tutorials}
                onChange={handleTutorialChange}
                onRemove={removeTutorial}
              />
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
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onSave={handleCategoryModalSave}
        onCategoriesReload={loadCategories}
      />

      {/* Модальное окно для превью видео */}
      {isPreviewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPreviewModalOpen(false)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={() => setIsPreviewModalOpen(false)}>×</button>
            <div className="preview-modal-content">
              {previewError ? (
                <div className="preview-error">{previewError}</div>
              ) : previewVideoData ? (
                <div className="preview-video-wrapper">
                  <VideoCard video={previewVideoData} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReferenceForm;

