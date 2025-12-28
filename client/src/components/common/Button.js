import React from 'react';


const ButtonSpinner = () => (
  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
);


const Button = ({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  // --- Base styles ---
  const baseStyles =
    'flex items-center justify-center font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150';

  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  
  const variantStyles = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 disabled:bg-gray-50 disabled:text-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400 disabled:text-gray-400',
  };

  
  const isDisabled = disabled || loading;
  const disabledStyles = isDisabled ? 'opacity-70 cursor-not-allowed' : '';

  // Combine all classes
  const classes = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    disabledStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Utility to render icons with correct spacing
  const renderIcon = (icon) => (
    <span className={`${children ? (size === 'sm' ? 'mr-1.5' : 'mr-2') : ''}`}>
      {React.cloneElement(icon, {
        className: `w-${size === 'sm' ? 4 : 5} h-${size === 'sm' ? 4 : 5}`,
      })}
    </span>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={classes}
      {...props}
    >
      {loading && <ButtonSpinner />}
      {!loading && leftIcon && renderIcon(leftIcon)}
      {!loading && children}
      {!loading && rightIcon && (
        <span className={`${children ? (size === 'sm' ? 'ml-1.5' : 'ml-2') : ''}`}>
          {React.cloneElement(rightIcon, {
            className: `w-${size === 'sm' ? 4 : 5} h-${size === 'sm' ? 4 : 5}`,
          })}
        </span>
      )}
    </button>
  );
};

export default Button;