
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
    <nav className={`sticky top-0 z-50 px-2 sm:px-4 py-2 border-b transition-colors duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto h-14 sm:h-16 flex items-center justify-between bg-[#1A2556] rounded-xl px-3 sm:px-5">

        
        <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            title="Go back"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors shrink-0"
          >
            <i className="fas fa-chevron-left text-sm sm:text-lg" />
          </button>

          <Link to="/" title="Home"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors shrink-0">
            <i className="fas fa-home text-sm sm:text-lg" />
          </Link>

          <div className="hidden sm:block w-px h-6 bg-white/15 mx-1.5" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
            <span className="text-[#E6E6FA] font-medium text-lg tracking-tight">VibeVault</span>
          </div>
        </div>

        
        <div className="flex sm:hidden items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
          <span className="text-[#E6E6FA] font-medium text-base tracking-tight">VibeVault</span>
        </div>

        
        <div className="flex items-center gap-1 sm:gap-3">

          {section && (
            <span className="hidden sm:inline text-xs font-medium tracking-widest bg-[#FF6B6B]/20 text-[#FF9999] px-3 py-1 rounded-full">
              {section}
            </span>
          )}

          <Link to="/cart" title="Cart"
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors shrink-0">
            <i className="fas fa-shopping-cart text-sm sm:text-lg" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B6B] border-2 border-[#1A2556]" />
          </Link>

          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(o => !o)}
                title="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#E6E6FA] hover:bg-white/10 transition-colors shrink-0"
              >
                <i className="fas fa-user-circle text-lg sm:text-xl" />
              </button>

              {profileOpen && (
                <div
                  onMouseEnter={() => clearTimeout(blurTimer.current)}
                  onMouseLeave={() => setProfileOpen(false)}
                  className={`absolute right-0 mt-2 rounded-2xl shadow-xl w-48 py-2 z-50 border ${darkMode ? "bg-[#1e2444] border-[#2a3060]" : "bg-white border-[#E0E4FF]"}`}
                >
                  {[
                    { label: "My Profile",     to: "/profile",       icon: "fa-user" },
                    { label: "My Orders",      to: "/orders",        icon: "fa-box" },
                    { label: "Order Received", to: "/seller/orders", icon: "fa-shopping-bag" },
                    { label: "Settings",       to: "/settings",      icon: "fa-cog" },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onMouseDown={() => navigate(item.to)}
                      onClick={() => setProfileOpen(false)}
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

          {!isLoggedIn ? (
            <Link to="/login"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-full bg-[#FF6B6B] text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 hover:bg-[#e55a5a] transition-colors shrink-0">
              <i className="ti ti-login text-sm sm:text-base" />
              <span className="hidden xs:inline">Login</span>
              <span className="xs:hidden">In</span>
            </Link>
          ) : (
            <button onClick={handleLogout}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-full text-[#E6E6FA] text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-1.5 border border-white/20 bg-white/10 hover:bg-white/[0.16] transition-colors shrink-0">
              <i className="ti ti-logout text-sm sm:text-base" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}