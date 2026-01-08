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

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        parent_id: category.parent_id || '',
        order: category.order || 0,
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        parent_id: formData.parent_id || null,
      };

      if (category) {
        await categoriesAPI.update(category.id, data);
        toast.success('Category updated successfully');
      } else {
        await categoriesAPI.create(data);
        toast.success('Category created successfully');
      }

      onSuccess();
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
            />
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

