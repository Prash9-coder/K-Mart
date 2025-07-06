import { useState } from 'react';
import { FaFilter, FaChevronDown, FaChevronUp, FaTimes, FaStar } from 'react-icons/fa';

const AnimatedFilters = ({ 
  filters = {}, 
  onFilterChange, 
  categories = [],
  priceRanges = [],
  brands = [],
  ratings = [5, 4, 3, 2, 1]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    brand: false,
    rating: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onFilterChange(filterType, newValues);
  };

  const clearAllFilters = () => {
    onFilterChange('clear', null);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => {
      return count + (Array.isArray(filterArray) ? filterArray.length : 0);
    }, 0);
  };

  const FilterSection = ({ title, items, filterType, icon, renderItem }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
        onClick={() => toggleSection(filterType)}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span className="font-medium text-gray-800">{title}</span>
          {filters[filterType]?.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse-custom">
              {filters[filterType].length}
            </span>
          )}
        </div>
        {expandedSections[filterType] ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${
        expandedSections[filterType] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4 pt-0 space-y-2">
          {items.map((item, index) => (
            <div 
              key={item.value || item}
              className="animate-fadeIn"
              style={{animationDelay: `${index * 0.05}s`}}
            >
              {renderItem ? renderItem(item, index) : (
                <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mr-3 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                    checked={filters[filterType]?.includes(item.value || item) || false}
                    onChange={(e) => handleFilterChange(filterType, item.value || item, e.target.checked)}
                  />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {item.label || item}
                  </span>
                  {item.count && (
                    <span className="ml-auto text-sm text-gray-500">({item.count})</span>
                  )}
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 btn-interactive"
        >
          <FaFilter className="mr-2" />
          Filters
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full animate-bounce-custom">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`
        lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden
        ${isOpen ? 'block animate-scaleIn' : 'hidden lg:block'}
      `}>
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-blue-600" />
              Filters
            </h3>
            <div className="flex items-center space-x-2">
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors duration-200 btn-interactive"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="max-h-96 lg:max-h-none overflow-y-auto">
          {/* Categories */}
          {categories.length > 0 && (
            <FilterSection
              title="Categories"
              items={categories}
              filterType="category"
              icon="🏪"
            />
          )}

          {/* Price Ranges */}
          {priceRanges.length > 0 && (
            <FilterSection
              title="Price Range"
              items={priceRanges}
              filterType="price"
              icon="💰"
            />
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <FilterSection
              title="Brands"
              items={brands}
              filterType="brand"
              icon="🏷️"
            />
          )}

          {/* Ratings */}
          <FilterSection
            title="Customer Rating"
            items={ratings}
            filterType="rating"
            icon="⭐"
            renderItem={(rating, index) => (
              <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mr-3 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  checked={filters.rating?.includes(rating) || false}
                  onChange={(e) => handleFilterChange('rating', rating, e.target.checked)}
                />
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {rating} & up
                  </span>
                </div>
              </label>
            )}
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AnimatedFilters;