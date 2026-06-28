import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getItemById, placeOrder } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ConfirmOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    contactno: "",
    address: "",
    paymentMethod: "cod",
  });

  const dm = {
    page: darkMode
      ? "bg-[#0f1220] text-[#e8ecff]"
      : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode
      ? "bg-[#1e2444] border-[#2a3060]"
      : "bg-[#F8F9FF] border-[#D7DBFF]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F9FF] border-[#D7DBFF] text-[#1A2556] placeholder-[#9aa3c9] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    radio: darkMode
      ? "border-[#2a3060] bg-[#1e2444] hover:border-[#FF6B6B]"
      : "border-[#D7DBFF] bg-[#F8F9FF] hover:border-[#1A2556]",
    radioActive: darkMode
      ? "border-[#FF6B6B] bg-[#2a1a2a]"
      : "border-[#1A2556] bg-[#F0F2FF]",
    errBox: darkMode
      ? "bg-[#3d1a1a] border-[#FF6B6B] text-[#FF6B6B]"
      : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
    totalBox: darkMode
      ? "bg-[#1e2444]"
      : "bg-white",
  };

  const inputClass = [
    "mt-2 w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4",
    dm.input,
  ].join(" ");

  useEffect(() => {
    getItemById(id)
      .then((res) => {
        setItem(res.data.itemDetails);
        const u = res.data.userData || {};
        setFormData((prev) => ({
          ...prev,
          name: u.name || "",
          contactno: u.contactno || "",
          address: u.address || "",
        }));
      })
      .catch((err) => console.error("Failed to load item:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await placeOrder(id, { ...formData, itemId: id });
      navigate("/orders");
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
        <Navbar section="Checkout" />
        <div className="flex flex-col gap-4 max-w-5xl mx-auto px-4 py-12">
          {[1, 2].map((n) => (
            <div key={n} className={`rounded-[32px] border p-8 animate-pulse h-40 ${dm.card}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Checkout" />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">

        <section className={`space-y-4 rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>
          <div className="space-y-2 text-center">
            <p className={`text-sm uppercase tracking-[0.25em] ${dm.sub}`}>Checkout</p>
            <h1 className={`text-4xl font-extrabold ${dm.heading}`}>Confirm Your Order</h1>
            <p className={`mx-auto max-w-2xl ${dm.sub}`}>
              Review the item details and delivery information before completing your purchase.
            </p>
          </div>

          {item && (
            <div className={`flex flex-col gap-6 rounded-[28px] border p-6 md:flex-row md:items-center md:justify-between ${dm.inner}`}>
              <div>
                <p className={`text-xl font-semibold ${dm.heading}`}>{item.name || item.section}</p>
                <p className={`mt-2 text-lg font-semibold ${dm.heading}`}>₹{item.price}</p>
              </div>
              <div className={`rounded-[24px] px-5 py-4 shadow-sm ${dm.totalBox}`}>
                <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Total</p>
                <p className={`mt-2 text-3xl font-extrabold ${dm.heading}`}>₹{item.price}</p>
              </div>
            </div>
          )}
        </section>

        <section className={`rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>

          {error && (
            <div className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${dm.errBox}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="space-y-4">
              <div className="space-y-1">
                <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Delivery details</p>
                <p className={`text-sm ${dm.sub}`}>
                  Pre-filled from your account — edit if delivering elsewhere.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className={`block text-sm font-semibold ${dm.sub}`}>
                  Full name
                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>
                <label className={`block text-sm font-semibold ${dm.sub}`}>
                  Mobile number
                  <input
                    type="tel"
                    name="contactno"
                    required
                    value={formData.contactno}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>
              </div>

              <label className={`block text-sm font-semibold ${dm.sub}`}>
                Delivery address
                <textarea
                  name="address"
                  rows={4}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="space-y-4">
              <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Payment method</p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { value: "cod", title: "Cash on delivery", sub: "Pay when your order arrives" },
                  { value: "online", title: "Online payment", sub: "UPI, cards, net banking" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`rounded-3xl border p-4 transition duration-200 cursor-pointer ${
                      formData.paymentMethod === opt.value ? dm.radioActive : dm.radio
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={formData.paymentMethod === opt.value}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 accent-[#1A2556]"
                      />
                      <div>
                        <p className={`font-semibold ${dm.heading}`}>{opt.title}</p>
                        <p className={`text-sm ${dm.sub}`}>{opt.sub}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#1A2556] px-6 py-4 text-lg font-semibold text-white transition duration-200 hover:bg-[#FF6B6B] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Placing order…" : "Confirm Order"}
            </button>

          </form>
        </section>

      </main>
    </div>
  );
}
