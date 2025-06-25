import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  error,
  required = false,
  placeholder = 'Select option',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-primary focus:border-primary
          transition-colors duration-200 bg-white
          dark:bg-gray-800 dark:text-white dark:border-gray-600
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        <option value="" className="text-gray-400 dark:text-gray-400">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;