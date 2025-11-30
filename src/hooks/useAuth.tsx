import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  employee_id: string;
  department: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('token', token);
      setUser(user);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string, name: string, department: string) => {
    try {
      const { user, token } = await api.register({ email, password, name, department });
      localStorage.setItem('token', token);
      setUser(user);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
