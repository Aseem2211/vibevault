import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/api";

const SLIDES = [
  {
    title: "Discover Premium Vibes",
    sub: "Curated collections across clothing, books, furniture & more.",
    cta: "Shop Now",
    link: "/clothes",
    bg: "from-[#1A2556] to-[#2d3a7a]",
  },
  {
    title: "Rent. Return. Repeat.",
    sub: "Why buy when you can rent? Save money, reduce clutter.",
    cta: "Browse Rentals",
    link: "/rent",
    bg: "from-[#2d3a7a] to-[#1A2556]",
  },
  {
    title: "Sell What You Don't Need",
    sub: "Turn unused items into cash. List in under 2 minutes.",
    cta: "Start Selling",
    link: "/sell",
    bg: "from-[#1A2556] to-[#0f1a3d]",
  },
];

const CATEGORIES = [
  { label: "Clothing", path: "/clothes", icon: "ti-shirt",  desc: "Fashion & apparel", image: "/images/clothes.png" },
  { label: "Snacks", path: "/snacks",  icon: "ti-apple",  desc: "Treats & refreshments", image: "/images/snack.png" },
  { label: "Stationary",path: "/stationary",icon: "ti-pencil",  desc: "Office & study essentials", image: "/images/stationary.png" },
  { label: "Books", path: "/books", icon: "ti-book",  desc: "Vast library of knowledge", image: "/images/books.png" },
  { label: "Furniture", path: "/furniture", icon: "ti-armchair",  desc: "Stylish home furnishings",image: "/images/furniture.png" },
  { label: "Appliances", path: "/appliances",icon: "ti-device-laptop", desc: "Latest home technology", image: "/images/appliances.png" },
];

const FEATURES = [
  { icon: "ti-shield-check", title: "Secure Payments", desc: "End-to-end encrypted transactions" },
  { icon: "ti-truck-delivery",title: "Fast Delivery", desc: "Same day dispatch on most orders" },
  { icon: "ti-refresh",title: "Easy Returns", desc: "Hassle-free 7-day return policy" },
  { icon: "ti-headset", title: "24/7 Support", desc: "Always here when you need us" },
];

