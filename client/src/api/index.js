// client/src/api/index.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor (to add token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Let Axios handle Content-Type for FormData
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- ADD RESPONSE INTERCEPTOR FOR 401 ERRORS ---
apiClient.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.warn("API Interceptor: Received 401 Unauthorized. Logging out.");
      // Clear authentication data from localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Redirect to login page
      // To avoid circular dependencies with AuthContext here,
      // we'll redirect directly. AuthContext will pick up the lack of token on next load.
      // Or, you could emit a custom event that AuthContext listens to.
      // For simplicity with CRA, direct navigation is common here.
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login?sessionExpired=true'; // Add a query param for a message
      }
    }
    // For other errors, just pass them on
    return Promise.reject(error);
  }
);
// --- END OF RESPONSE INTERCEPTOR ---


// Auth API calls
export const loginAdmin = (credentials) => apiClient.post('/auth/login', credentials);

// Media API calls (Public)
export const getPublicGalleryImages = (page = 1, limit = 12) =>
  apiClient.get(`/media/gallery?page=${page}&limit=${limit}`);

// Media API calls (Admin - Protected)
export const getAllAdminMedia = () => apiClient.get('/media/admin/all');
export const uploadMedia = (formData) => apiClient.post('/media/upload', formData);
export const updateMedia = (mediaId, data) => apiClient.put(`/media/edit/${mediaId}`, data);
export const deleteMedia = (mediaId) => apiClient.delete(`/media/delete/${mediaId}`);

// Helper functions to get proxied media URLs
export const getMediaViewURL = (pathname) => {
  if (!pathname || typeof pathname !== 'string') return '';
  return `${API_BASE_URL}/media/view/${pathname}`;
};
export const getMediaDownloadURL = (pathname, originalFilename) => {
  if (!pathname || typeof pathname !== 'string') return '';
  const filenameParam = originalFilename ? `?filename=${encodeURIComponent(originalFilename)}` : '';
  return `${API_BASE_URL}/media/download/${pathname}${filenameParam}`;
};

export default apiClient;