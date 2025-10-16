import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, Trash2, CreditCard, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { purchaseService } from '../services/api';

function Cart() {
  const { state, dispatch } = useCart();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const updateQuantity = (id: string, quantity: number) => {
    console.log(`Updating quantity for item ID: ${id} to ${quantity}`);
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id: string) => {
    console.log(`Removing item ID: ${id} from cart`);
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const subtotal = state.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    console.log('Checkout process initiated');
    if (!isAuthenticated) {
      console.warn('Checkout attempt failed: User not authenticated.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    console.log(`User ${isAuthenticated ? 'is' : 'is not'} authenticated. Token ${token ? 'present' : 'absent'}.`);

    setIsCheckingOut(true);
    setCheckoutError(null);
    setTransactionId(null);
    setCheckoutSuccess(false);

    try {
      // Format cart items according to the API's expected structure
      const formattedItems = state.items.map(item => ({
        productId: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const purchaseData = {
        items: formattedItems,
        total: total.toFixed(2)
      };

      console.log('Sending purchase data to API', purchaseData);

      const response = await purchaseService.createPurchase(
        purchaseData.items,
        purchaseData.total,
        token!
      );

      console.log(`Checkout successful. Purchase ID: ${response.purchase.id}`);
      setTransactionId(response.purchase.id);
      setCheckoutSuccess(true);

      // Clear cart
      dispatch({ type: 'CLEAR_CART' });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Checkout error:', error.message);
      setCheckoutError(error.message || 'Failed to process checkout');
    } finally {
      console.log('Checkout process finished.');
      setIsCheckingOut(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 inline-flex items-center mx-auto">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-medium">Order placed successfully!</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Thank you for your purchase</h2>
          <p className="text-gray-600 mb-2">Your transaction ID: <span className="font-semibold">#{transactionId}</span></p>
          <p className="text-gray-600 mb-8">We've sent you a confirmation email with your order details.</p>
          <Link
            to="/"
            className="bg-[#1a1a2e] text-white px-6 py-3 rounded-lg hover:bg-[#39ff14] hover:text-[#1a1a2e] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like your cart needs unborking!</p>
          <Link
            to="/"
            className="bg-[#1a1a2e] text-white px-6 py-3 rounded-lg hover:bg-[#39ff14] hover:text-[#1a1a2e] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {checkoutError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {state.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-6 mb-4 flex items-center"
              data-testid="cart-item"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="ml-6 grow">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id.toString(), item.quantity - 1)}
                    className="p-1 hover:text-[#39ff14]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id.toString(), item.quantity + 1)}
                    className="p-1 hover:text-[#39ff14]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id.toString())}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            data-testid="checkout-button"
            className="w-full mt-6 bg-[#1a1a2e] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#39ff14] hover:text-[#1a1a2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5" />
            <span>{isCheckingOut ? 'Processing...' : 'Checkout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
