import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getEditItem, updateItem } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["assignment", "furniture", "appliance", "book", "stationary", "snacks"];

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [formData, setFormData] = useState({
    section: "",
    name: "",
    price: "",
    age: "New",
    description: "",
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const dm = {
    page: darkMode
      ? "bg-[#0f1220] text-[#e8ecff]"
      : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
    header: darkMode
      ? "bg-[#1e2444] rounded-t-[40px]"
      : "bg-[#F8F6FF] rounded-t-[40px]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    label: darkMode ? "text-[#8892be]" : "text-[#1A2556]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10",
    errBox: darkMode
      ? "bg-[#3d1a1a] border-[#FF6B6B] text-[#FF6B6B]"
      : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
    cancelBtn: darkMode
      ? "border-[#2a3060] bg-[#1e2444] text-[#e8ecff] hover:bg-[#2a3060]"
      : "border-[#E0E4FF] bg-[#F8F6FF] text-[#1A2556] hover:bg-[#E0E4FF]",
  };

  const inputClass = [
    "w-full rounded-3xl border px-4 py-4 outline-none transition focus:ring-4",
    dm.input,
  ].join(" ");

  useEffect(() => {
    getEditItem(id)
      .then((res) => {
        const item = res.data.item;
        setFormData({
          section: item.section || "",
          name: item.name || "",
          price: item.price || "",
          age: item.age || "New",
          description: item.description || "",
        });
        setCurrentImage(item.image || null);
      })
      .catch((err) => console.error("Failed to load item:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setNewImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      if (newImageFile) data.append("image", newImageFile);
      await updateItem(id, data);
      navigate(-1);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
        <Navbar section="Admin" />
        <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 py-10">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`rounded-2xl border p-6 animate-pulse h-20 ${dm.card}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Admin" />

      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className={`w-full max-w-3xl rounded-[40px] border shadow-2xl ${dm.card}`}>

          <div className={`px-6 py-8 text-center ${dm.header}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B6B]">Admin Panel</p>
            <h1 className={`mt-4 text-4xl font-extrabold ${dm.heading}`}>Edit Item</h1>
            <p className={`mt-3 ${dm.sub}`}>Update the details below and save.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8">

            {error && (
              <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${dm.errBox}`}>
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>Category</label>
              <select
                name="section"
                required
                value={formData.section}
                onChange={handleChange}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>
                New Image{" "}
                <span className={`font-normal ${dm.sub}`}>(leave blank to keep current)</span>
              </label>
              {(newImagePreview || currentImage) && (
                <img
                  src={newImagePreview || currentImage}
                  alt="Item preview"
                  className="h-32 rounded-2xl object-cover mb-3"
                />
              )}
              <input
                type="file"
                name="image"
                accept="image/png,image/jpg,image/jpeg"
                onChange={handleImage}
                className={inputClass}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>Item name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>Condition</label>
              <select
                name="age"
                required
                value={formData.age}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="New">New</option>
                <option value="Old">Old</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>Description</label>
              <textarea
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-3xl bg-[#1A2556] px-5 py-4 text-white text-lg font-semibold transition hover:bg-[#FF6B6B] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`w-full inline-flex items-center justify-center rounded-3xl border px-5 py-4 text-lg font-semibold transition ${dm.cancelBtn}`}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
