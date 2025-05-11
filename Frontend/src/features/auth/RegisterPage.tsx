// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <a href="/login" className="text-blue-600 hover:underline">
          Login here
        </a>
      </p>
    </AuthFormWrapper>
  );
};

export default RegisterPage;
