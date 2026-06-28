import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { editRentItem } from "../services/sellerService";
import { getRentItemById } from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function EditRentItem({ itemDetails: initialDetails }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [form, setForm] = useState({
    name: initialDetails?.name ?? "",
    price: initialDetails?.price ?? "",
    age: initialDetails?.age ?? "New",
    description: initialDetails?.description ?? "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(initialDetails?.image ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!initialDetails);

  useEffect(() => {
    if (initialDetails) return;
    getRentItemById(id)
      .then(res => {
        const d = res.data.itemDetails;
        setForm({
          name: d?.name ?? "",
          price: d?.price ?? "",
          age: d?.age ?? "New",
          description: d?.description ?? "",
        });
        setPreviewSrc(d?.image ?? "");
      })
      .catch(() => setError("Failed to load item."))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const dm = {
    page: darkMode ? "bg-[#0f1220] text-[#e8ecff]" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode ? "bg-[#1e2444] border-[#2a3060]" : "bg-[#F8F9FF] border-[#D7DBFF]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    label: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    input: darkMode ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10" : "bg-white border-[#D7DBFF] text-[#1A2556] placeholder-[#9aa3c9] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    preview: darkMode ? "bg-[#1e2444] border-[#2a3060]" : "bg-[#F8F9FF] border-[#D7DBFF]",
    previewInner: darkMode ? "bg-[#0f1220]" : "bg-white",
    errBox: darkMode ? "bg-[#3d1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
    cancelBtn: darkMode ? "border-[#2a3060] bg-[#1e2444] text-[#e8ecff] hover:bg-[#2a3060]" : "border-[#D7DBFF] bg-[#EBF0FF] text-[#1A2556] hover:bg-[#E0E4FF]",
  };

  const inputCls = `w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4 ${dm.input}`;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("age", form.age);
      fd.append("description", form.description);
      if (imageFile) fd.append("image", imageFile);
      await editRentItem(id, fd);
      navigate("/seller/rent");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className={`min-h-screen flex items-center justify-center ${dm.page}`}>
      <p className={dm.sub}>Loading…</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Seller" />
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-12">
        <section className={`rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.3em] ${dm.sub}`}>Rental item</p>
              <h1 className={`mt-2 text-4xl font-extrabold ${dm.heading}`}>Edit Rent Item</h1>
              <p className={`mt-3 max-w-2xl ${dm.sub}`}>Update your rental listing details below.</p>
            </div>
            <Link
              to="/seller/rent"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FFE5E5] px-5 py-3 text-sm font-semibold text-[#FF6B6B] transition hover:bg-[#ffd0d0] shrink-0"
            >
              <i className="fas fa-arrow-left" />
              Back to listings
            </Link>
          </div>

          {error && (
            <div className={`mb-6 rounded-2xl border p-4 text-sm ${dm.errBox}`}>{error}</div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={`rounded-[28px] border p-6 shadow-sm ${dm.preview}`}>
              <h2 className={`mb-4 text-2xl font-semibold ${dm.heading}`}>Current preview</h2>
              {previewSrc ? (
                <img src={previewSrc} alt="Preview" className={`h-80 w-full rounded-[24px] border object-cover ${dm.preview}`} />
              ) : (
                <div className={`flex h-80 items-center justify-center rounded-[24px] border ${dm.sub} ${dm.preview}`}>
                  No image uploaded
                </div>
              )}
              <div className={`mt-6 rounded-[24px] p-5 shadow-sm ${dm.previewInner}`}>
                <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Condition</p>
                <p className={`mt-2 text-lg font-semibold ${dm.heading}`}>{form.age}</p>
                <p className={`mt-5 text-sm ${dm.sub}`}>Rental price</p>
                <p className={`mt-2 text-3xl font-extrabold ${dm.heading}`}>₹{form.price || "—"}/day</p>
              </div>
            </div>

            <div className={`rounded-[28px] border p-8 shadow-sm ${dm.inner}`}>
              <h2 className={`mb-6 text-2xl font-semibold ${dm.heading}`}>Edit listing</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${dm.label}`}>Replace Image (optional)</label>
                  <input type="file" accept="image/png,image/jpg,image/jpeg" onChange={handleImageChange} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${dm.label}`}>Item Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required minLength={2} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${dm.label}`}>Rent Price (per day ₹)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange} min="0" required className={inputCls} />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${dm.label}`}>Condition</label>
                  <select name="age" value={form.age} onChange={handleChange} required className={inputCls}>
                    <option value="New">New</option>
                    <option value="Old">Old</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${dm.label}`}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required className={`${inputCls} min-h-[120px] resize-y`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    to="/seller/rent"
                    className={`inline-flex items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold transition ${dm.cancelBtn}`}
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#1A2556] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#FF6B6B] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
