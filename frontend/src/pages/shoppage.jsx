
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getItemsBySection, addToCart } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ShopPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMsg, setCartMsg] = useState({});
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] via-[#F7F1FF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F9FF] border-[#D7DBFF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    itemCard: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white border-[#E0E4FF]",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  useEffect(() => {
    getItemsBySection("all")
      .then((res) => setItems(res.data))
      .catch(() => setError("Failed to load items. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (id) => {
    try {
      await addToCart(id);
      setCartMsg((prev) => ({ ...prev, [id]: "Added!" }));
      setTimeout(() => setCartMsg((prev) => ({ ...prev, [id]: null })), 2000);
    } catch {
      setCartMsg((prev) => ({ ...prev, [id]: "Error" }));
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <section className={`mb-10 rounded-[32px] border p-8 shadow-[0_30px_70px_rgba(26,37,86,0.08)] backdrop-blur-xl ${dm.card}`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${dm.sub}`}>Discover</p>
              <h1 className={`mt-3 text-4xl font-extrabold ${dm.heading}`}>Browse rentals in your area</h1>
              <p className={`mt-4 max-w-2xl text-base leading-8 ${dm.sub}`}>
                Explore products available for rent near you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/cart"
                className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:opacity-80 ${dm.card} ${dm.heading}`}
              >
                <i className="fas fa-shopping-cart" />
                View Cart
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FAD6F5] px-5 py-3 text-sm font-semibold text-[#7F1D78] transition hover:bg-[#F7C0EC]"
              >
                <i className="fas fa-box-open" />
                My Orders
              </Link>
            </div>
          </div>
        </section>

        {loading && (
          <p className={`text-center py-12 text-lg ${dm.sub}`}>Loading items…</p>
        )}
        {error && (
          <div className={`rounded-2xl border p-4 text-sm text-center mb-6 ${dm.errBox}`}>{error}</div>
        )}

        {!loading && !error && (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.length === 0 ? (
              <p className={`col-span-full text-center py-12 ${dm.sub}`}>No items found.</p>
            ) : (
              items.map((item) => (
                <article
                  key={item._id || item.id}
                  className={`overflow-hidden rounded-[28px] border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${dm.itemCard}`}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.section}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs uppercase tracking-[0.24em] ${dm.sub}`}>Item</p>
                        <h2 className={`mt-2 text-2xl font-semibold ${dm.heading}`}>
                          {item.section || "Item"}
                        </h2>
                      </div>
                      <span className="rounded-full bg-[#EDE6FF] px-3 py-1 text-sm font-semibold text-[#5B4CAB]">
                        Rental
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className={`text-3xl font-extrabold ${dm.heading}`}>₹{item.price}</p>
                      <p className={`text-sm ${dm.sub}`}>
                        Condition:{" "}
                        <span className={`font-semibold ${dm.heading}`}>{item.age}</span>
                      </p>
                    </div>

                    <p className={`text-sm leading-7 ${dm.sub}`}>
                      {item.description || "No description available."}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => handleAddToCart(item._id || item.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B6B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e55a5a]"
                      >
                        <i className="fas fa-cart-plus" />
                        {cartMsg[item._id || item.id] || "Add to cart"}
                      </button>
                      <button
                        onClick={() => navigate(`/buy/${item._id || item.id}`)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A2556] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3a6b]"
                      >
                        <i className="fas fa-bolt" />
                        Buy now
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  );
}