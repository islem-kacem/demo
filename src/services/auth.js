const BASE_URL = '/api';

export const authService = {
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

  async refresh() {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
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
