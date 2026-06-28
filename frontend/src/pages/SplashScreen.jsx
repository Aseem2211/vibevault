import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/home"), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A2556] flex flex-col items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-4 h-4 rounded-full bg-[#FF6B6B]" />
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight">
            VibeVault
          </h1>
        </div>
        <p className="text-[#E6E6FA] text-lg tracking-[0.3em] uppercase mt-2">
          Shop. Sell. Rent.
        </p>
      </div>
      <div className="mt-12 flex gap-2">
        <span className="w-2 h-2 rounded-full  bg-[#FF6B6B] animate-bounce"style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-bounce" style={{animationDelay: "150ms" }} />
        <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-bounce"style={{animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

