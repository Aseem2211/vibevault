import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { addRentItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AddRentItem() {
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    age: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("age", formData.age);
      data.append("description", formData.description);
      if (imageFile) data.append("image", imageFile);
      await addRentItem(data);
      navigate("/admin/rent");
    } catch (err) {
      setError("Failed to add item. Please try again. " + (err?.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const dm = {
    page: darkMode
      ? "bg-[#0f1220] text-[#e8ecff]"
      : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white/95 border-[#E0E4FF]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    label: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F9FF] border-[#D7DBFF] text-[#1A2556] placeholder-[#9aa3c9] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    preview: darkMode
      ? "border-[#2a3060] bg-[#1e2444]"
      : "border-[#D7DBFF] bg-[#F8F9FF]",
    error: darkMode
      ? "bg-[#3d1a1a] text-[#FF6B6B]"
      : "bg-[#FFE5E5] text-[#FF6B6B]",
    btn: darkMode
      ? "bg-[#FF6B6B] hover:bg-[#e85555]"
      : "bg-[#1A2556] hover:bg-[#2f3a6b]",
  };

  const inputClass = [
    "w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4",
    dm.input,
  ].join(" ");

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Admin" />

      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-12">
        <section className={`rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>

          <header className="mb-8 space-y-3">
            <h1 className={`text-3xl font-extrabold tracking-tight ${dm.heading}`}>
              Register Item for Rent
            </h1>
            <p className={`max-w-2xl ${dm.sub}`}>
              Add a new rental item — it will be listed for rent across VibeVault.
            </p>
          </header>

          {error && (
            <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${dm.error}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-3">
              <label htmlFor="image" className={`block text-sm font-semibold ${dm.label}`}>
                Item Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/png,image/jpg,image/jpeg"
                required
                onChange={handleImage}
                className={inputClass}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={`w-full rounded-2xl border object-contain p-2 ${dm.preview}`}
                />
              )}
            </div>

            <div className="space-y-3">
              <label htmlFor="name" className={`block text-sm font-semibold ${dm.label}`}>
                Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Washing Machine"
                required
                minLength={2}
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label htmlFor="price" className={`block text-sm font-semibold ${dm.label}`}>
                  Rent Price (per day ₹)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="0"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="age" className={`block text-sm font-semibold ${dm.label}`}>
                  Condition
                </label>
                <select
                  id="age"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" disabled>Select condition</option>
                  <option value="New">New</option>
                  <option value="Old">Old</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="description" className={`block text-sm font-semibold ${dm.label}`}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Brief description of the item..."
                required
                value={formData.description}
                onChange={handleChange}
                className={`min-h-[140px] resize-y ${inputClass}`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-6 py-4 text-base font-semibold text-white transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${dm.btn}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
                </span>
              ) : (
                "List for Rent"
              )}
            </button>

          </form>
        </section>
      </main>
    </div>
  );
}
