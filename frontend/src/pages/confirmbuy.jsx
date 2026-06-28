
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#0f1220] text-[#e8ecff]" : "bg-[#E6E6FA] text-[#1A2556]"}`}>
      <div className={`rounded-2xl border p-10 text-center max-w-md w-full ${darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-white border-[#E0E4FF]"}`}>
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-extrabold mb-2">Order Confirmed!</h1>
        <p className={`mb-6 ${darkMode ? "text-[#8892be]" : "text-[#4F5B81]"}`}>
          Your order has been placed successfully. We'll deliver it soon.
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="px-6 py-3 rounded-xl bg-[#1A2556] text-white font-semibold hover:bg-[#FF6B6B] transition"
        >
          View My Orders
        </button>
        <button
          onClick={() => navigate("/")}
          className={`mt-3 block w-full py-3 rounded-xl font-semibold transition ${darkMode ? "text-[#8892be] hover:text-[#e8ecff]" : "text-[#4F5B81] hover:text-[#1A2556]"}`}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}