
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-[#E6E6FA] text-[#1A2556]",
    nav: darkMode ? "bg-[#1a2235]/80 border-[#2a3a55]" : "bg-white/80 border-[#E0E4FF]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white border-[#E0E4FF]",
    leftPanel: darkMode ? "bg-gradient-to-br from-[#0f1420] via-[#1a2235] to-[#1a2235]" : "bg-gradient-to-br from-[#E6E6FA] via-[#F8F6FF] to-white",
    leftInner: darkMode ? "bg-[#0f1420]" : "bg-[#F8F6FF]",
    leftBox1: darkMode ? "bg-[#2a1a1a]" : "bg-[#FFE5E5]",
    leftBox2: darkMode ? "bg-[#1a1a2a]" : "bg-[#E0E4FF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#0f1420] border-[#2a3a55] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556] focus:border-[#FF6B6B] focus:ring-[#FFE5E5]",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFF0F0] border-[#FF6B6B] text-[#B52222]",
  };

  const inputClass = `w-full rounded-3xl border px-5 py-4 outline-none transition focus:ring-2 ${dm.input}`;

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmpassword: "", address: "", contactno: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    if (formData.password !== formData.confirmpassword) {
      setErrors(["Passwords do not match."]);
      return;
    }
    setLoading(true);
    try {
      const res = await signup(formData);
      if (res.data?.redirect) {
        navigate(res.data.redirect);
      } else {
        navigate("/sendotp");
      }
    } catch (err) {
      const msgs = err.response?.data?.message || ["Signup failed. Please try again."];
      setErrors(Array.isArray(msgs) ? msgs : [msgs]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>

      <nav className={`border-b backdrop-blur-md ${dm.nav}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="text-2xl font-bold text-[#FF6B6B]">VibeVault</Link>
          <Link to="/" className={`rounded-full px-3 py-2 transition hover:opacity-80 ${dm.leftInner}`}>
            <i className={`fa fa-home ${dm.heading}`} />
          </Link>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
        <div className={`w-full max-w-5xl overflow-hidden rounded-[40px] border shadow-2xl lg:grid lg:grid-cols-[1.1fr_0.9fr] ${dm.card}`}>

          <div className={`hidden lg:flex flex-col justify-center gap-6 p-10 ${dm.leftPanel}`}>
            <div className={`rounded-3xl p-8 shadow-sm ${dm.leftInner}`}>
              <h2 className={`text-3xl font-bold ${dm.heading}`}>Join VibeVault</h2>
              <p className={`mt-3 leading-7 ${dm.sub}`}>Create your account to save favorites, track orders, and enjoy a calm lavender shopping experience across every purchase.</p>
            </div>
            <div className="grid gap-4">
              <div className={`rounded-3xl p-6 ${dm.leftBox1}`}>
                <h3 className="text-xl font-semibold text-[#FF6B6B]">Simple onboarding</h3>
                <p className={`mt-2 ${dm.sub}`}>Sign up in seconds with a clean, intuitive form.</p>
              </div>
              <div className={`rounded-3xl p-6 ${dm.leftBox2}`}>
                <h3 className={`text-xl font-semibold ${dm.heading}`}>Made for you</h3>
                <p className={`mt-2 ${dm.sub}`}>Access personalized deals and easy checkout after registering.</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FF6B6B]">Create account</p>
              <h1 className={`mt-4 text-4xl font-extrabold ${dm.heading}`}>Sign up to VibeVault</h1>
              <p className={`mt-3 ${dm.sub}`}>Fill in your details to start shopping with premium style and ease.</p>
            </div>

            {errors.length > 0 && (
              <div className={`mb-6 rounded-3xl border p-5 ${dm.errBox}`}>
                {errors.map((err, i) => <p key={i} className="text-sm">{err}</p>)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className={`block text-sm font-semibold mb-2 ${dm.heading}`}>Full name</label>
                <input id="name" name="name" type="text" required placeholder="Enter your full name" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${dm.heading}`}>Email address</label>
                <input id="email" name="email" type="email" required placeholder="Enter your email address" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${dm.heading}`}>Password</label>
                  <input id="password" name="password" type="password" required placeholder="Create a password" value={formData.password} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="confirmpassword" className={`block text-sm font-semibold mb-2 ${dm.heading}`}>Confirm password</label>
                  <input id="confirmpassword" name="confirmpassword" type="password" required placeholder="Confirm your password" value={formData.confirmpassword} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="address" className={`block text-sm font-semibold mb-2 ${dm.heading}`}>Full address</label>
                <textarea id="address" name="address" rows={4} required placeholder="Enter your full address" value={formData.address} onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label htmlFor="contactno" className={`block text-sm font-semibold mb-2 ${dm.heading}`}>Phone number</label>
                <input id="contactno" name="contactno" type="tel" required placeholder="Enter your phone number" value={formData.contactno} onChange={handleChange} className={inputClass} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full rounded-3xl bg-[#1A2556] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#2f3a6b] disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Creating account..." : "Continue to verification"}
              </button>
            </form>

            <p className={`mt-8 text-center ${dm.sub}`}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-[#FF6B6B] hover:text-[#e55a5a]">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}