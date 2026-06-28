import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setRole, setIsLoggedIn, darkMode } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const dm = {
    page: darkMode
      ? "bg-[#0f1220] text-[#e8ecff]"
      : "bg-[#E6E6FA] text-[#1A2556]",
    nav: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-[#E6E6FA] border-[#E0E4FF]",
    navText: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    navBtn: darkMode
      ? "text-[#e8ecff] hover:bg-[#1e2444]"
      : "text-[#1A2556] hover:bg-[#E0E4FF]",
    card: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
    leftPanel: darkMode
      ? "bg-gradient-to-br from-[#161b35] via-[#1e2444] to-[#1a2040]"
      : "bg-gradient-to-br from-[#E6E6FA] via-[#F3F2FF] to-[#E0E4FF]",
    leftCard: darkMode
      ? "bg-[#1e2444] shadow-sm"
      : "bg-[#F8F6FF] shadow-sm",
    leftCard2: darkMode
      ? "bg-[#252d56] border-[#2a3060]"
      : "bg-[#E0E4FF]",
    leftCard3: darkMode
      ? "bg-[#1e2444] border-[#2a3060]"
      : "bg-white border-[#D7D9F5]",
    leftFooter: darkMode
      ? "bg-[#1e2444] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556] placeholder-[#9aa3c9] focus:border-[#1A2556] focus:ring-[#E0E4FF]",
    label: darkMode ? "text-[#8892be]" : "text-[#1A2556]",
    formBg: darkMode ? "bg-[#161b35]" : "bg-white",
    errBox: darkMode
      ? "bg-[#3d1a1a] border-[#FF6B6B] text-[#FF6B6B]"
      : "bg-[#FFF5F8] border-[#F1C6D6] text-[#B52222]",
    signupBox: darkMode
      ? "bg-[#1e2444] border-[#2a3060]"
      : "bg-[#F8F6FF] border-[#E0E4FF]",
  };

  const inputClass = [
    "w-full rounded-3xl border px-5 py-4 outline-none transition focus:ring-2",
    dm.input,
  ].join(" ");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const res = await login(formData);
      setRole(res.user?.role || "user");
      setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      const msgs = err.response?.data?.message || ["Invalid email or password."];
      setErrors(Array.isArray(msgs) ? msgs : [msgs]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>

      <nav className={`border-b sticky top-0 z-50 shadow-sm transition-colors duration-300 ${dm.nav}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className={`font-bold text-lg ${dm.navText}`}>VibeVault</Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className={`rounded-full p-3 transition-all duration-200 ${dm.navBtn}`}
            >
              <i className="fas fa-chevron-left text-xl" />
            </button>
            <Link
              to="/"
              className={`rounded-full p-3 transition-all duration-200 ${dm.navBtn}`}
            >
              <i className="fa fa-home text-xl" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
        <div className={`w-full max-w-6xl rounded-[40px] border shadow-[0_20px_60px_rgba(16,24,80,0.12)] overflow-hidden lg:flex ${dm.card}`}>

          <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-10 ${dm.leftPanel}`}>
            <div className="space-y-8">
              <div className={`rounded-3xl p-8 ${dm.leftCard}`}>
                <h2 className={`text-3xl font-bold ${dm.heading}`}>Welcome Back</h2>
                <p className={`mt-3 leading-8 ${dm.sub}`}>
                  Sign in to continue shopping with VibeVault. Manage your favorites, orders, and checkout faster.
                </p>
              </div>
              <div className="grid gap-4">
                <div className={`rounded-3xl p-6 ${dm.leftCard2}`}>
                  <h3 className={`text-xl font-semibold ${dm.heading}`}>Smooth shopping</h3>
                  <p className={`mt-2 ${dm.sub}`}>
                    Browse premium items with a calm, modern interface built for comfort and speed.
                  </p>
                </div>
                <div className={`rounded-3xl p-6 border ${dm.leftCard3}`}>
                  <h3 className={`text-xl font-semibold ${dm.heading}`}>Secure access</h3>
                  <p className={`mt-2 ${dm.sub}`}>
                    Your credentials are protected with encrypted login flows and friendly UI feedback.
                  </p>
                </div>
              </div>
            </div>
            <div className={`rounded-3xl p-6 border ${dm.leftFooter}`}>
              <p className={`text-sm ${dm.sub}`}>Need help logging in?</p>
              <Link
                to="/support"
                className={`mt-3 inline-flex items-center gap-2 font-semibold hover:text-[#FF6B6B] transition ${dm.heading}`}
              >
                Contact support <i className="fas fa-arrow-right" />
              </Link>
            </div>
          </div>

          <div className={`w-full lg:w-1/2 p-8 md:p-12 ${dm.formBg}`}>
            <div className="mb-8 text-center">
              <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${dm.sub}`}>
                Customer Login
              </p>
              <h1 className={`mt-4 text-4xl font-extrabold ${dm.heading}`}>
                Sign in to your account
              </h1>
              <p className={`mt-3 ${dm.sub}`}>
                Enter your credentials to continue browsing deals and managing your orders.
              </p>
            </div>

            {errors.length > 0 && (
              <div className={`mb-6 rounded-3xl border p-5 ${dm.errBox}`}>
                {errors.map((err, i) => (
                  <p key={i} className="text-sm">{err}</p>
                ))}
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2 ${dm.label}`}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${dm.label}`}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                />
                <div className="mt-2 text-right">
                  <Link
                    to="/changepassword"
                    state={{email:formData.email,forgotFlow:true}}
                    className={`text-sm font-semibold hover:text-[#FF6B6B] transition ${dm.sub}`}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-[#1A2556] px-5 py-4 text-white text-lg font-semibold transition hover:bg-[#FF6B6B] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  "Signing in…"
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fas fa-sign-in-alt" />
                  </>
                )}
              </button>
            </form>

            <div className={`mt-8 rounded-3xl border p-6 text-center ${dm.signupBox}`}>
              <p className={dm.sub}>New to VibeVault?</p>
              <Link
                to="/signup"
                className="mt-4 inline-flex rounded-3xl bg-[#E0E4FF] px-7 py-3 text-[#1A2556] font-semibold hover:bg-[#d7dbff] transition"
              >
                Create account
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
