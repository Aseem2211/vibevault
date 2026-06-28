import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRentItems, deleteRentItem, addRentItem, updateRentItem } from "../services/sellerService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const EMPTY_FORM = { name: "", price: "", age: "New", section: "", description: "" };

export default function RentItems({ initialItems, user: initialUser }) {
  const [items, setItems] = useState(initialItems ?? []);
  const [user, setUser] = useState(initialUser ?? null);
  const [loading, setLoading] = useState(!initialItems);
  const [deleteError, setDeleteError] = useState("");
  const { darkMode, role } = useAuth();
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const isAdmin = role === "admin";
  const isUser = role === "user";

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F9FF] border-[#E7E8FF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#5C6D99]",
    input: darkMode ? "bg-[#1a2235] border-[#2a3a55] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10" : "bg-white border-[#D7DBFF] text-[#1A2556] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  const inputCls = `w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-2 ${dm.input}`;

  useEffect(() => {
    if (initialItems) return;
    (async () => {
      try {
        const data = await getRentItems();
        setItems(data.myItem ?? []);
        setUser(data.user ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [initialItems]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteRentItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      setDeleteError("Failed to delete item. Please try again.");
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setItemForm(EMPTY_FORM);
    setImageFile(null);
    setFormError("");
    setShowAddForm(true);
  };

  const openEdit = (item) => {
    navigate(`/rent/edit/${item._id}`);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setItemForm(EMPTY_FORM);
    setFormError("");
  };

  const handleFormChange = (e) => setItemForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { setFormError("Please upload an image."); return; }
    setFormError("");
    setFormLoading(true);
    try {
      const fd = new FormData();
      Object.entries(itemForm).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", imageFile);
      await addRentItem(fd);
      const fresh = await getRentItems();
      setItems(fresh.myItem ?? []);
      closeForm();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to save item.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return (
    <main className={`mx-auto w-full max-w-6xl px-4 py-10 min-h-screen ${dm.page}`}>
      <p className={`text-center ${dm.sub}`}>Loading…</p>
    </main>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />
      <main className={`mx-auto w-full max-w-6xl px-4 py-10 transition-colors duration-300 ${dm.page}`}>
        <section className={`mb-10 rounded-[32px] border p-8 shadow-[0_32px_80px_rgba(26,37,86,0.08)] ${dm.card}`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`mb-3 text-sm uppercase tracking-[0.25em] ${dm.sub}`}>
                {isAdmin ? "Admin dashboard" : "Rental store"}
              </p>
              <h1 className={`text-4xl font-extrabold ${dm.heading}`}>
                {isAdmin ? "Manage rental items" : "Browse rentals"}
              </h1>
              <p className={`mt-3 max-w-2xl ${dm.sub}`}>
                {isAdmin ? "Add, edit, or remove rental listings." : "Find something to rent for your needs."}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={openAdd}
                className="inline-flex items-center justify-center rounded-2xl bg-[#1A2556] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3a6b]"
              >
                + Add new item
              </button>
            )}
          </div>
        </section>

        {isAdmin && showAddForm && (
          <section className={`mb-8 rounded-[32px] border p-8 shadow-sm ${dm.card}`}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${dm.heading}`}>Add new item</h2>
              <button onClick={closeForm} className={`text-sm font-semibold ${dm.sub} hover:opacity-70`}>
                ✕ Cancel
              </button>
            </div>
            {formError && (
              <div className={`mb-4 rounded-xl border p-3 text-sm ${dm.errBox}`}>{formError}</div>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${dm.sub}`}>Item name</label>
                  <input type="text" name="name" required value={itemForm.name} onChange={handleFormChange} className={inputCls} placeholder="e.g. Camping tent" />
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${dm.sub}`}>Price per day (₹)</label>
                  <input type="number" name="price" required min="0" value={itemForm.price} onChange={handleFormChange} className={inputCls} placeholder="e.g. 150" />
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${dm.sub}`}>Condition</label>
                  <select name="age" value={itemForm.age} onChange={handleFormChange} className={inputCls}>
                    <option value="New">New</option>
                    <option value="Old">Old</option>
                  </select>
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-semibold ${dm.sub}`}>Category</label>
                  <input type="text" name="section" value={itemForm.section} onChange={handleFormChange} className={inputCls} placeholder="e.g. Outdoor" />
                </div>
              </div>
              <div>
                <label className={`mb-2 block text-sm font-semibold ${dm.sub}`}>Description</label>
                <textarea name="description" rows={3} value={itemForm.description} onChange={handleFormChange} className={inputCls} placeholder="Short description…" />
              </div>
              <div>
                <label className={`mb-2 block text-sm font-semibold ${dm.sub}`}>Upload image</label>
                <input type="file" accept="image/png,image/jpg,image/jpeg" required onChange={(e) => setImageFile(e.target.files[0] ?? null)} className={inputCls} />
              </div>
              <button type="submit" disabled={formLoading} className="w-full rounded-2xl bg-[#1A2556] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#2f3a6b] disabled:opacity-60">
                {formLoading ? "Saving…" : "Add item"}
              </button>
            </form>
          </section>
        )}

        {deleteError && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm ${dm.errBox}`}>{deleteError}</div>
        )}

        {items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item) => (
              <article key={item._id} className={`overflow-hidden rounded-[28px] border shadow-sm transition hover:-translate-y-1 hover:shadow-md md:grid md:grid-cols-[280px_1fr] md:gap-6 ${dm.inner}`}>
                <div className="relative h-72 md:h-auto">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className={`flex h-full items-center justify-center ${dm.sub}`}>No image</div>
                  )}
                </div>
                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#EDE6FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5B4CAB]">
                        For Rent
                      </span>
                      <span className="rounded-full bg-[rgba(102,126,234,0.12)] px-3 py-1 text-sm font-semibold text-[#3345A7]">
                        {item.age}
                      </span>
                      {isAdmin && (
                        <span className="rounded-full bg-[#FFF3CD] px-3 py-1 text-xs font-semibold text-[#856404]">
                          Admin view
                        </span>
                      )}
                    </div>
                    <h2 className={`mt-4 text-3xl font-extrabold ${dm.heading}`}>{item.name}</h2>
                    <p className={`mt-4 max-w-2xl text-base leading-7 ${dm.sub}`}>
                      {item.description ? item.description.substring(0, 140) + (item.description.length > 140 ? "…" : "") : "No description provided yet."}
                    </p>
                  </div>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className={`text-sm uppercase tracking-[0.2em] ${dm.sub}`}>Daily rent</p>
                      <p className="mt-2 text-3xl font-bold text-[#3E4DBC]">₹{item.price}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {isUser && (
                        <Link to={`/confirm-rent/${item._id}`} className="inline-flex items-center justify-center rounded-2xl bg-[#4F5BFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3C4AD6]">
                          Rent Now
                        </Link>
                      )}
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(item)} className="inline-flex items-center justify-center rounded-2xl bg-[#FFB7D6] px-6 py-3 text-sm font-semibold text-[#7F1D78] transition hover:bg-[#ff9fca]">
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="inline-flex items-center justify-center rounded-2xl bg-[#FF6363] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e23d3d]">
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {!user && !isAdmin && (
                        <Link to="/login" className={`rounded-2xl border px-4 py-2 text-sm font-medium transition hover:opacity-70 ${dm.card} ${dm.sub}`}>
                          Sign in to rent
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`rounded-[28px] border p-12 text-center shadow-sm ${dm.card}`}>
            <p className={`text-2xl font-semibold ${dm.heading}`}>
              {isAdmin ? "No items listed yet." : "No rental items available yet."}
            </p>
            <p className={`mt-4 ${dm.sub}`}>
              {isAdmin ? "Click \"Add new item\" above to list your first rental." : "Check back soon for available rentals."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
