const BASE_URL = '/api';

export const userService = {
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
