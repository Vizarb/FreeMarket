// src/hooks/useFormState.ts
import { useState } from 'react';

export const useFormState = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return {
    error,
    setError,
    loading,
    setLoading,
  };
};
