import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { categoriesAPI } from '../../services/api';
import CategoryForm from './CategoryForm';
import ConfirmModal from '../ConfirmModal';
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, categoryId: null, categoryName: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteClick = (id, name) => {
    setConfirmModal({
      isOpen: true,
      categoryId: id,
      categoryName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    const { categoryId } = confirmModal;
    
    try {
      await categoriesAPI.delete(categoryId);
      toast.success('Category deleted successfully');
      setConfirmModal({ isOpen: false, categoryId: null, categoryName: '' });
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.response?.status === 422) {
        toast.error(error.response.data.message || 'Cannot delete category with children or video references');
      } else {
        toast.error('Error deleting category');
      }
      setConfirmModal({ isOpen: false, categoryId: null, categoryName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmModal({ isOpen: false, categoryId: null, categoryName: '' });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    loadCategories();
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategoryName = (parentId, allCategories) => {
    if (!parentId) return '-';
    const findCategory = (cats, id) => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children) {
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const parent = findCategory(allCategories, parentId);
    return parent ? parent.name : '-';
  };

  const renderCategoryRow = (category, level = 0, allCategories) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const indent = level * 30;

    return (
      <React.Fragment key={category.id}>
        <tr className={level > 0 ? 'child-category' : ''}>
          <td>{category.id}</td>
          <td style={{ paddingLeft: `${indent + 10}px` }}>
            {hasChildren && (
              <button
                className="expand-btn"
                onClick={() => toggleExpand(category.id)}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <span className="no-children-indicator">•</span>}
            <span className="category-name">{category.name}</span>
          </td>
          <td>{category.slug}</td>
          <td>{getCategoryName(category.parent_id, allCategories)}</td>
          <td>{category.order || 0}</td>
          <td>
            <button
              onClick={() => handleEdit(category)}
              className="btn btn-edit"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(category.id, category.name)}
              className="btn btn-delete"
            >
              Delete
            </button>
          </td>
        </tr>
        {hasChildren && isExpanded && category.children.map(child => 
          renderCategoryRow(child, level + 1, allCategories)
        )}
      </React.Fragment>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Flatten categories for form (to get all categories including children)
  const getAllCategoriesFlat = (cats) => {
    let result = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children) {
        result = result.concat(getAllCategoriesFlat(cat.children));
      }
    });
    return result;
  };

  const allCategoriesFlat = getAllCategoriesFlat(categories);

  return (
    <div className="category-list">
      <div className="page-header">
        <h1>Categories</h1>
        <button onClick={handleAdd} className="btn btn-primary">
          Add Category
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Parent</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-state">
                No categories found
              </td>
            </tr>
          ) : (
            categories.map((category) => renderCategoryRow(category, 0, categories))
          )}
        </tbody>
      </table>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          categories={allCategoriesFlat}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${confirmModal.categoryName}"?`}
      />
    </div>
  );
};

export default CategoryList;

