
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/api";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function Settings() {
  const { setRole, setIsLoggedIn, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState("");

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white border-[#E0E4FF]",
    heading: darkMode ? "text-white" :"text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    row: darkMode ? "bg-[#0f1420] hover:bg-[#1a2235]" : "bg-[#F8F6FF] hover:bg-[#E0E4FF]",
  };

  const cardClass = `rounded-2xl border p-6 mb-4 ${dm.card}`;

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };
  const handledarkMode=async()=>{
    setDarkMode(prev=>!prev);
  }; 

  const handleLogout = async () => {
    setLoading("logout");
    await logout();
    setIsLoggedIn(false);
    setRole("user");
    navigate("/home");
  };

  const handleDeleteOrders = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading("orders");
    try {
      await api.delete("/api/orders/all");
      flash("Order history deleted.");
    } catch {
      flash("Failed to delete order history.", "error");
    } finally {
      setLoading("");
      setConfirmDelete(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDeleteAccount) { setConfirmDeleteAccount(true); return; }
    setLoading("account");
    try {
      await api.delete("/api/profile/delete");
      setIsLoggedIn(false);
      setRole("user");
      navigate("/home");
    } catch {
      flash("Failed to delete account.", "error");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="Settings" />
      <main className="max-w-2xl mx-auto px-4 py-10">

        <h1 className={`text-3xl font-extrabold mb-2 ${dm.heading}`}>Settings</h1>
        <p className={`mb-8 ${dm.sub}`}>Manage your account preferences.</p>

        {msg.text && (
          <div className={`mb-6 rounded-2xl px-5 py-4 text-sm font-medium border ${
            msg.type === "error"
              ? "bg-[#FFE5E5] text-[#B52222] border-[#FF6B6B]"
              : "bg-[#E5FFE9] text-[#1a7a2a] border-[#6BCB77]"
          }`}>
            {msg.text}
          </div>
        )}

        <div className={cardClass}>
          <h2 className={`font-bold text-lg mb-4 ${dm.heading}`}>Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold text-sm ${dm.heading}`}>Dark mode</p>
              <p className={`text-xs mt-1 ${dm.sub}`}>Switch to a darker color scheme</p>
            </div>
            <button
              onClick={handledarkMode}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${darkMode ? "bg-[#1A2556]" : "bg-[#E0E4FF]"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${darkMode ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={`font-bold text-lg mb-4 ${dm.heading}`}>Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold text-sm ${dm.heading}`}>Order updates</p>
              <p className={`text-xs mt-1 ${dm.sub}`}>Receive notifications about your orders</p>
            </div>
            <button
              onClick={() => setNotifications(n => !n)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notifications ? "bg-[#FF6B6B]" : "bg-[#E0E4FF]"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${notifications ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={`font-bold text-lg mb-4 ${dm.heading}`}>Account</h2>
          <div className="space-y-3">
            {[
              { label: "Edit Profile", icon: "fa-user", path: "/profile" },
              { label: "Change Password", icon: "fa-lock", path: "/changepassword" },
              { label: "View Orders", icon: "fa-box", path: "/orders" },
            ].map(({ label, icon, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-sm font-semibold ${dm.row}`}
              >
                <span className="flex items-center gap-3">
                  <i className={`fas ${icon} text-[#1A2556] ${darkMode ? "text-white" : ""}`} />
                  <span className={dm.heading}>{label}</span>
                </span>
                <i className={`fas fa-chevron-right ${dm.sub}`} />
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border border-[#FFB3B3] p-6 mb-4 ${darkMode ? "bg-[#1a2235]" : "bg-white"}`}>
          <h2 className="font-bold text-lg text-[#B52222] mb-4">Danger zone</h2>
          <div className="space-y-3">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className={`font-semibold text-sm ${dm.heading}`}>Delete order history</p>
                <p className={`text-xs ${dm.sub}`}>Permanently remove all past orders</p>
              </div>
              <button
                onClick={handleDeleteOrders}
                disabled={loading === "orders"}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  confirmDelete ? "bg-[#B52222] text-white hover:bg-[#8a1a1a]" : "bg-[#FFE5E5] text-[#B52222] hover:bg-[#ffd0d0]"
                }`}
              >
                {loading === "orders" ? "Deleting..." : confirmDelete ? "Confirm delete" : "Delete history"}
              </button>
            </div>

            <div className="border-t border-[#FFE5E5] pt-3 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className={`font-semibold text-sm ${dm.heading}`}>Logout</p>
                <p className={`text-xs ${dm.sub}`}>Sign out of your account</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loading === "logout"}
                className="px-5 py-2 rounded-full bg-[#1A2556] text-white text-sm font-semibold hover:bg-[#FF6B6B] transition"
              >
                {loading === "logout" ? "Logging out..." : "Logout"}
              </button>
            </div>

            <div className="border-t border-[#FFE5E5] pt-3 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className={`font-semibold text-sm ${dm.heading}`}>Delete account</p>
                <p className={`text-xs ${dm.sub}`}>This action is permanent and irreversible</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={loading === "account"}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  confirmDeleteAccount ? "bg-[#B52222] text-white hover:bg-[#8a1a1a]" : "bg-[#FFE5E5] text-[#B52222] hover:bg-[#ffd0d0]"
                }`}
              >
                {loading === "account" ? "Deleting..." : confirmDeleteAccount ? "Yes, delete my account" : "Delete account"}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}