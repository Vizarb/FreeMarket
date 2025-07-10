// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { registerUser } from '@/features/user/userSlice';
import { useFormState } from '@/store/hooks/useFormState';
import AuthFormWrapper from '@/components/common/AuthFormWrapper';
import { useAppDispatch } from '@/store/hooks/hooks';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, setError, loading, setLoading } = useFormState();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
      toast.success(`Welcome, ${username}!`);
      navigate('/marketplace');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
  <div className="flex flex-col min-h-screen bg-gray-100">
    {/* FreeMarket Header */}
    <header className="w-full py-4 px-6 bg-white shadow-sm">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:opacity-80 transition-opacity"
        >
          FreeMarket
        </Link>
      </div>
    </header>

    {/* Form Content */}
    <main className="flex flex-1 items-center justify-center px-4">
      <AuthFormWrapper title="Register" onSubmit={handleRegister}>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div>
          <label className="block mb-1 text-sm font-medium">Username</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Registering...' : 'Register'}
        </Button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </AuthFormWrapper>
    </main>
  </div>
);
};

export default RegisterPage;
