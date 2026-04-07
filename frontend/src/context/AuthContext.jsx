import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hrm_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hrm_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => { setUser(null); setToken(null); localStorage.removeItem('hrm_token'); localStorage.removeItem('hrm_user'); })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('hrm_token', t);
    localStorage.setItem('hrm_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (name, email, password, role) => {
    const res = await authApi.register({ name, email, password, role });
    const { token: t, user: u } = res.data;
    localStorage.setItem('hrm_token', t);
    localStorage.setItem('hrm_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('hrm_token');
    localStorage.removeItem('hrm_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
