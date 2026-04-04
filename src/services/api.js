const BASE_URL = '/api';

export const api = {
  // Film-related methods (SWAPI)
  async getFilms() {
    try {
      const res = await fetch('https://swapi.dev/api/films');
      if (!res.ok) throw new Error('Failed to fetch films');
      return res.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to SWAPI. Check your internet connection.');
      }
      throw error;
    }
  },

  // User-related methods
  async signup(data) {
    try {
      const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3001');
      }
      throw error;
    }
  },

  async login(data) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3001');
      }
      throw error;
    }
  },

  async logout() {
    try {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      return handleResponse(res);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3001');
      }
      throw error;
    }
  },

  async me() {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        credentials: 'include'
      });
      return handleResponse(res);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3001');
      }
      throw error;
    }
  },

  async getProfile() {
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        credentials: 'include'
      });
      return handleResponse(res);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3001');
      }
      throw error;
    }
  },

  async updateProfile(data) {
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      return handleResponse(res);
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on http://localhost:3001');
      }
      throw error;
    }
  }
};

async function handleResponse(res) {
  // Check if response has content (handles 204 No Content)
  const contentType = res.headers.get('content-type');
  const hasJsonBody = contentType && contentType.includes('application/json');

  let data = null;
  let responseText = '';

  try {
    if (hasJsonBody) {
      responseText = await res.text();
      data = responseText ? JSON.parse(responseText) : null;
    } else {
      responseText = await res.text();
    }
  } catch (e) {
    // JSON parse failed
    responseText = await res.text();
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.error || responseText || `${res.status} ${res.statusText}`;

    // Provide helpful message for common issues
    if (res.status === 401) {
      throw new Error(`Authentication required: ${errorMsg}. Please log in again.`);
    }
    if (res.status === 404) {
      throw new Error(`Endpoint not found: ${res.url}. Is the backend running?`);
    }
    if (res.status === 500) {
      throw new Error(`Server error: ${errorMsg}`);
    }

    throw new Error(`Request failed (${res.status}): ${errorMsg}`);
  }

  return data;
}
