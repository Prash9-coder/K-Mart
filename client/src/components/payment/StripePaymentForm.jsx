import { useState } from 'react';

// This is a simplified payment form that doesn't require Stripe libraries
const StripePaymentForm = ({ amount, orderId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  // For demo purposes, let's simulate a successful payment
  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (!cardNumber || !expiryDate || !cvc || !name) {
      setError('Please fill in all card details');
      setLoading(false);
      return;
    }
    
    // Simulate API call delay
    setTimeout(() => {
      const mockPaymentIntent = {
        id: 'pi_' + Math.random().toString(36).substring(2, 15),
        amount: amount * 100,
        status: 'succeeded',
        created: Date.now() / 1000,
      };
      
      onSuccess(mockPaymentIntent);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="mt-4">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="mb-4 p-3 border rounded-md bg-white">
            <div className="mb-4">
              <label htmlFor="cardName" className="block text-sm font-medium mb-1">Name on Card</label>
              <input
                type="text"
                id="cardName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="John Smith"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="4242 4242 4242 4242"
                maxLength="19"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium mb-1">CVC</label>
                <input
                  type="text"
                  id="cvc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Test Mode: Use any card details for this demo. In a real implementation, this would validate with Stripe.
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </button>
          
          <div className="mt-3 text-center text-sm text-gray-500">
            Your payment is secure and encrypted
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripePaymentForm;