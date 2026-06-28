import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listSellItem, deleteSellItem, getSellItemOrderDetails, getSellItems, updateSellItem } from "../services/sellerService";
import { useAuth } from "../context/AuthContext";

export default function SellerDashboard({ myItem: initialItems = [] }) {
  const navigate = useNavigate();
  const { darkMode , role } = useAuth();
  const isAdmin=(role==="admin");
  const [form, setForm] = useState({ section: "", name: "", price: "", age: "",stock:1, description: "" ,size:""});
  const [imageFile, setImageFile] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [deleteError, setDeleteError] = useState("");
  console.log("isAdmin:",isAdmin);
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F6FF] border-[#E0E4FF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1a2235] border-[#2a3a55] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556] focus:border-[#FF6B6B] focus:ring-[#FFE5E5]",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  const inputCls = `w-full rounded-3xl border px-4 py-4 outline-none transition focus:ring-2 ${dm.input}`;

  useEffect(() => {
    getSellItems()
      .then(data => setItems(data.myItem ?? []))
      .catch(err => console.error("Failed to load items:", err));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
 
    e.preventDefault();
    if (!imageFile) { setSubmitError("Please upload an image."); return; }
    setSubmitError("");
    setSubmitLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", imageFile);
      
      const metadata={stock:Number(form.stock)};
      if (form.section==='clothes'){
        metadata.size=form.size;
        fd.append('metadata',JSON.stringify(metadata));
      }
      const data = await listSellItem(fd);
      
      const newItem = data?.item ?? {
        _id: Date.now().toString(),
        ...form,
        image: URL.createObjectURL(imageFile),
        createdAt: new Date().toISOString(),
        status: false,
      };
      setItems((prev) => [newItem, ...prev]);

      setForm({ section: "", name: "", price: "", age: "",stock:1,description: "",size:"" });
      setImageFile(null);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Failed to submit item.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteSellItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch {
      setDeleteError("Failed to delete item.");
    }
  };

  const handleOrderDetails = async (id) => {
    try {
      await getSellItemOrderDetails(id);
      navigate(`/seedetails/${id}`);
    } catch {
      setDeleteError("Could not fetch order details.");
    }
  };


  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      price: item.price,
      description: item.description,
      age: item.age,
    });
  };

  const handleEditChange = (e) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (id) => {
    try {
      const data = await updateSellItem(id, editForm);
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, ...(data?.item ?? editForm) } : i))
      );
      setEditingId(null);
    } catch {
      setDeleteError("Failed to update item.");
    }
  };

  const handleCancelEdit = () => setEditingId(null);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-start px-4 py-10 transition-colors duration-300 ${dm.page}`}>

      <div className={`w-full max-w-3xl rounded-[40px] border shadow-2xl ${dm.card}`}>
        <div className={`rounded-t-[40px] px-6 py-8 text-center ${dm.inner}`}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B6B]">Seller dashboard</p>
          <h1 className={`mt-4 text-4xl font-extrabold ${dm.heading}`}>List your item</h1>
          <p className={`mt-3 ${dm.sub}`}>Easily upload products and share them with VibeVault buyers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8">
          {submitError && (
            <div className={`rounded-2xl border p-4 text-sm ${dm.errBox}`}>{submitError}</div>
          )}

          <div>
            <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Choose category</label>
            <select name="section" value={form.section} onChange={handleChange} required className={inputCls}>
              <option value="" disabled>Please select</option>
              <option value="assignment">Assignment</option>
              <option value="furniture">Furniture</option>
              <option value="appliance">Appliance</option>
              <option value="book">Books</option>
              {isAdmin && (
                <>
                  <option value="stationary">Stationary</option>
                  <option value="snacks">Snacks</option>
                  <option value="clothes">Clothes</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Upload image</label>
            <input type="file" accept="image/png,image/jpg,image/jpeg" required onChange={(e) => setImageFile(e.target.files[0] ?? null)} className={inputCls} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Item name</label>
              <input type="text" name="name" placeholder="Name or brand" value={form.name} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Price</label>
              <input type="number" name="price" placeholder="Enter price" min="0" max="10000" value={form.price} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Product age</label>
            <select name="age" value={form.age} onChange={handleChange} required className={inputCls}>
              <option value="" disabled>Please select</option>
              <option value="New">New</option>
              <option value="Old">Old</option>
            </select>
          </div>
          <div>
            <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Stock quantity</label>
            <input type="number" name="stock" min="1" value={form.stock ?? 1} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Description</label>
            <textarea name="description" rows={5} placeholder="Write a short description…" value={form.description} onChange={handleChange} required className={inputCls} />
          </div>
          {form.section === 'clothes' && (
            <div>
              <label className={`mb-2 block text-sm font-semibold ${dm.heading}`}>Size</label>
              <select name="size" value={form.size ?? ''} onChange={handleChange} required className={inputCls}>
                <option value="" disabled>Select size</option>
                {['XS','S','M','L','XL','XXL'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
          <button type="submit" disabled={submitLoading} className="w-full rounded-3xl bg-[#1A2556] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#2f3a6b] disabled:opacity-60">
            {submitLoading ? "Submitting…" : "Submit item"}
          </button>
        </form>
      </div>

      <div className="mt-10 w-full max-w-5xl px-4 pb-12 lg:px-0">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className={`text-3xl font-bold ${dm.heading}`}>My Listed Items</h2>
          <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold border ${dm.inner} ${dm.heading}`}>
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {deleteError && (
          <div className={`mb-4 rounded-2xl border p-4 text-sm ${dm.errBox}`}>{deleteError}</div>
        )}

        {items.length === 0 ? (
          <div className={`rounded-[32px] border border-dashed p-10 text-center shadow-sm ${dm.inner}`}>
            <p className={`text-lg font-medium ${dm.sub}`}>No products added yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <article key={item._id} className={`grid gap-6 rounded-[32px] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md lg:grid-cols-[220px_1fr] ${dm.card}`}>

                <div className={`flex items-center justify-center overflow-hidden rounded-[28px] p-4 ${dm.inner}`}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-40 w-40 rounded-3xl object-cover" />
                  ) : (
                    <div className={`flex h-40 w-40 items-center justify-center rounded-3xl ${dm.inner}`}>
                      <i className={`fas fa-box-open text-4xl ${dm.sub}`} />
                    </div>
                  )}
                </div>

                <div className="grid gap-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className={`text-xs uppercase tracking-[0.24em] ${dm.sub}`}>Category</p>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${dm.inner} ${dm.heading}`}>
                        {item.section}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {editingId === item._id ? (
                        <select name="age" value={editForm.age} onChange={handleEditChange} className={`rounded-full border px-3 py-1 text-sm ${dm.input}`}>
                          <option value="New">New</option>
                          <option value="Old">Old</option>
                        </select>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-sm border ${dm.inner} ${dm.sub}`}>Age: {item.age}</span>
                      )}
                      {editingId === item._id ? (
                        <input type="number" name="price" value={editForm.price} onChange={handleEditChange} min="0" max="10000" className={`rounded-full border px-3 py-1 text-sm w-24 ${dm.input}`} />
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-sm border ${dm.inner} ${dm.sub}`}>₹{item.price}</span>
                      )}
                    </div>
                  </div>

                  {item.status ? (
                    <button onClick={() => handleOrderDetails(item._id)} className="inline-flex items-center gap-2 self-start rounded-full bg-[#1A2556] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3a6b]">
                      Order details
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#FF6B6B] px-5 py-3 text-sm font-semibold text-white">
                      Listed
                    </span>
                  )}

                  <div className="min-w-0">
                    {editingId === item._id ? (
                      <>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className={`${inputCls} mb-3 text-xl font-bold`}
                        />
                        <textarea
                          name="description"
                          rows={3}
                          value={editForm.description}
                          onChange={handleEditChange}
                          className={inputCls}
                        />
                      </>
                    ) : (
                      <>
                        <h3 className={`text-2xl font-bold ${dm.heading}`}>{item.name}</h3>
                        <p className={`mt-3 ${dm.sub}`}>{item.description ?? "No description available yet."}</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${dm.heading}`}>Listed on</p>
                      <p className={`text-sm ${dm.sub}`}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:self-auto self-start">
                      {editingId === item._id ? (
                        <>
                          <button onClick={() => handleSave(item._id)} className="inline-flex items-center gap-2 rounded-full bg-[#1A2556] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3a6b]">
                            <i className="fas fa-check" /> Save
                          </button>
                          <button onClick={handleCancelEdit} className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:opacity-70">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleEdit(item)} className="inline-flex items-center gap-2 rounded-full bg-[#1A2556] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3a6b]">
                          <i className="fas fa-pen" /> Edit
                        </button>
                      )}
                      <button onClick={() => handleDelete(item._id)} className="inline-flex items-center gap-2 rounded-full bg-[#FF6B6B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e55a5a]">
                        <i className="fas fa-trash-alt" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
