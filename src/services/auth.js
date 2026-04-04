const BASE_URL = '/api';

export const authService = {
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

  async refresh() {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
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
  if (hasJsonBody) {
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}
