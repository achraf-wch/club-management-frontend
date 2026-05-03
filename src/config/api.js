const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const storageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const cleanPath = path.replace(/^\/+/, '').replace(/^public\//, '');
  return `${API_BASE_URL}/storage/${cleanPath}`;
};
