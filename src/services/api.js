import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Video References API
export const videoReferencesAPI = {
  getAll: () => api.get('/video-references'),
  getById: (id) => api.get(`/video-references/${id}`),
  search: (id, sourceUrl) => {
    const params = {};
    if (id) params.id = id;
    if (sourceUrl) params.source_url = sourceUrl;
    return api.get('/video-references', { params });
  },
  create: (data) => api.post('/video-references', data),
  update: (id, data) => api.put(`/video-references/${id}`, data),
  delete: (id) => api.delete(`/video-references/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
};

// Helper function to handle tags
export const processTags = async (tagsString) => {
  if (!tagsString || !tagsString.trim()) {
    return [];
  }

  const tagNames = tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const tagIds = [];

  for (const tagName of tagNames) {
    try {
      // Try to find existing tag
      const allTags = await tagsAPI.getAll();
      const existingTag = allTags.data.data.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());

      if (existingTag) {
        tagIds.push(existingTag.id);
      } else {
        // Create new tag
        const newTag = await tagsAPI.create({ name: tagName });
        tagIds.push(newTag.data.data.id);
      }
    } catch (error) {
      console.error(`Error processing tag "${tagName}":`, error);
    }
  }

  return tagIds;
};

export default api;

