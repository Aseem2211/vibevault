import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {getRentItemById,placeRentOrder} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ConfirmRental() {
  const { id } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { darkMode } = useAuth();

  const [itemDetails, setItemDetails] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState(null);
  const [userRole, setUserRole]       = useState(null);

  const [form, setForm] = useState({
    name: "", address: "", contactno: "",
    rentStartDate: "", rentEndDate: "",
    paymentMethod: "cod",
  });

  const dm = {
    page:    darkMode ? "bg-[#0f1420] text-white"     : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card:    darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    inner:   darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F9FF] border-[#D7DBFF]",
    heading: darkMode ? "text-white"                  : "text-[#1A2556]",
    sub:     darkMode ? "text-gray-400"               : "text-[#4F5B81]",
    input:   darkMode
      ? "bg-[#1a2235] border-[#2a3a55] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-white border-[#D7DBFF] text-[#1A2556] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    errBox:  darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4 ${dm.input}`;

  useEffect(() => {
    getRentItemById(id)
      .then((res) => {
        const { itemDetails, Data } = res.data;
        setItemDetails(itemDetails);
        setUserRole(Data?.role ?? null);

        // Admins should manage items, not rent them — redirect away
        if (Data?.role === "admin") {
          navigate("/rent-items", { replace: true });
          return;
        }

        setForm((prev) => ({
          ...prev,
          name:  Data?.name || "",
          address: Data?.address || "",
          contactno: Data?.contactno || "",
        }));
      })
      .catch(() => setError("Could not load rental details."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const calcTotal = () => {
    if (!itemDetails || !form.rentStartDate || !form.rentEndDate) return { type: "empty" };
    const start = new Date(form.rentStartDate);
    const end   = new Date(form.rentEndDate);
    if (end <= start) return { type: "error" };
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return { type: "valid", days, total: days * itemDetails.price };
  };
  const totalInfo = calcTotal();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalInfo.type !== "valid") { setError("Please select valid dates."); return; }
    setError(null);
    setSubmitting(true);
    try {
      await placeRentOrder({ ...form, itemId: id });
      navigate("/confirmation");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to place rental.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${dm.page}`}>
      <p className={`text-lg ${dm.sub}`}>Loading rental details…</p>
    </div>
  );

  if (error && !itemDetails) return (
    <div className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${dm.page}`}>
      <p className="text-[#FF6B6B]">{error}</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className={`mb-8 rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] backdrop-blur-xl ${dm.card}`}>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${dm.sub}`}>Rental checkout</p>
              <h1 className={`mt-2 text-4xl font-extrabold ${dm.heading}`}>Confirm your rental</h1>
              <p className={`mt-3 max-w-2xl ${dm.sub}`}>Review the item and complete your rental request.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFE5E5] px-4 py-2 text-sm font-semibold text-[#FF6B6B]">
              <i className="fas fa-clock" />
              Rent for ₹{itemDetails?.price}/day
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

        
            <div className={`overflow-hidden rounded-[28px] border shadow-sm ${dm.inner}`}>
              {itemDetails?.image
                ? <img src={itemDetails.image} alt={itemDetails.name} className="h-96 w-full object-cover" />
                : <div className={`flex h-96 items-center justify-center ${dm.sub}`}>No image available</div>
              }
              <div className="p-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className={`text-3xl font-semibold ${dm.heading}`}>{itemDetails?.name}</h2>
                  <span className="inline-flex items-center rounded-full bg-[#FFE5E5] px-4 py-2 text-sm font-semibold text-[#FF6B6B]">
                    <i className="fas fa-tag mr-2" />{itemDetails?.age}
                  </span>
                </div>
                <p className={`mb-4 leading-7 ${dm.sub}`}>
                  {itemDetails?.description || "No description available."}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Price", value: `₹${itemDetails?.price}`, sub: "per day" },
                    { label:"Category",value: itemDetails?.section },
                    { label: "Condition", value: itemDetails?.age },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className={`rounded-[24px] border p-4 shadow-sm ${dm.card}`}>
                      <p className={`text-xs uppercase tracking-[0.2em] ${dm.sub}`}>{label}</p>
                      <p className={`mt-2 text-lg font-semibold ${dm.heading}`}>{value}</p>
                      {sub && <p className={`text-sm ${dm.sub}`}>{sub}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            
            <div className={`rounded-[28px] border p-8 shadow-sm ${dm.inner}`}>
              <h3 className={`mb-6 text-2xl font-semibold ${dm.heading}`}>Your details</h3>

              {error && (
                <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${dm.errBox}`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { label: "Your Name",       name: "name",      type: "text" },
                  { label: "Address",         name: "address",   type: "text" },
                  { label: "Contact Number",  name: "contactno", type: "tel"  },
                ].map(({ label, name, type }) => (
                  <div key={name} className="space-y-2">
                    <label className={`block text-sm font-semibold ${dm.sub}`}>{label}</label>
                    <input type={type} name={name} required value={form[name]} onChange={handleChange} className={inputClass} />
                  </div>
                ))}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${dm.sub}`}>Rent From</label>
                    <input type="date" name="rentStartDate" required min={today} value={form.rentStartDate} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${dm.sub}`}>Rent Until</label>
                    <input type="date" name="rentEndDate" required min={form.rentStartDate || today} value={form.rentEndDate} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${dm.sub}`}>Payment Method</label>
                  <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={inputClass}>
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div className={`rounded-3xl border p-5 text-sm font-medium shadow-sm ${dm.card}`}>
                  {totalInfo.type === "valid" &&
                    <span className={dm.heading}>{totalInfo.days} day(s) × ₹{itemDetails?.price}/day = <strong>₹{totalInfo.total}</strong></span>}
                  {totalInfo.type === "error" &&
                    <span className="text-[#FF6B6B]">⚠️ End date must be after start date</span>}
                  {totalInfo.type === "empty" &&
                    <span className={dm.sub}>Select dates to calculate total</span>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-[#1A2556] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#2f3a6b] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Confirming…" : "Confirm Rental"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
