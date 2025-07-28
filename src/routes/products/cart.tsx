import { useCartStore } from '@/stores/cartStore';
import { useNavigate, createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';


export const Route = createFileRoute('/products/cart')({
  component: CartPage,
});

// Balloon SVG component
function Balloon({ color, className, style }: { color: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      width="48"
      height="72"
      viewBox="0 0 48 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="24" cy="32" rx="20" ry="28" fill={color} fillOpacity="0.7" />
      <rect x="22" y="60" width="4" height="12" rx="2" fill="#888" />
      <path d="M24 60 Q26 66 24 72 Q22 66 24 60" stroke="#888" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CartPage() {
  const { items, removeFromCart, addToCart, decrementFromCart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate({ to: '/signin' });
    } else {
      navigate({ to: '/locations/locations' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center py-10 relative overflow-hidden">
      {/* 8 Animated Balloons, further outside the card */}
      <Balloon color="#f97316" className="balloon balloon1" style={{ left: 'calc(50% - 28rem)', top: 'calc(50% - 18rem)' }} /> {/* top-left */}
      <Balloon color="#f59e42" className="balloon balloon2" style={{ left: 'calc(50% - 28rem)', top: '50%' }} /> {/* mid-left */}
      <Balloon color="#fb7185" className="balloon balloon3" style={{ left: 'calc(50% - 28rem)', bottom: 'calc(50% - 18rem)' }} /> {/* bottom-left */}
      <Balloon color="#22c55e" className="balloon balloon4" style={{ right: 'calc(50% - 28rem)', top: 'calc(50% - 18rem)' }} /> {/* top-right */}
      <Balloon color="#34d399" className="balloon balloon5" style={{ right: 'calc(50% - 28rem)', top: '50%' }} /> {/* mid-right */}
      <Balloon color="#16a34a" className="balloon balloon6" style={{ right: 'calc(50% - 28rem)', bottom: 'calc(50% - 18rem)' }} /> {/* bottom-right */}
      <Balloon color="#facc15" className="balloon balloon7" style={{ left: '50%', top: 'calc(50% - 22rem)', transform: 'translateX(-50%)' }} /> {/* top */}
      <Balloon color="#fbbf24" className="balloon balloon8" style={{ left: '50%', bottom: 'calc(50% - 22rem)', transform: 'translateX(-50%)' }} /> {/* bottom */}
      <style>{`
        .balloon {
          position: absolute;
          z-index: 5;
          opacity: 0.7;
          pointer-events: none;
          animation: bounce 4s infinite ease-in-out;
        }
        .balloon1 { animation-delay: 0s; }
        .balloon2 { animation-delay: 0.5s; }
        .balloon3 { animation-delay: 1s; }
        .balloon4 { animation-delay: 1.5s; }
        .balloon5 { animation-delay: 2s; }
        .balloon6 { animation-delay: 2.5s; }
        .balloon7 { animation-delay: 3s; }
        .balloon8 { animation-delay: 3.5s; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-20px) scale(1.05); }
          40% { transform: translateY(-35px) scale(1.1); }
          60% { transform: translateY(-20px) scale(1.05); }
          80% { transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-200 px-8 py-10 flex flex-col items-center relative z-10">
        <h1 className="text-3xl font-bold mb-8 text-orange-600 flex items-center gap-2">
          <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h8.54a2 2 0 001.83-1.3L21 13M7 13V6h13' /></svg>
          Your Cart
        </h1>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="w-24 h-24 text-orange-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h8.54a2 2 0 001.83-1.3L21 13M7 13V6h13" /></svg>
            <div className="text-gray-500 text-lg mb-6">Your cart is empty.</div>
            <button
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg"
              onClick={() => navigate({ to: '/products' })}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-orange-100 w-full mb-8">
              {items.map((item, idx) => (
                <li key={item.id + '-' + idx} className="flex items-center py-6 gap-6">
                  <img src={item.imageUrl} alt={item.product_name} className="w-20 h-20 object-cover rounded-2xl border-2 border-orange-100 shadow-sm" />
                  <div className="flex-1 flex flex-col h-full justify-between">
                    <div className="font-semibold text-lg text-gray-800 mb-1">{item.product_name}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-semibold text-green-700">KSH {item.price}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:underline text-xs ml-2 font-semibold">Remove</button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button className="px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 text-lg font-bold text-orange-600" onClick={() => decrementFromCart(item.id)}>-</button>
                      <span className="px-3 text-base font-semibold">{item.quantity}</span>
                      <button className="px-3 py-1 bg-orange-100 rounded-lg hover:bg-orange-200 text-lg font-bold text-orange-600" onClick={() => addToCart({ id: item.id, product_name: item.product_name, price: item.price, imageUrl: item.imageUrl })}>+</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="w-full flex flex-col sm:flex-row justify-between items-center font-bold text-2xl mb-8 gap-4">
              <span className="text-green-700">Total:</span>
              <span className="text-orange-600">KSH {total.toFixed(2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg flex-1" onClick={() => navigate({ to: '/products' })}>
                Continue Shopping
              </button>
              <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg flex-1" onClick={handleCheckout}>
                Checkout
              </button>
              <button className="text-red-500 hover:underline ml-auto font-semibold" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 