export default function Home() {
  const { setRole, isLoggedIn, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [slide, setSlide] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const timerRef = useRef(null);
  const blurTimer = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const goSlide = (i) => {
    clearInterval(timerRef.current);
    setSlide(i);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4000);
  };

  const handleLogout = async () => {
    try { await logout(); } catch (err) {console.log(err);}
    setIsLoggedIn(false);
    setRole("user");
    navigate("/home");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/search?tosearch=${encodeURIComponent(q)}`);
  };

  const handleProfileBlur = () => {
    blurTimer.current = setTimeout(() => setProfileOpen(false), 150);
  };

  const s = SLIDES[slide];

  return (
    <div className="bg-white dark:bg-[#0f1220] text-[#1A2556] dark:text-[#e8ecff] min-h-screen transition-colors duration-300">

      <nav className="bg-white dark:bg-[#161b35] border-b border-[#E0E4FF] dark:border-[#2a3060] sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">

          <Link to="/home" className="flex items-center gap-2 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
            <span className="text-xl font-extrabold text-[#1A2556] dark:text-[#e8ecff]">VibeVault</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex gap-2">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3c9] dark:text-[#5a6490] text-sm" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clothes, books, appliances..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E0E4FF] dark:border-[#2a3060] bg-[#F8F6FF] dark:bg-[#1e2444] text-[#1A2556] dark:text-[#e8ecff] text-sm focus:outline-none focus:border-[#FF6B6B] dark:focus:border-[#FF6B6B] placeholder-[#9aa3c9] dark:placeholder-[#5a6490] transition"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FF6B6B] text-white rounded-full text-sm font-semibold hover:bg-[#e85555] transition">
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            <Link to="/cart" className="text-[#1A2556] dark:text-[#e8ecff] hover:text-[#FF6B6B] transition hidden sm:block">
              <i className="fas fa-shopping-cart text-xl" />
            </Link>

            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  onBlur={handleProfileBlur}
                  className="text-[#1A2556] dark:text-[#e8ecff] hover:text-[#FF6B6B] transition"
                >
                  <i className="fas fa-user-circle text-xl" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-[#1e2444] border border-[#E0E4FF] dark:border-[#2a3060] rounded-2xl shadow-xl w-48 py-2 z-50">
                    {[
                      { label: "My Profile", to: "/profile",  icon: "fa-user" },
                      { label: "My Orders",  to: "/orders",   icon: "fa-box" },
                      {label:"Order Received",to:"/seller/orders",icon:"fa-store"},  
                      { label: "Settings",   to: "/settings", icon: "fa-cog" },
                    ].map(item => (
                      <Link key={item.to} to={item.to}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[#1A2556] dark:text-[#e8ecff] hover:bg-[#F8F6FF] dark:hover:bg-[#252d56] hover:text-[#FF6B6B] transition">
                        <i className={`fas ${item.icon} w-4`} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Link to="/sell" className="hidden sm:inline-block px-3 py-2 bg-[#E0E4FF] dark:bg-[#2a3060] text-[#1A2556] dark:text-[#c0caff] text-sm font-semibold rounded-full hover:bg-[#d7dbff] dark:hover:bg-[#343d75] transition">
              Sell
            </Link>
            <Link to="/rent" className="hidden sm:inline-block px-3 py-2 bg-[#E0E4FF] dark:bg-[#2a3060] text-[#1A2556] dark:text-[#c0caff] text-sm font-semibold rounded-full hover:bg-[#d7dbff] dark:hover:bg-[#343d75] transition">
              Rent
            </Link>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="px-4 py-2 bg-[#1A2556] dark:bg-[#FF6B6B] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B6B] dark:hover:bg-[#e85555] transition">
                Logout
              </button>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-[#1A2556] dark:bg-[#FF6B6B] text-white text-sm font-semibold rounded-full hover:bg-[#FF6B6B] dark:hover:bg-[#e85555] transition">
                Login
              </Link>
            )}
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa3c9] dark:text-[#5a6490] text-sm" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E0E4FF] dark:border-[#2a3060] bg-[#F8F6FF] dark:bg-[#1e2444] text-[#1A2556] dark:text-[#e8ecff] text-sm focus:outline-none focus:border-[#FF6B6B] transition"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#FF6B6B] text-white rounded-full text-sm font-semibold hover:bg-[#e85555] transition">
              Go
            </button>
          </form>
        </div>
      </nav>

      <div className={`bg-gradient-to-r ${s.bg} text-white py-20 px-4 transition-all duration-700`}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">{s.title}</h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">{s.sub}</p>
          <Link to={s.link} className="inline-block px-8 py-4 bg-[#FF6B6B] text-white font-bold rounded-full text-lg hover:bg-[#e85555] transition hover:scale-105">
            {s.cta} <i className="fas fa-arrow-right ml-2" />
          </Link>
          <div className="flex justify-center gap-3 mt-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-3 rounded-full transition-all duration-300 ${i === slide ? "bg-[#FF6B6B] w-8" : "bg-white/40 w-3 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b35] border-y border-[#E0E4FF] dark:border-[#2a3060] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F8F6FF] dark:bg-[#1e2444] flex items-center justify-center shrink-0">
                <i className={`ti ${f.icon} text-[#FF6B6B]`} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A2556] dark:text-[#e8ecff]">{f.title}</p>
                <p className="text-xs text-[#4F5B81] dark:text-[#8892be]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2556] dark:text-[#e8ecff]">Shop by Category</h2>
          <span className="text-sm text-[#4F5B81] dark:text-[#8892be]">{CATEGORIES.length} categories</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.path}
              to={cat.path}
              className="group bg-white dark:bg-[#161b35] rounded-2xl border border-[#E0E4FF] dark:border-[#2a3060] overflow-hidden hover:border-[#FF6B6B] hover:shadow-lg dark:hover:shadow-[#FF6B6B]/10 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-full h-48 overflow-hidden bg-[#F8F6FF] dark:bg-[#1e2444] group-hover:bg-[#FFE5E5] dark:group-hover:bg-[#3d1a1a] transition">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className={`ti ${cat.icon} text-4xl text-[#1A2556] dark:text-[#c0caff] group-hover:text-[#FF6B6B]`} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#1A2556] dark:text-[#e8ecff] text-base">{cat.label}</h3>
                <p className="text-sm text-[#4F5B81] dark:text-[#8892be] mt-1">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-[#1A2556] dark:bg-[#0f1a3d] mx-4 md:mx-8 rounded-3xl py-12 px-8 text-center mb-12 max-w-7xl lg:mx-auto">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to start selling?</h2>
        <p className="text-white/70 mb-6">List your first item in under 2 minutes. No fees to get started.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/sell" className="px-8 py-3 bg-[#FF6B6B] text-white font-bold rounded-full hover:bg-[#e85555] transition">
            Start Selling
          </Link>

        </div>
      </div>

      <footer className="bg-[#1A2556] dark:bg-[#0b1028] text-white/60 text-center py-8 text-sm transition-colors duration-300">
        <p className="font-bold text-white text-lg mb-1">VibeVault</p>
        <p>© {new Date().getFullYear()} VibeVault. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3 text-xs">
          <Link to="/support"  className="hover:text-white transition">Support</Link>
          <Link to="/settings" className="hover:text-white transition">Settings</Link>
          <Link to="/profile"  className="hover:text-white transition">Profile</Link>
        </div>
      </footer>
    </div>
  );
}
