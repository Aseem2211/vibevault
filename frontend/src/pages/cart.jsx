import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCart, removeFromCart } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const dm = {
    page: darkMode
      ? "bg-[#0f1220] text-[#e8ecff]"
      : "bg-[#E6E6FA] text-[#1A2556]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    card: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
    panel: darkMode
      ? "bg-[#1e2444] border-[#2a3060]"
      : "bg-[#F8F6FF] border-[#E0E4FF]",
    badge: darkMode
      ? "bg-[#1e2444] text-[#8892be]"
      : "bg-[#E6E6FA] text-[#1A2556]",
    total: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
    subtotal: darkMode ? "bg-[#0f1220]" : "bg-[#E0E4FF]",
    rmvBtn: darkMode
      ? "border-[#2a3060] bg-[#0f1220] text-[#8892be] hover:border-[#FF6B6B] hover:text-[#FF6B6B]"
      : "border-[#E0E4FF] bg-[#F8F6FF] text-[#1A2556] hover:border-[#FF6B6B] hover:text-[#FF6B6B]",
    empty: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
  };

  useEffect(() => {
    getCart()
      .then((res) => {
        setCartItems(res.data.cartitems || []);
        setTotal(res.data.total || 0);
      })
      .catch((err) => console.error("Failed to load cart:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (cartId) => {
    try {
      await removeFromCart(cartId);
      const updated = cartItems.filter((c) => c._id !== cartId);
      setCartItems(updated);
      const newTotal = updated.reduce(
        (sum, c) => sum + c.item.price * c.quantity,
        0
      );
      setTotal(newTotal);
    } catch {
      alert("Could not remove item.");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
        <Navbar section="Cart" />
        <div className="flex flex-col gap-4 max-w-7xl mx-auto px-4 py-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`rounded-[28px] border p-6 animate-pulse h-40 ${dm.card}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Cart" />

      <main className="max-w-7xl mx-auto px-4 py-10">

        <section className="mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className={`text-4xl font-extrabold ${dm.heading}`}>Shopping Cart</h1>
              <p className={`mt-2 ${dm.sub}`}>
                Review your selected items and proceed to checkout.
              </p>
            </div>
            <div className={`rounded-3xl border px-6 py-4 shadow-sm ${dm.total}`}>
              <p className={`text-sm ${dm.sub}`}>Estimated total</p>
              <p className={`mt-1 text-3xl font-semibold ${dm.heading}`}>₹{total}</p>
            </div>
          </div>
        </section>

        {cartItems.length > 0 ? (
          <section className="space-y-6">
            {cartItems.map((cart) => (
              <article
                key={cart._id}
                className={`grid gap-6 rounded-[28px] border p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 md:grid-cols-[220px_minmax(0,1fr)_220px] ${dm.card}`}
              >
                <div className={`overflow-hidden rounded-3xl ${dm.panel}`}>
                  <img
                    src={cart.item?.image||""}
                    alt={cart.item?.section}
                    className="h-full w-full object-cover"
                    onError={(e)=>{e.target.style.display='none';}}
                  />
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <h2 className={`text-2xl font-semibold ${dm.heading}`}>
                      {cart.item.section}
                    </h2>
                    <p className={`mt-2 leading-7 ${dm.sub}`}>
                      {cart.item.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`rounded-full px-3 py-1 ${dm.badge}`}>
                      Condition:{" "}
                      <span className={`font-semibold ${dm.heading}`}>
                        {cart.item.age}
                      </span>
                    </span>
                    <span className="rounded-full bg-[#FFE5E5] px-3 py-1 text-[#FF6B6B]">
                      Qty: <span className="font-semibold">{cart.quantity}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <button
                      onClick={() => handleRemove(cart._id)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 transition ${dm.rmvBtn}`}
                    >
                      <i className="fas fa-trash-alt" /> Remove
                    </button>
                    <button
                      onClick={() => navigate(`/buy/${cart.item._id}`)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#1A2556] dark:bg-[#FF6B6B] px-4 py-2 text-white transition hover:bg-[#FF6B6B]"
                    >
                      <i className="fas fa-bolt" /> Buy now
                    </button>
                  </div>
                </div>

                <div className={`flex flex-col justify-between rounded-3xl border p-5 text-right ${dm.panel}`}>
                  <div>
                    <p className={`text-sm ${dm.sub}`}>Price</p>
                    <p className={`mt-2 text-3xl font-semibold ${dm.heading}`}>
                      ₹{cart.item.price}
                    </p>
                  </div>
                  <div className={`mt-6 rounded-3xl px-4 py-3 ${dm.subtotal}`}>
                    <p className={`text-sm ${dm.sub}`}>Subtotal</p>
                    <p className={`mt-1 text-xl font-semibold ${dm.heading}`}>
                      ₹{cart.item.price * cart.quantity}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className={`rounded-[28px] border p-10 text-center shadow-lg ${dm.empty}`}>
            <i className="fas fa-shopping-cart text-4xl mb-4 block text-[#FF6B6B] opacity-50" />
            <h2 className={`text-2xl font-semibold ${dm.heading}`}>Your cart is empty</h2>
            <p className={`mt-3 ${dm.sub}`}>
              Add some items to start shopping. Your selected items will appear here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-2xl bg-[#FF6B6B] px-6 py-3 text-white font-semibold hover:bg-[#e85555] transition"
            >
              Continue shopping
            </Link>
          </section>
        )}

      </main>
    </div>
  );
}
