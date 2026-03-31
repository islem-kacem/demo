const BASE_URL = '/api';

export const userService = {
  async getProfile() {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async updateProfile(data) {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(res);
  }
};

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}
