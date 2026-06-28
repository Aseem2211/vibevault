import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { addRentItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function RegisterRentForm() {
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F9FF] border-[#D7DBFF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1a2235] border-[#2a3a55] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-white border-[#D7DBFF] text-[#1A2556] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  const inputClass = `w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4 ${dm.input}`;

  const [form, setForm] = useState({
    name: "", description: "", price: "", age: "", section: "",
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append("image", image);
      await addRentItem(formData);
      navigate("/seller/rent");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to register item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className={`rounded-[32px] border p-10 shadow-xl ${dm.card}`}>
          <p className={`text-sm uppercase tracking-[0.3em] ${dm.sub}`}>Admin</p>
          <h1 className={`mt-2 text-3xl font-extrabold ${dm.heading}`}>List a Rent Item</h1>
          <p className={`mt-2 ${dm.sub}`}>Fill in the details to list a new rental item.</p>

          {error && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${dm.errBox}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {[
              { label: "Item Name",name:"name", type: "text" },
              { label: "Price/day",name:"price", type:"number" },
              { label: "Age/Condition",name: "age", type:"text" },
              { label: "Category", name:"section", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="space-y-2">
                <label className={`block text-sm font-semibold ${dm.sub}`}>{label}</label>
                <input
                  type={type}
                  name={name}
                  required
                  value={form[name]}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${dm.sub}`}>Description</label>
              <textarea
                name="description"
                rows={4}
                required
                value={form.description}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${dm.sub}`}>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#1A2556] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#2f3a6b] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Listing…" : "List Item"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
