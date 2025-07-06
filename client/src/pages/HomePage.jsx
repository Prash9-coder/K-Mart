import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProducts, fetchFeaturedProducts, fetchTopProducts } from '../slices/productSlice'
import { getActiveCoupons } from '../slices/couponSlice'
import ProductCard from '../components/product/ProductCard'
import Loader from '../components/ui/Loader'
import Message from '../components/ui/Message'
import { FaArrowRight, FaTag, FaFire, FaStar } from 'react-icons/fa'

const HomePage = () => {
  const dispatch = useDispatch()
  const { products, featuredProducts, topProducts, loading, error } = useSelector((state) => state.product)
  const { coupons } = useSelector((state) => state.coupon || { coupons: [] })
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchProducts({ pageSize: 8 }))
    dispatch(fetchFeaturedProducts())
    dispatch(fetchTopProducts())
    if (isAuthenticated) {
      dispatch(getActiveCoupons())
    }
  }, [dispatch, isAuthenticated])

  // Categories for the homepage
  const categories = [
    {
      id: 'groceries',
      name: 'Groceries',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    },
    {
      id: 'household',
      name: 'Household',
      image: 'https://images.unsplash.com/photo-1584473457409-ce95a9c4d0ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    },
    {
      id: 'personal-care',
      name: 'Personal Care',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    },
    {
      id: 'beverages',
      name: 'Beverages',
      image: 'https://images.unsplash.com/photo-1596803244618-8dea4ebff6c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    },
  ]

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white rounded-2xl p-12 mb-12 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-animate animate-slideIn">
            🛒 Your Neighborhood Store, Now Online
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-slideIn opacity-90">
            Shop for groceries, household items, and more with fast delivery to your doorstep.
          </p>
          <Link
            to="/products"
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold py-4 px-8 rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 btn-interactive shadow-lg hover:shadow-xl animate-bounce-custom"
          >
            🚀 Shop Now
          </Link>
        </div>
        <div className="absolute top-10 right-10 text-6xl opacity-20 animate-float">🛍️</div>
        <div className="absolute bottom-10 right-20 text-4xl opacity-20 animate-float" style={{animationDelay: '1s'}}>🎯</div>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent animate-slideIn">
            🏪 Shop by Category
          </h2>
          <Link
            to="/products"
            className="text-blue-600 flex items-center hover:text-purple-600 transition-all duration-300 font-semibold btn-interactive"
          >
            View All <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="relative rounded-2xl overflow-hidden group card-interactive glow-on-hover animate-fadeIn"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center p-4">
                <h3 className="text-white text-xl font-bold transform group-hover:scale-110 transition-transform duration-300">
                  {category.name}
                </h3>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link
            to="/products"
            className="text-primary flex items-center hover:underline"
          >
            View All <FaArrowRight className="ml-1" />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Special Offers Banner */}
      <section className="my-12">
        <div className="bg-secondary text-white rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Special Offers</h2>
            <p className="mb-4">Get up to 20% off on your first order!</p>
            <Link
              to="/products?discount=true"
              className="inline-block bg-white text-secondary font-bold py-2 px-4 rounded-md hover:bg-gray-100 transition"
            >
              Shop Deals
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Special Offers"
            className="w-full md:w-1/3 h-40 object-cover rounded-lg mt-4 md:mt-0"
          />
        </div>
      </section>
    </div>
  )
}

export default HomePage