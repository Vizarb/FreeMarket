// src/components/common/AuthFormWrapper.tsx
import React from 'react';

interface AuthFormWrapperProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({ title, children, onSubmit }) => (
  <form
    onSubmit={onSubmit}
    className="space-y-4 p-6 bg-white shadow-md rounded-xl w-full max-w-md"
  >
    <h2 className="text-2xl font-bold text-center">{title}</h2>
    {children}
  </form>
);

export default AuthFormWrapper;
