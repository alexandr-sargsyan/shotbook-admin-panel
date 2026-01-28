import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { categoriesAPI } from '../../services/api';
import './CategoryForm.css';

const CategoryForm = ({ category, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [slugError, setSlugError] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        parent_id: category.parent_id || '',
        order: category.order || 0,
      });
      setIsSlugManuallyEdited(true);
    }
  }, [category]);

  // Функция для генерации slug из name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      // Транслитерация кириллицы в латиницу (базовая)
      .replace(/[а-яё]/g, (char) => {
        const map = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      // Заменяем пробелы и специальные символы на дефисы
      .replace(/[^a-z0-9]+/g, '-')
      // Удаляем дефисы в начале и конце
      .replace(/^-+|-+$/g, '');
  };

  // Валидация slug
  const validateSlug = (slug) => {
    if (!slug) {
      return 'Slug is required';
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return 'Slug cannot start or end with a hyphen';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name' && !isSlugManuallyEdited && !category) {
      // Автогенерация slug из name при создании новой категории
      const generatedSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: generatedSlug,
      }));
      setSlugError(validateSlug(generatedSlug));
    } else if (name === 'slug') {
      // При ручном редактировании slug
      setIsSlugManuallyEdited(true);
      const slugValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slugValue,
      }));
      setSlugError(validateSlug(slugValue));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'order' ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация slug перед отправкой
    const slugValidationError = validateSlug(formData.slug);
    if (slugValidationError) {
      setSlugError(slugValidationError);
      toast.error(slugValidationError);
      return;
    }
    
    setLoading(true);

    try {
      const data = {
        ...formData,
        parent_id: formData.parent_id || null,
      };

      if (category) {
        await categoriesAPI.update(category.id, data);
        toast.success('Category updated successfully');
        onSuccess();
      } else {
        const response = await categoriesAPI.create(data);
        toast.success('Category created successfully');
        // Передаем ID созданной категории в onSuccess
        const newCategoryId = response.data?.data?.id || null;
        onSuccess(newCategoryId);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  // Filter out current category from parent options (to prevent circular references)
  const parentOptions = categories.filter(cat => !category || cat.id !== category.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category ? 'Edit Category' : 'Add Category'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className={slugError ? 'error' : ''}
              placeholder="auto-generated-from-name"
            />
            {slugError && <span className="error-message">{slugError}</span>}
            <small className="form-hint">
              Only lowercase letters, numbers, and hyphens. Auto-generated from name.
            </small>
          </div>

          <div className="form-group">
            <label>Parent Category</label>
            <select
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
            >
              <option value="">None (Root Category)</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;

