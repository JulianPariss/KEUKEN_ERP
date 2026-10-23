'use client';

import { useAuth } from '@/contexts/AuthContext';
import { LoginView } from '@repo/login';

export default function Login() {
  const { login } = useAuth();
  return <LoginView onLogin={login} />;
}
