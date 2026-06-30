
import { useState, useEffect } from "react";
import { getSellerOrders, updateOrderStatus, updateRentOrderStatus } from "../services/sellerService";
import { useAuth } from "../context/AuthContext";
import { getSellerRentOrders } from "../services/api";
import Navbar from "../components/Navbar";
export default function SellerOrders() {
  const { darkMode } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white":"bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]":"bg-white border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]":"bg-[#F8F6FF] border-[#E0E4FF]",
    heading: darkMode ? "text-white" :"text-[#1A2556]",
    sub:  darkMode ? "text-gray-400" :"text-[#4F5B81]",
    errBox:darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]":"bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  useEffect(() => {
    Promise.all([getSellerOrders(), getSellerRentOrders()])
      .then(([sellRes, rentRes]) => {
        const sell = (sellRes.orders ?? []).map(o => ({ ...o, type: 'sell' }));
        const rent = (rentRes.data.cohort ?? []);
        setOrders([...sell, ...rent]);
      })
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    try {
      if (order.type === 'rent') {
        await updateRentOrderStatus(order._id, newStatus);
      } else {
        await updateOrderStatus(order._id, newStatus);
      }
      setOrders(prev =>
        prev.map(o => o._id === order._id ? { ...o, orderStatus: newStatus } : o)
      );
    } catch {
      setError("Failed to update status.");
    }
  };

  const statusColor = (status) => {
    if (status === "delivered") return "bg-green-500";
    if (status === "cancelled") return "bg-[#FF6B6B]";
    return "bg-[#1A2556]";
  };

  return (
    <>
    <Navbar/>
    <main className={`flex min-h-screen flex-col items-center px-4 py-10 ${dm.page}`}>
      
    
      <div className="w-full max-w-4xl">
        <h1 className={`mb-8 text-4xl font-extrabold ${dm.heading}`}>My received orders</h1>

        {error && (
          <div className={`mb-4 rounded-2xl border p-4 text-sm ${dm.errBox}`}>{error}</div>
        )}

        {loading ? (
          <p className={dm.sub}>Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className={`rounded-[32px] border border-dashed p-10 text-center ${dm.inner}`}>
            <p className={`text-lg font-medium ${dm.sub}`}>No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <article key={order._id} className={`rounded-[32px] border p-6 shadow-sm ${dm.card}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xl font-bold ${dm.heading}`}>
                        {order.itemName}
                      </h3>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        order.type === 'rent'
                          ? 'bg-[#E5F0FF] text-[#4F6BFF]'
                          : 'bg-[#FFE5E5] text-[#FF6B6B]'
                      }`}>
                        {order.type === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    </div>
                    {order.type === 'rent'
                      ? <p className={`text-sm ${dm.sub}`}>
                          Rent until: {new Date(order.rentEndDate).toLocaleDateString()}
                        </p>
                      : <p className={`text-sm ${dm.sub}`}>
                          ₹{order.itemPrice} · Qty: {order.quantity}
                        </p>
                    }
                  </div>
                  <span className={`self-start rounded-full px-4 py-1 text-sm font-semibold text-white ${statusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className={`mt-4 rounded-2xl border p-4 text-sm space-y-1 ${dm.inner}`}>
                  <p>
                    <span className={`font-semibold ${dm.heading}`}>Buyer: </span>
                    <span className={dm.sub}>
                      {order.buyerName ?? order.name} ({order.buyerEmail ?? ''})
                    </span>
                  </p>
                  <p>
                    <span className={`font-semibold ${dm.heading}`}>Address: </span>
                    <span className={dm.sub}>{order.address}</span>
                  </p>
                  <p>
                    <span className={`font-semibold ${dm.heading}`}>Contact: </span>
                    <span className={dm.sub}>{order.contactno}</span>
                  </p>
                  <p>
                    <span className={`font-semibold ${dm.heading}`}>Payment: </span>
                    <span className={dm.sub}>{order.paymentMethod?.toUpperCase()}</span>
                  </p>
                  <p>
                    <span className={`font-semibold ${dm.heading}`}>Ordered on: </span>
                    <span className={dm.sub}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                
                <div className="mt-4 flex flex-wrap gap-3">
                  {(order.type === 'rent'
                    ? ['booked', 'cancelled']
                    : ['ordered', 'delivered', 'cancelled']
                  ).map(status => (
                    <button
                      key={status}
                      disabled={order.orderStatus === status}
                      onClick={() => handleStatusChange(order, status)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40 ${statusColor(status)}`}
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  </>
  );
}