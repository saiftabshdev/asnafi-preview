import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenAndLoadUser } = useAuth();

  useEffect(() => {
    const token = params.get('accessToken');
    const redirect = params.get('redirect') || '/dashboard';
    const error = params.get('error');

    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    if (token) {
      setTokenAndLoadUser(token)
        .then(() => {
          navigate(redirect, { replace: true });
        })
        .catch(() => {
          navigate('/login?error=auth_failed', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate, setTokenAndLoadUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  );
}
