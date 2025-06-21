import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-primary focus:border-primary
          transition-colors duration-200
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `.trim()}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;