import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = '',
  showFilter = false,
  onFilterClick 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center transition-all duration-200
        ${isFocused ? 'ring-2 ring-primary ring-opacity-20 dark:ring-primary/30' : ''}
      `}>
        <ApperIcon 
          name="Search" 
          size={20} 
          className="absolute left-3 text-gray-400 dark:text-gray-500" 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={clearSearch}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <ApperIcon name="X" size={16} />
          </motion.button>
        )}
        
        {showFilter && !searchTerm && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onFilterClick}
            className="absolute right-3 p-1 text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary transition-colors"
          >
            <ApperIcon name="Filter" size={16} />
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;