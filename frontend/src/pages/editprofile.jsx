import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    contactno: "",
  });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

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
    errBox: darkMode
      ? "bg-[#3d1a1a] border-[#FF6B6B] text-[#FF6B6B]"
      : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
    cancelBtn: darkMode
      ? "bg-[#1e2444] text-[#e8ecff] hover:bg-[#FF6B6B] hover:text-white"
      : "bg-[#1A2556] text-white hover:bg-[#FF6B6B]",
  };

  const inputClass = [
    "w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4",
    dm.input,
  ].join(" ");

  useEffect(() => {
    getProfile()
      .then((res) => {
        const u = res.data.userdata;
        setFormData({
          name: u.name || "",
          email: u.email || "",
          address: u.address || "",
          contactno: u.contactno || "",
        });
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(formData);
      navigate("/profile");
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
        <Navbar section="Profile" />
        <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4 py-12">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`rounded-2xl border p-6 animate-pulse h-16 ${dm.card}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Profile" />

      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <section className={`rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>

          <div className="mb-8 space-y-3">
            <p className={`text-sm uppercase tracking-[0.25em] ${dm.sub}`}>Account</p>
            <h1 className={`text-4xl font-extrabold ${dm.heading}`}>Edit Profile</h1>
            <p className={`max-w-2xl ${dm.sub}`}>
              Update your personal details below.
            </p>
          </div>

          {error && (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${dm.errBox}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {[
              { name: "name", label: "Name", type: "text", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "address", label: "Address", type: "text", required: false },
              { name: "contactno", label: "Contact No", type: "text", required: false },
            ].map(({ name, label, type, required }) => (
              <div key={name} className="space-y-2">
                <label className={`block text-sm font-semibold ${dm.label}`}>{label}</label>
                <input
                  type={type}
                  name={name}
                  required={required}
                  value={formData[name]}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            ))}

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-[#FF6B6B] px-5 py-3 text-white font-semibold transition hover:bg-[#e85555] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <Link
                to="/profile"
                className={`flex-1 text-center rounded-2xl px-5 py-3 font-semibold transition ${dm.cancelBtn}`}
              >
                Cancel
              </Link>
            </div>

            <Link
              to="/changepassword"
              className="block text-center text-sm font-semibold text-[#1A2556] dark:text-[#8892be] hover:text-[#FF6B6B] transition mt-1"
            >
              Change password →
            </Link>

          </form>
        </section>
      </main>
    </div>
  );
}
