import {API_URL} from '../config/api';

const TOKEN_KEY = 'robodash_token';
const USER_KEY = 'robodash_user';

export const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return null;

  try {
    return {token, user: JSON.parse(raw)};
  } catch {
    return null;
  }
};

export const storeAuth = ({token, user}) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const loginRequest = async (username, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
};

export const canSendCommands = role =>
  role === 'operator' || role === 'admin';
