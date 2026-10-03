import React, { useState } from 'react';
import { Home } from 'lucide-react';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({ src, alt, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-slate-300 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Home className="w-10 h-10 text-blue-400 mb-2 opacity-80" />
        <span className="text-xs font-medium text-slate-300 line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
};
