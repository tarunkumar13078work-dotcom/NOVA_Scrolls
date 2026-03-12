import { useAuthContext } from '../context/AuthContext.jsx';

const useAuth = () => {
  const ctx = useAuthContext();
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export default useAuth;
