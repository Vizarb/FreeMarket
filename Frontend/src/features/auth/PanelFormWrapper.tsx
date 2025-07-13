import React from 'react';
import clsx from 'clsx';

interface PanelFormWrapperProps {
  title: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string; // e.g., "max-w-md", "max-w-xl", etc.
  centered?: boolean;
  description?: string;
}

const PanelFormWrapper: React.FC<PanelFormWrapperProps> = ({
  title,
  onSubmit,
  children,
  className = '',
  maxWidth = 'max-w-4xl',
  centered = true,
  description,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={clsx(
        'space-y-6 p-6 bg-white shadow-md rounded-xl w-full',
        maxWidth,
        centered && 'mx-auto',
        className
      )}
    >
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-sm text-zinc-600">{description}</p>}
      </div>
      {children}
    </form>
  );
};

export default PanelFormWrapper;
