import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin }   from './uselogin';
import { useAuth }    from '@/features/auth/useAuth';
import { Input }      from '@/common/ui/input';
import { Button }     from '@/common/ui/button';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage: React.FC = () => {
  const { username, password, loading, error, setUsername, setPassword, handleSubmit } =
    useLogin();
  const { authLoaded, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const state     = location.state as LocationState;
  const from      = state?.from?.pathname ?? '/';

  useEffect(() => {
    if (authLoaded && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [authLoaded, isAuthenticated, navigate, from]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* FreeMarket Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:opacity-80 transition-opacity">
            FreeMarket
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 mt-10 p-6 bg-white shadow-md rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
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
          <label className="block mb-1 text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-green-600">
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <div>
          <Link to="/register">
            <Button variant="link" className="w-full">Register</Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
