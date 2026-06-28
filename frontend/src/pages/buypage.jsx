import { useEffect, useState } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getItemById, placeOrder } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BuyPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", contactno: "", paymentMethod: "COD" });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [qty,setQty]=useState(1);
  const [stock,setStock]=useState(null);
  const location=useLocation();
  const [selectedSize,setSelectedSize]=useState(location.state?.size??"");
  const dm = {
    page: darkMode ? "bg-[#0f1220] text-[#e8ecff]" : "bg-[#E6E6FA] text-[#1A2556]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    card: darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-white border-[#E0E4FF]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490]"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556]",
    btn: darkMode
      ? "bg-[#5b6af0] text-white hover:bg-[#6e7df5]"
      : "bg-[#1A2556] text-white hover:bg-[#2a3a7c]",
    badge: darkMode ? "bg-[#1e2444] text-[#8892be]" : "bg-[#F0EFFF] text-[#4F5B81]",
  };

  useEffect(() => {
    getItemById(itemId)
      .then((res) => {
        setData(res.data);
        setStock(res.data.itemDetails?.metadata?.stock??0);
        const u = res.data.Data;
        setForm({
          name: u.name ?? "",
          address: u.address ?? "",
          contactno: u.contactno ?? "",
          paymentMethod: "COD",
        });
      })
      .catch(() => setError("Failed to load details."))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.contactno) {
      setError("Please fill all fields.");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const res = await placeOrder(itemId, { ...form, itemId,quantity:qty,size:selectedSize||undefined});
      if (res.data.redirect) navigate(res.data.redirect);
    } catch(err) {
      console.log(err.response?.data);
      setError(err.response?.data?.message||"Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className={`mb-8 flex items-center gap-2 text-sm font-medium ${dm.sub} hover:opacity-80`}
        >
          <i className="ti ti-arrow-left" /> Back
        </button>

        {loading ? (
          <div className={`rounded-2xl border p-8 animate-pulse h-64 ${dm.card}`} />
        ) : error && !data ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className={`rounded-2xl border p-7 ${dm.card}`}>
            <div className="flex gap-4 mb-7 items-center">
              {data.itemDetails.image && (
                <img
                  src={data.itemDetails.image}
                  alt={data.itemDetails.title}
                  className="w-20 h-20 object-cover rounded-xl"
                />
              )}
              <div>
                <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${dm.badge}`}>
                  {data.itemDetails.section ?? "Item"}
                </span>
                <h2 className={`text-xl font-extrabold mt-1 ${dm.heading}`}>{data.itemDetails.title}</h2>
                <p className={`text-2xl font-bold mt-1 ${dm.heading}`}>₹{data.itemDetails.price}</p>
              </div>
            </div>

            <h3 className={`text-lg font-bold mb-4 ${dm.heading}`}>Delivery Details</h3>
            <p className={`text-sm mb-5 ${dm.sub}`}>Your saved details are pre-filled. Edit if needed.</p>
            {stock !== null && (
              <div>
                <label className={`text-sm font-medium block mb-1 ${dm.sub}`}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg"
                  >−</button>
                  <input
                    type="number" min={1} max={stock} value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(stock, Number(e.target.value))))}
                    className={`w-16 text-center rounded-xl border px-2 py-2 text-sm outline-none ${dm.input}`}
                  />
                  <button
                    onClick={() => setQty(q => Math.min(stock, q + 1))}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg"
                  >+</button>
                  <span className={`text-xs ${dm.sub}`}>{stock} available</span>
                </div>
              </div>
            )}
            {data?.itemDetails?.section === "clothes" && (
              <div className="mb-2">
                <label className={`text-sm font-medium block mb-1 ${dm.sub}`}>Size</label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize((prev) => (prev === s ? "" : s))}
                      className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200
                        ${selectedSize === s
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : darkMode
                            ? "bg-[#1e2444] border-[#2a3060] text-[#c0caff] hover:bg-[#2a3060]"
                            : "bg-[#F0EFFF] border-[#E0E4FF] text-[#4F5B81] hover:bg-[#e4e2ff]"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="mt-2 text-xs font-medium text-indigo-400">Selected: {selectedSize}</p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-4">
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "Enter your name" },
                { label: "Address", name: "address", type: "text", placeholder: "Enter delivery address" },
                { label: "Contact No.", name: "contactno", type: "tel", placeholder: "Enter contact number" },
              ].map((f) => (
                <div key={f.name}>
                  <label className={`text-sm font-medium block mb-1 ${dm.sub}`}>{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${dm.input}`}
                  />
                </div>
              ))}

              <div>
                <label className={`text-sm font-medium block mb-1 ${dm.sub}`}>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${dm.input}`}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={placing}
              className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150 ${dm.btn} disabled:opacity-50`}
            >
              {placing ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}