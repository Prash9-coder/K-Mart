import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaClock, FaTrendingUp } from 'react-icons/fa';

const SearchSuggestions = ({ 
  searchTerm, 
  onSuggestionClick, 
  onSearch,
  suggestions = [],
  recentSearches = [],
  trendingSearches = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionRef = useRef(null);

  useEffect(() => {
    setIsOpen(searchTerm.length > 0);
    setHighlightedIndex(-1);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + recentSearches.length + trendingSearches.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const allItems = [...suggestions, ...recentSearches, ...trendingSearches];
          handleSuggestionClick(allItems[highlightedIndex]);
        } else {
          onSearch(searchTerm);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={suggestionRef}
      className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 mt-2 z-50 max-h-96 overflow-y-auto animate-scaleIn"
      onKeyDown={handleKeyDown}
    >
      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-2">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-500">
            <FaSearch className="mr-2" />
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center hover:bg-blue-50 ${
                highlightedIndex === index ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <FaSearch className="mr-3 text-gray-400" />
              <span className="flex-1">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-500">
            <FaClock className="mr-2" />
            Recent Searches
          </div>
          {recentSearches.slice(0, 3).map((search, index) => (
            <button
              key={`recent-${index}`}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center hover:bg-gray-50 ${
                highlightedIndex === suggestions.length + index ? 'bg-gray-100 text-gray-700' : 'text-gray-600'
              }`}
              onClick={() => handleSuggestionClick(search)}
            >
              <FaClock className="mr-3 text-gray-400" />
              <span className="flex-1">{search}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
        <div className="p-2 border-t border-gray-100">
          <div className="flex items-center px-3 py-2 text-sm font-medium text-gray-500">
            <FaTrendingUp className="mr-2" />
            Trending
          </div>
          {trendingSearches.slice(0, 3).map((trend, index) => (
            <button
              key={`trending-${index}`}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center hover:bg-orange-50 ${
                highlightedIndex === suggestions.length + recentSearches.length + index 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'text-gray-600'
              }`}
              onClick={() => handleSuggestionClick(trend)}
            >
              <FaTrendingUp className="mr-3 text-orange-500" />
              <span className="flex-1">{trend}</span>
              <span className="text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded-full">Hot</span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {suggestions.length === 0 && recentSearches.length === 0 && trendingSearches.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          <FaSearch className="mx-auto text-3xl mb-2 opacity-50" />
          <p>No suggestions found</p>
          <p className="text-sm">Try searching for products, categories, or brands</p>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;