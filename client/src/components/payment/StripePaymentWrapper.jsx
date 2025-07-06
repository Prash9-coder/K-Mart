import StripePaymentForm from './StripePaymentForm';

// This is a simplified wrapper that doesn't require Stripe libraries
const StripePaymentWrapper = ({ amount, orderId, onSuccess, onError }) => {
  return (
    <StripePaymentForm 
      amount={amount} 
      orderId={orderId} 
      onSuccess={onSuccess} 
      onError={onError} 
    />
  );
};

export default StripePaymentWrapper;