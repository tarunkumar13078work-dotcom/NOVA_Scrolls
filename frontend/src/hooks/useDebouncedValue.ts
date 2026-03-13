import { useEffect, useState } from 'react';

const useDebouncedValue = <T,>(value: T, delay = 250): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
};

export default useDebouncedValue;
