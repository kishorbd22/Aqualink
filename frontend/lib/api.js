/**
 * Aqualink - API Client
 *
 * Axios-based HTTP client for communicating with the backend API.
 * Handles auth tokens and error responses.
 */

// Use fetch directly to avoid needing axios on the client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the stored auth token from localStorage (client only).
 */
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aqualink_token');
};

/**
 * Get the stored user from localStorage.
 */
const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('aqualink_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Store auth data after login/register.
 */
const setAuth = (token, user) => {
  localStorage.setItem('aqualink_token', token);
  localStorage.setItem('aqualink_user', JSON.stringify(user));
};

/**
 * Clear auth data on logout.
 */
const clearAuth = () => {
  localStorage.removeItem('aqualink_token');
  localStorage.removeItem('aqualink_user');
};

/**
 * Base fetch wrapper with auth headers.
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Auth API calls.
 */
const auth = {
  register: (body) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMe: () => request('/auth/me'),
};

/**
 * Listings API calls.
 */
const listings = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const qs = params.toString();
    return request(`/listings${qs ? `?${qs}` : ''}`);
  },

  getById: (id) => request(`/listings/${id}`),

  create: (body) =>
    request('/listings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id, body) =>
    request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id) =>
    request(`/listings/${id}`, {
      method: 'DELETE',
    }),
};

export { auth, listings, getToken, getStoredUser, setAuth, clearAuth };