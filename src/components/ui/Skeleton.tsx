import React from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-card)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
