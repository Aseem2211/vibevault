import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getOrders, getBuyerRentOrders, cancelOrder, cancelRentOrder, deleteOrder, deleteRentOrder_history } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { darkMode } = useAuth();

  useEffect(() => {
    Promise.all([getOrders(), getBuyerRentOrders()])
      .then(([buyRes, rentRes]) => {
        const buy  = (buyRes.data.cohort  || []).map(o => ({ ...o, type: 'buy' }));
        const rent = rentRes.data.cohort || [];
        setOrders([...buy, ...rent]);
      })
      .finally(() => setLoading(false));
  }, []);

  const minutesLeft = (createdAt) => {
    if (!createdAt) return 0;
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor((20 * 60 * 1000 - elapsed) / 60000));
  };

  const cancellableStatus = (item) => item.type === 'rent' ? 'booked' : 'ordered';

  const canCancel = (item) =>
    item.orderStatus === cancellableStatus(item) && minutesLeft(item.createdAt) > 0;

  const canDelete = (item) => {
    if (item.type === 'rent') return item.orderStatus === 'cancelled';
    return item.orderStatus === 'delivered' || item.orderStatus === 'cancelled';
  };

  const handleCancel = async (item) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(item._id);
    try {
      if (item.type === 'rent') await cancelRentOrder(item._id);
      else await cancelOrder(item._id);
      setOrders(prev =>
        prev.map(o => o._id === item._id ? { ...o, orderStatus: 'cancelled' } : o)
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Remove this order from your history?")) return;
    setDeleting(item._id);
    try {
      if (item.type === 'rent') await deleteRentOrder_history(item._id);
      else await deleteOrder(item._id);
      setOrders(prev => prev.filter(o => o._id !== item._id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete order.");
    } finally {
      setDeleting(null);
    }
  };

  const dm = {
    page:  darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card:  darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F9FF] border-[#D7DBFF]",
    heading:darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dm.page}`}>
      <p className={`text-lg ${dm.sub}`}>Loading orders…</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Orders" />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className={`mb-10 rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>

          <div className="mb-6">
            <p className={`text-sm uppercase tracking-[0.3em] ${dm.sub}`}>Order history</p>
            <h1 className={`mt-3 text-4xl font-extrabold ${dm.heading}`}>Your Orders</h1>
            <p className={`mt-3 max-w-2xl ${dm.sub}`}>Review your purchases and track the status of each order.</p>
          </div>

          {orders.length === 0 ? (
            <div className={`rounded-[28px] border border-dashed p-10 text-center ${dm.inner}`}>
              <i className={`fas fa-box-open mb-4 text-4xl ${dm.heading}`} />
              <h2 className={`text-2xl font-semibold ${dm.heading}`}>No orders yet</h2>
              <p className={`mt-2 ${dm.sub}`}>Once you place an order, it will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {orders.map((item, i) => (
                <article
                  key={item._id || i}
                  className={`overflow-hidden rounded-[28px] border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${dm.inner}`}
                >
                  <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:gap-8">

                    <div className="relative h-56 w-full overflow-hidden rounded-[28px] md:h-48 md:w-48 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>
                            {item.type === 'rent' ? 'Rented' : 'Ordered'}
                          </p>
                          <h3 className={`mt-2 text-2xl font-semibold ${dm.heading}`}>{item.name}</h3>
                        </div>

                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                          item.orderStatus === 'cancelled'
                            ? 'bg-[#FFE5E5] text-[#FF4444]'
                            : item.orderStatus === 'delivered'
                              ? 'bg-[#E5FFE9] text-[#1A7A35]'
                              : item.type === 'rent'
                                ? 'bg-[#E5F0FF] text-[#4F6BFF]'
                                : 'bg-[#FFF3E5] text-[#B25B00]'
                        }`}>
                          {item.orderStatus === 'cancelled' ? 'Cancelled'
                            : item.orderStatus === 'delivered' ? 'Delivered'
                            : item.type === 'rent' ? 'Rented'
                            : 'Ordered'}
                        </span>
                      </div>

                      <p className={`leading-7 ${dm.sub}`}>
                        {item.section} • Condition:{" "}
                        <span className={`font-medium ${dm.heading}`}>{item.age}</span>
                      </p>

                      {item.type === 'rent' && item.rentEndDate && (
                        <p className={`text-sm ${dm.sub}`}>
                          Rent until:{" "}
                          <span className={`font-medium ${dm.heading}`}>
                            {new Date(item.rentEndDate).toLocaleDateString()}
                          </span>
                        </p>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className={`rounded-3xl p-4 shadow-sm border ${dm.card}`}>
                          <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Price</p>
                          <p className={`mt-2 text-xl font-semibold ${dm.heading}`}>₹{item.price}</p>
                        </div>
                        <div className={`rounded-3xl p-4 shadow-sm border ${dm.card}`}>
                          <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Status</p>
                          <p className={`mt-2 text-xl font-semibold ${dm.heading}`}>{item.orderStatus}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        
                        {item.orderStatus !== 'cancelled' && item.orderStatus !== 'delivered' && (
                          canCancel(item) ? (
                            <>
                              <button
                                onClick={() => handleCancel(item)}
                                disabled={cancelling === item._id}
                                className="rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-50 px-5 py-2 text-sm font-semibold text-white transition"
                              >
                                {cancelling === item._id ? "Cancelling…" : "Cancel Order"}
                              </button>
                              <span className={`text-xs ${dm.sub}`}>
                                {minutesLeft(item.createdAt)} min left to cancel
                              </span>
                            </>
                          ) : (
                            item.orderStatus === cancellableStatus(item) && (
                              <p className="text-xs text-red-400 font-medium">
                                Cancellation window expired
                              </p>
                            )
                          )
                        )}

                        
                        {canDelete(item) && (
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deleting === item._id}
                            className={`rounded-full border px-5 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                              darkMode
                                ? "border-[#2a3a55] text-gray-400 hover:border-red-400 hover:text-red-400"
                                : "border-[#D7DBFF] text-[#4F5B81] hover:border-red-400 hover:text-red-500"
                            }`}
                          >
                            {deleting === item._id ? "Removing…" : "Remove from history"}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
