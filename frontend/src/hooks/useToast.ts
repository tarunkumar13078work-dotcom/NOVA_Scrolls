import { useToastContext } from '../context/ToastContext';

const useToast = () => {
  const ctx = useToastContext();
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export default useToast;
