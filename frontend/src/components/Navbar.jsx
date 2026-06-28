
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/api";
import { useState, useEffect, useRef } from "react";

export default function Navbar({ section }) {
  const { setRole, isLoggedIn, setIsLoggedIn, darkMode } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const blurTimer = useRef(null);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setRole("user");
    navigate("/");
  };

  const navBg = darkMode ? "bg-[#0f1220] border-[#2a3060]" : "bg-[#E6E6FA] border-[#E0E4FF]";

  return (
    <nav className={`sticky top-0 z-50 px-4 py-2 border-b transition-colors duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between bg-[#1A2556] rounded-xl px-5">

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            title="Go back"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors"
          >
            <i className="fas fa-chevron-left text-lg" aria-hidden="true" />
          </button>

          <Link to="/" title="Home"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors">
            <i className="fas fa-home text-lg" aria-hidden="true" />
          </Link>

          {isLoggedIn && (
            <div className="relative overflow-visible">
              <button
                onClick={() => setProfileOpen(o => !o)}
                title="Profile"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors"
              >
                <i className="fas fa-user-circle text-xl" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div
                  onMouseEnter={() => clearTimeout(blurTimer.current)}
                  onMouseLeave={() => setProfileOpen(false)}
                  className={`absolute left-0 mt-2 rounded-2xl shadow-xl w-48 py-2 z-50 border ${darkMode ? "bg-[#1e2444] border-[#2a3060]" : "bg-white border-[#E0E4FF]"}`}
                >
                  {[
                    { label: "My Profile",    to: "/profile",       icon: "fa-user"  },
                    { label: "My Orders",     to: "/orders",        icon: "fa-box"   },
                    { label: "Order Received", to: "/seller/orders", icon: "fa-shopping-bag" },
                    { label: "Settings",      to: "/settings",      icon: "fa-cog"   },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onMouseDown={() => navigate(item.to)}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition hover:text-[#FF6B6B] ${darkMode ? "text-[#e8ecff] hover:bg-[#252d56]" : "text-[#1A2556] hover:bg-[#F8F6FF]"}`}
                    >
                      <i className={`fas ${item.icon} w-4`} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <Link to="/cart" title="Cart"
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors">
            <i className="fas fa-shopping-cart text-lg" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B6B] border-2 border-[#1A2556]" />
          </Link>

          <div className="w-px h-6 bg-white/15 mx-1.5" />

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
            <span className="text-[#E6E6FA] font-medium text-lg tracking-tight">VibeVault</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {section && (
            <span className="text-xs font-medium tracking-widest bg-[#FF6B6B]/20 text-[#FF9999] px-3 py-1 rounded-full">
              {section}
            </span>
          )}

          {!isLoggedIn ? (
            <Link to="/login"
              className="h-9 px-4 rounded-full bg-[#FF6B6B] text-white text-sm font-medium flex items-center gap-1.5 hover:bg-[#e55a5a] transition-colors">
              <i className="ti ti-login text-base" aria-hidden="true" />
              Login
            </Link>
          ) : (
            <button onClick={handleLogout}
              className="h-9 px-4 rounded-full text-[#E6E6FA] text-sm font-medium flex items-center gap-1.5 border border-white/20 bg-white/10 hover:bg-white/[0.16] transition-colors">
              <i className="ti ti-logout text-base" aria-hidden="true" />
              Logout
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}