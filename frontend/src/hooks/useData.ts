import { useDataContext } from '../context/DataContext';

const useData = () => {
  const ctx = useDataContext();
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
};

export default useData;
