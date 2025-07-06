import { useState, useEffect } from 'react';
import { FaArrowUp, FaShoppingCart, FaWhatsapp, FaPhone } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const FloatingActionButton = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { items: cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
      {/* WhatsApp Support */}
      <a
        href="https://wa.me/9346335587"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-interactive animate-float"
        title="WhatsApp Support"
      >
        <FaWhatsapp size={20} />
      </a>

      {/* Call Support */}
      <a
        href="tel:+91 9346335587"
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-interactive animate-float"
        style={{animationDelay: '0.5s'}}
        title="Call Support"
      >
        <FaPhone size={20} />
      </a>

      {/* Cart */}
      <Link
        to="/cart"
        className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-interactive animate-float relative"
        style={{animationDelay: '1s'}}
        title="View Cart"
      >
        <FaShoppingCart size={20} />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse-custom">
            {cartItemCount}
          </span>
        )}
      </Link>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-interactive animate-bounce-custom"
          title="Scroll to Top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default FloatingActionButton;