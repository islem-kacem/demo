const BASE_URL = '/api';

export const api = {
  // Film-related methods (SWAPI)
  async getFilms() {
    const res = await fetch('https://swapi.dev/api/films');
    if (!res.ok) throw new Error('Failed to fetch films');
    return res.json();
  },

  // User-related methods
  async signup(data) {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(data) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async logout() {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async me() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    return handleResponse(res);
  },

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
