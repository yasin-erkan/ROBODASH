import {useState} from 'react';
import {
  clearAuth,
  getStoredAuth,
  loginRequest,
  storeAuth,
} from '../lib/auth';
import {disconnectSocket} from '../lib/socket';

export function useAuth() {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const login = async (username, password) => {
    const data = await loginRequest(username, password);
    storeAuth(data);
    setAuth({token: data.token, user: data.user});
  };

  const logout = () => {
    disconnectSocket();
    clearAuth();
    setAuth(null);
  };

  return {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isLoggedIn: Boolean(auth?.token),
    login,
    logout,
  };
}
