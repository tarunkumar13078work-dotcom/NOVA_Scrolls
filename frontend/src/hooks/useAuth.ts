import { useAuthContext } from '../context/AuthContext';

const useAuth = () => {
  const ctx = useAuthContext();
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

export default useAuth;
