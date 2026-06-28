import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendSignupOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SendOTP() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { darkMode } = useAuth();

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]" : "bg-[#F8F6FF] border-[#E0E4FF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    radio: darkMode ? "border-[#2a3a55] bg-[#1a2235] hover:border-[#FF6B6B]" : "border-[#E0E4FF] bg-[#F8F6FF] hover:border-[#FF6B6B]",
    radioActive: darkMode ? "border-[#FF6B6B] bg-[#2a1a1a]":"border-[#FF6B6B] bg-[#FFF0F0]",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]":"bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!method) { setError("Please select a delivery method."); return; }
    setError("");
    setLoading(true);
    try {
      const data = await sendSignupOTP(method);
      navigate("/verifyotp", { state: { purpose: "signup", method, hint: data?.hint } });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`flex min-h-screen items-center justify-center px-4 py-12 transition-colors duration-300 ${dm.page}`}>
      <div className={`w-full max-w-md rounded-[40px] border p-10 shadow-2xl ${dm.card}`}>

        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FF6B6B]">One last step</p>
          <h1 className={`mt-4 text-3xl font-extrabold ${dm.heading}`}>Verify your account</h1>
          <p className={`mt-3 ${dm.sub}`}>Choose how you'd like to receive your OTP</p>
        </div>

        {error && (
          <div className={`mb-5 rounded-2xl border p-4 text-sm ${dm.errBox}`}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { value: "email", title: "Send to Email", desc: "We'll send a 6-digit OTP to your registered email" },
            { value: "phone", title: "Send to Phone", desc: "We'll send a 6-digit OTP to your registered phone number" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-4 rounded-3xl border-2 p-5 transition ${
                method === opt.value ? dm.radioActive : dm.radio
              }`}
            >
              <input
                type="radio"
                name="method"
                value={opt.value}
                checked={method === opt.value}
                onChange={() => setMethod(opt.value)}
                className="h-4 w-4 accent-[#FF6B6B]"
                required={opt.value === "email"}
              />
              <div>
                <p className={`font-semibold ${dm.heading}`}>{opt.title}</p>
                <p className={`text-sm ${dm.sub}`}>{opt.desc}</p>
              </div>
            </label>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-3xl bg-[#1A2556] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#2f3a6b] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send OTP →"}
          </button>

          <Link to="/signup" className={`text-center text-sm transition hover:text-[#FF6B6B] ${dm.sub}`}>
            ← Back to signup
          </Link>
        </form>
      </div>
    </main>
  );
}
  