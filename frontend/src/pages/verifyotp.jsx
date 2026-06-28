import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyChangePasswordOTP, verifySignupOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { darkMode } = useAuth();

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white" : "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    heading: darkMode ? "text-white" : "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1a2235] border-[#2a3a55] text-white placeholder-gray-500 focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F9FF] border-[#D7DBFF] text-[#1A2556] focus:border-[#1A2556] focus:ring-[#1A2556]/10",
    errBox: darkMode ? "bg-[#3a1a1a] border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#FFE5E5] border-[#FFB3B3] text-[#B22A2A]",
  };

  const inputCls = `w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:ring-4 ${dm.input}`;

  const purpose = state?.purpose ?? "signup";
  const method = state?.method ?? "email";
  const hint = state?.hint ?? "";
  const isSignup = purpose === "signup";

  const [otp, setOtp] = useState("");
  const [newpassword, setNewpassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        const data=await verifySignupOTP({ otp });
        navigate(data?.redirect ||"/");
      } else {
        await verifyChangePasswordOTP({ otp, newpassword, confirmpassword });
        navigate("/login");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP or something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const backHref = isSignup ? "/sendotp" : "/changepassword";

  return (
    <main className={`flex min-h-screen items-center justify-center px-4 py-12 transition-colors duration-300 ${dm.page}`}>
      <div className={`w-full max-w-lg rounded-[32px] border p-8 shadow-[0_25px_60px_rgba(26,37,86,0.12)] ${dm.card}`}>

        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-[#FF6B6B]">
            {isSignup ? "One last step" : "OTP Verification"}
          </p>
          <h1 className={`mt-3 text-3xl font-extrabold ${dm.heading}`}>
            {isSignup ? "Verify Your Email" : "Enter OTP"}
          </h1>
          <p className={`mt-2 text-sm ${dm.sub}`}>
            OTP sent to your <span className="font-medium capitalize">{method}</span>
            {hint && (
              <> : <strong className={dm.heading}>{hint}</strong></>
            )}
          </p>
        </div>

        {error && (
          <div className={`mb-4 rounded-2xl border p-4 text-sm ${dm.errBox}`}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className={`${inputCls} text-center text-xl tracking-[0.5em]`}
          />

          {!isSignup && (
            <>
              <input
                type="password"
                name="newpassword"
                placeholder="New Password"
                required
                value={newpassword}
                onChange={(e) => setNewpassword(e.target.value)}
                className={inputCls}
              />
              <input
                type="password"
                name="confirmpassword"
                placeholder="Confirm New Password"
                required
                value={confirmpassword}
                onChange={(e) => setConfirmpassword(e.target.value)}
                className={inputCls}
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B6B] px-5 py-3 text-base font-semibold text-white transition duration-200 hover:bg-[#e55a5a] disabled:opacity-60"
          >
            {loading ? "Verifying…" : isSignup ? "Verify & Activate Account" : "Verify & Change Password"}
          </button>

          <Link to={backHref} className={`text-center text-sm transition hover:text-[#FF6B6B] ${dm.sub}`}>
            ← Back / Resend OTP
          </Link>
        </form>
      </div>
    </main>
  );
}
