import React from 'react';

/**
 * A large spinner for loading a full page or a large component.
 * @param {string} [props.text='Loading...'] - Optional text to display below spinner
 */
export const PageLoader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-12">
    <div className="w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin" />
    {text && <p className="mt-4 text-lg font-medium text-gray-600">{text}</p>}
  </div>
);

/**
 * A small, inline spinner.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Size of the spinner
 */
export const Spinner = ({ size = 'md' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`${sizeStyles[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * A "skeleton" loader for text content.
 * @param {string} [props.className=''] - Additional class names
 */
export const SkeletonText = ({ className = '' }) => (
  <div
    className={`w-full h-4 bg-gray-200 rounded-full animate-pulse ${className}`}
  />
);

/**
 * A "skeleton" loader for a square/circular image or avatar.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Size of the skeleton
 * @param {boolean} [props.isCircle=false] - Make it a circle (for avatars)
 */
export const SkeletonBlock = ({ size = 'md', isCircle = false }) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
  };
  const shape = isCircle ? 'rounded-full' : 'rounded-lg';

  return (
    <div
      className={`${sizeStyles[size]} ${shape} bg-gray-200 animate-pulse`}
    />
  );
};