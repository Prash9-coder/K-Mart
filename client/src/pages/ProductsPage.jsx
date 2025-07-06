import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchProducts } from '../slices/productSlice'
import ProductCard from '../components/product/ProductCard'
import Loader from '../components/ui/Loader'
import Message from '../components/ui/Message'
import { FaFilter, FaTimes } from 'react-icons/fa'

const ProductsPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { products, loading, error } = useSelector((state) => state.product)
  
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  
  // Get search params from URL
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get('search')
  const categoryParam = searchParams.get('category')
  
  // Available categories
  const categories = [
    { id: 'groceries', name: 'Groceries' },
    { id: 'household', name: 'Household' },
    { id: 'personal-care', name: 'Personal Care' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'snacks', name: 'Snacks & Confectionery' },
  ]

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([...selectedCategories, categoryParam])
    }
  }, [categoryParam])

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products]
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // Apply category filter
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(product => 
          selectedCategories.includes(product.category)
        )
      }
      
      // Apply price range filter
      filtered = filtered.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      )
      
      // Apply sorting
      switch (sortBy) {
        case 'price-low-high':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high-low':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'newest':
        default:
          // Assuming products have a createdAt field
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
      
      setFilteredProducts(filtered)
    }
  }, [products, searchQuery, selectedCategories, priceRange, sortBy])

  const handleCategoryChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  const handlePriceChange = (e, index) => {
    const newPriceRange = [...priceRange]
    newPriceRange[index] = Number(e.target.value)
    setPriceRange(newPriceRange)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setSortBy('newest')
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {searchQuery 
            ? `Search Results for "${searchQuery}"` 
            : categoryParam 
              ? `${categories.find(c => c.id === categoryParam)?.name || 'Products'}` 
              : 'All Products'}
        </h1>
        <button 
          onClick={toggleFilter}
          className="md:hidden flex items-center bg-gray-100 px-3 py-2 rounded-md"
        >
          <FaFilter className="mr-2" /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters - Desktop */}
        <div className="hidden md:block w-64 bg-white p-4 rounded-lg shadow-md h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Filters</h2>
            <button 
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Categories</h3>
            {categories.map(category => (
              <div key={category.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="mr-2"
                />
                <label htmlFor={`category-${category.id}`}>{category.name}</label>
              </div>
            ))}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex justify-between mb-2">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-full"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="font-semibold mb-2">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="newest">Newest</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {/* Filters - Mobile */}
        {isFilterOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-4/5 h-full p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={toggleFilter}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear All
                </button>
                <button 
                  onClick={toggleFilter}
                  className="bg-primary text-white px-4 py-2 rounded-md"
                >
                  Apply
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Categories</h3>
                {categories.map(category => (
                  <div key={category.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`mobile-category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`mobile-category-${category.id}`}>{category.name}</label>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="flex justify-between mb-2">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-semibold mb-2">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="error">{error}</Message>
          ) : filteredProducts.length === 0 ? (
            <Message>No products found. Try adjusting your filters.</Message>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">{filteredProducts.length} products found</p>
                <div className="hidden md:block">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage