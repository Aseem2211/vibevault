import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  sendChangePasswordOTP,
  verifyChangePasswordOTP,
  changePasswordWithOld,
} from "../services/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useAuth();

  const profileFlow = location.state?.profileFlow || false;
  const initialMode = profileFlow ? "profile-choose" : "forgot";

  const [mode, setMode] = useState(initialMode);
  const [otpStage, setOtpStage] = useState("method"); // "method" | "otp" | "new-password"

  const [email, setEmail] = useState("");
  const [otpMethod, setOtpMethod] = useState("email");
  const [hint, setHint] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [done, setDone] = useState(false);

  const dm = {
    page: darkMode ? "bg-[#0f1220] text-[#e8ecff]" : "bg-[#E6E6FA] text-[#1A2556]",
    nav: darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-[#E6E6FA] border-[#E0E4FF]",
    navText: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    navBtn: darkMode ? "text-[#e8ecff] hover:bg-[#1e2444]" : "text-[#1A2556] hover:bg-[#E0E4FF]",
    card: darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-white border-[#E0E4FF]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/10"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556] placeholder-[#9aa3c9] focus:border-[#1A2556] focus:ring-[#E0E4FF]",
    label: darkMode ? "text-[#8892be]" : "text-[#1A2556]",
    errBox: darkMode
      ? "bg-[#3d1a1a] border-[#FF6B6B] text-[#FF6B6B]"
      : "bg-[#FFF5F8] border-[#F1C6D6] text-[#B52222]",
    methodBtn: (sel) =>
      sel
        ? "border-[#1A2556] bg-[#1A2556] text-white"
        : darkMode
        ? "border-[#2a3060] text-[#8892be] hover:border-[#FF6B6B]"
        : "border-[#E0E4FF] text-[#4F5B81] hover:border-[#1A2556]",
    modeBtn: darkMode
      ? "border-[#2a3060] bg-[#1e2444] text-[#e8ecff] hover:border-[#FF6B6B]"
      : "border-[#E0E4FF] bg-[#F8F6FF] text-[#1A2556] hover:border-[#1A2556]",
  };

  const inputClass = `w-full rounded-3xl border px-5 py-4 outline-none transition focus:ring-2 ${dm.input}`;

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const clear = () => {
    setError(""); setOtp(""); setNewPassword(""); setConfirmPassword(""); setOldPassword("");
  };

 
  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setError("");
    setMode("forgot-otp");
    setOtpStage("method");
  };

 
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
     
      const payload = { method: otpMethod };
      if (mode === "forgot-otp") payload.email = email;

      const data = await sendChangePasswordOTP(payload);

      if (data.error) {
        setError(data.error);
      } else {
        setHint(data.hint || "");
        setOtpStage("otp");
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await verifyChangePasswordOTP({ otp });
      if (data.error) {
        setError(data.error);
      } else if (data.otpVerified) {
        setOtpStage("new-password");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const data = await verifyChangePasswordOTP({ otp, newpassword: newPassword, confirmpassword: confirmPassword });
      if (data.error) setError(data.error);
      else setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleOldPasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const data = await changePasswordWithOld({ oldpassword: oldPassword, newpassword: newPassword, confirmpassword: confirmPassword });
      if (data.error || data.message?.toLowerCase().includes("incorrect")) {
        setError(data.error || data.message);
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Incorrect current password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setOtp(""); setError("");
    handleSendOtp();
  };

  
  if (done) {
    return (
      <Shell dm={dm} navigate={navigate}>
        <div className="text-center space-y-6 py-4">
          <div className="text-6xl">✅</div>
          <h1 className={`text-3xl font-extrabold ${dm.heading}`}>Password changed!</h1>
          <p className={dm.sub}>Your password has been updated successfully.</p>
          {profileFlow ? (
            <button onClick={() => navigate(-1)}
              className="inline-flex rounded-3xl bg-[#1A2556] px-8 py-4 text-white font-semibold hover:bg-[#FF6B6B] transition">
              Back to profile
            </button>
          ) : (
            <Link to="/login"
              className="inline-flex rounded-3xl bg-[#1A2556] px-8 py-4 text-white font-semibold hover:bg-[#FF6B6B] transition">
              Sign in now
            </Link>
          )}
        </div>
      </Shell>
    );
  }

  if (mode === "profile-choose") {
    return (
      <Shell dm={dm} navigate={navigate}>
        <Hdr dm={dm} eye="Change Password" title="How would you like to proceed?" />
        {error && <Err dm={dm} msg={error} />}
        <div className="space-y-4">
          <button onClick={() => { clear(); setMode("profile-old-pw"); }}
            className={`w-full rounded-3xl border-2 p-5 text-left transition ${dm.modeBtn}`}>
            <p className={`font-semibold text-lg ${dm.heading}`}><i className="fas fa-lock mr-3" />Use current password</p>
            <p className={`mt-1 ml-8 text-sm ${dm.sub}`}>Enter your existing password to set a new one.</p>
          </button>
          <button onClick={() => { clear(); setMode("profile-otp"); setOtpStage("method"); }}
            className={`w-full rounded-3xl border-2 p-5 text-left transition ${dm.modeBtn}`}>
            <p className={`font-semibold text-lg ${dm.heading}`}><i className="fas fa-mobile-alt mr-3" />Use OTP verification</p>
            <p className={`mt-1 ml-8 text-sm ${dm.sub}`}>Receive a one-time code on your email or phone.</p>
          </button>
        </div>
      </Shell>
    );
  }

  if (mode === "profile-old-pw") {
    return (
      <Shell dm={dm} navigate={navigate}>
        <Hdr dm={dm} eye="Change Password" title="Set a new password" />
        {error && <Err dm={dm} msg={error} />}
        <form onSubmit={handleOldPasswordChange} className="space-y-6">
          <Fld label="Current password" dm={dm}>
            <input type="password" placeholder="Enter current password"
              value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass} required />
          </Fld>
          <Fld label="New password" dm={dm}>
            <input type="password" placeholder="Create new password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass} required />
          </Fld>
          <Fld label="Confirm new password" dm={dm}>
            <input type="password" placeholder="Confirm new password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass} required />
          </Fld>
          <Btn loading={loading} label="Change Password" />
        </form>
        <Back onClick={() => { clear(); setMode("profile-choose"); }} dm={dm} />
      </Shell>
    );
  }

  if (mode === "forgot") {
    return (
      <Shell dm={dm} navigate={navigate}>
        <Hdr dm={dm} eye="Forgot Password" title="Enter your email"
          desc="We'll send a verification code to reset your password." />
        {error && <Err dm={dm} msg={error} />}
        <form onSubmit={handleForgotEmailSubmit} className="space-y-6">
          <Fld label="Email address" dm={dm}>
            <input type="email" placeholder="Enter your registered email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputClass} required />
          </Fld>
          <Btn loading={false} label="Continue" />
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className={`text-sm font-semibold hover:text-[#FF6B6B] transition ${dm.sub}`}>
            ← Back to sign in
          </Link>
        </div>
      </Shell>
    );
  }

  const isForgot = mode === "forgot-otp";

  if (otpStage === "method") {
    return (
      <Shell dm={dm} navigate={navigate}>
        <Hdr dm={dm}
          eye={isForgot ? "Forgot Password" : "Change Password"}
          title="Choose verification method"
          desc={isForgot ? `Account: ${email}` : "Pick how to receive your OTP."} />
        {error && <Err dm={dm} msg={error} />}
        <div className="flex gap-4 mb-8">
          {["email", "phone"].map((m) => (
            <button key={m} onClick={() => setOtpMethod(m)}
              className={`flex-1 rounded-3xl border-2 py-4 font-semibold capitalize transition ${dm.methodBtn(otpMethod === m)}`}>
              <i className={`fas fa-${m === "email" ? "envelope" : "phone"} mr-2`} />
              {m === "email" ? "Email" : "Phone"}
            </button>
          ))}
        </div>
        <Btn loading={loading} label="Send OTP" onClick={handleSendOtp} />
        <Back onClick={() => { clear(); setMode(isForgot ? "forgot" : "profile-choose"); }} dm={dm} />
      </Shell>
    );
  }

  if (otpStage === "otp") {
    return (
      <Shell dm={dm} navigate={navigate}>
        <Hdr dm={dm} eye="Verification" title="Enter OTP"
          desc={`Code sent to ${hint || (otpMethod === "email" ? "your email" : "your phone")}.`} />
        {error && <Err dm={dm} msg={error} />}
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <Fld label="One-time password" dm={dm}>
            <input type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className={inputClass} required />
          </Fld>
          <Btn loading={loading} label="Verify OTP" disabled={otp.length < 4} />
        </form>
        <div className="mt-6 text-center">
          <p className={`text-sm ${dm.sub}`}>
            Didn't receive it?{" "}
            <button onClick={handleResend} disabled={resendCooldown > 0}
              className={`font-semibold transition ${resendCooldown > 0 ? "opacity-40 cursor-not-allowed" : "text-[#FF6B6B] hover:text-[#e55a5a]"}`}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </p>
        </div>
        <Back onClick={() => { setOtpStage("method"); setOtp(""); setError(""); }} dm={dm} label="← Change method" />
      </Shell>
    );
  }

  if (otpStage === "new-password") {
    return (
      <Shell dm={dm} navigate={navigate}>
        <Hdr dm={dm} eye="New Password" title="Set new password" desc="OTP verified. Choose a strong new password." />
        {error && <Err dm={dm} msg={error} />}
        <form onSubmit={handleOtpSetPassword} className="space-y-6">
          <Fld label="New password" dm={dm}>
            <input type="password" placeholder="Create new password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass} required />
          </Fld>
          <Fld label="Confirm new password" dm={dm}>
            <input type="password" placeholder="Confirm new password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass} required />
          </Fld>
          <Btn loading={loading} label="Change Password" />
        </form>
      </Shell>
    );
  }

  return null;
}

function Shell({ dm, navigate, children }) {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <nav className={`border-b sticky top-0 z-50 shadow-sm ${dm.nav}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className={`font-bold text-lg ${dm.navText}`}>VibeVault</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className={`rounded-full p-3 transition-all ${dm.navBtn}`}>
              <i className="fas fa-chevron-left text-xl" />
            </button>
            <Link to="/" className={`rounded-full p-3 transition-all ${dm.navBtn}`}>
              <i className="fa fa-home text-xl" />
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md rounded-[40px] border shadow-[0_20px_60px_rgba(16,24,80,0.12)] p-8 md:p-12 ${dm.card}`}>
          {children}
        </div>
      </main>
    </div>
  );
}

function Hdr({ dm, eye, title, desc }) {
  return (
    <div className="mb-8 text-center">
      <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${dm.sub}`}>{eye}</p>
      <h1 className={`mt-4 text-3xl font-extrabold ${dm.heading}`}>{title}</h1>
      {desc && <p className={`mt-3 ${dm.sub}`}>{desc}</p>}
    </div>
  );
}
function Err({ dm, msg }) {
  return <div className={`mb-6 rounded-3xl border p-4 text-sm ${dm.errBox}`}>{msg}</div>;
}
function Fld({ label, dm, children }) {
  return (
    <div>
      <label className={`block text-sm font-semibold mb-2 ${dm.label}`}>{label}</label>
      {children}
    </div>
  );
}
function Btn({ loading, label, onClick, disabled }) {
  return (
    <button type={onClick ? "button" : "submit"} onClick={onClick}
      disabled={loading || disabled}
      className="w-full rounded-3xl bg-[#1A2556] px-5 py-4 text-white text-lg font-semibold transition hover:bg-[#FF6B6B] disabled:opacity-60 disabled:cursor-not-allowed">
      {loading ? "Please wait…" : label}
    </button>
  );
}
function Back({ onClick, dm, label = "← Back" }) {
  return (
    <button onClick={onClick}
      className={`mt-5 w-full text-sm text-center transition hover:text-[#FF6B6B] ${dm.sub}`}>
      {label}
    </button>
  );
}