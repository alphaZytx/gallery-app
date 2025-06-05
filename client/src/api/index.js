// client/src/api/index.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    // console.log("--- AXIOS REQUEST INTERCEPTOR ---");
    // console.log("Request URL:", config.url);
    // console.log("Original Config Data Type:", config.data?.constructor?.name);
    // console.log("Original Config Headers:", JSON.parse(JSON.stringify(config.headers || {})));

    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // console.log("Modified Config Headers:", JSON.parse(JSON.stringify(config.headers || {})));
    // console.log("--- END AXIOS REQUEST INTERCEPTOR ---");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const loginAdmin = (credentials) => apiClient.post('/auth/login', credentials);
export const getPublicGalleryImages = (page = 1, limit = 12) =>
  apiClient.get(`/media/gallery?page=${page}&limit=${limit}`);
export const getAllAdminMedia = () => apiClient.get('/media/admin/all');

export const uploadMedia = (formData) => {
  // console.log("API: uploadMedia called. FormData entries just before POST:");
  // for (let [key, value] of formData.entries()) {
  //   if (value instanceof File) {
  //     console.log(`API FormData: ${key}`, { name: value.name, type: value.constructor.name });
  //   } else {
  //     console.log(`API FormData: ${key}`, value);
  //   }
  // }
  return apiClient.post('/media/upload', formData);
};

export const updateMedia = (mediaId, data) => apiClient.put(`/media/edit/${mediaId}`, data);
export const deleteMedia = (mediaId) => apiClient.delete(`/media/delete/${mediaId}`);

export const getMediaViewURL = (pathname) => {
  if (!pathname || typeof pathname !== 'string') {
    // console.warn("getMediaViewURL called with invalid pathname:", pathname);
    return ''; // Return an empty string or a placeholder for invalid pathnames
  }
  return `${API_BASE_URL}/media/view/${pathname}`;
};

export const getMediaDownloadURL = (pathname, originalFilename) => {
  if (!pathname || typeof pathname !== 'string') return '';
  const filenameParam = originalFilename ? `?filename=${encodeURIComponent(originalFilename)}` : '';
  return `${API_BASE_URL}/media/download/${pathname}${filenameParam}`;
};

export default apiClient;