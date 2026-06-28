import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getSellItemOrderDetails } from "../services/sellerService";
import { useAuth } from "../context/AuthContext";

export default function SeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useAuth();

  const [item, setItem] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dm = {
    page: darkMode ? "bg-[#0f1420] text-white": "bg-gradient-to-b from-[#F3ECFF] to-[#E6E6FA] text-[#1A2556]",
    card: darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-white/95 border-[#E0E4FF]",
    inner: darkMode ? "bg-[#0f1420] border-[#2a3a55]":"bg-[#F8F9FF] border-[#D7DBFF]",
    heading: darkMode ? "text-white": "text-[#1A2556]",
    sub: darkMode ? "text-gray-400" : "text-[#4F5B81]",
    badge:darkMode ? "bg-[#1a2235] border-[#2a3a55]" : "bg-[#F0EDFF] border-[#D7DBFF]",
  };

  useEffect(() => {
    getSellItemOrderDetails(id)
      .then((data) => {
        setItem(data.item);
        setBuyer(data.buyer);
      })
      .catch(() => setError("Could not load order details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className={`flex min-h-screen items-center justify-center ${dm.page}`}>
      <p className={`text-lg ${dm.sub}`}>Loading order details…</p>
    </div>
  );

  if (error) return (
    <div className={`flex min-h-screen items-center justify-center ${dm.page}`}>
      <p className="text-[#FF6B6B]">{error}</p>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12 space-y-8">

        <section className={`rounded-[32px] border p-8 shadow-xl ${dm.card}`}>
          <p className={`text-sm uppercase tracking-[0.3em] ${dm.sub}`}>Order details</p>
          <h1 className={`mt-2 text-4xl font-extrabold ${dm.heading}`}>Item Summary</h1>

          <div className={`mt-6 rounded-[24px] border p-6 ${dm.inner}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Item Name",value: item?.name },
                { label: "Price", value: `₹${item?.price}` },
                { label: "Category",value: item?.section },
                { label: "Condition", value: item?.age },
                { label: "Stock Left", value: item?.metadata?.stock ?? "N/A" },
                { label: "Order Status", value: item?.orderStatus ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className={`rounded-2xl border p-4 ${dm.badge}`}>
                  <p className={`text-xs uppercase tracking-[0.2em] ${dm.sub}`}>{label}</p>
                  <p className={`mt-1 text-lg font-semibold ${dm.heading}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`rounded-[32px] border p-8 shadow-xl ${dm.card}`}>
          <h2 className={`text-2xl font-bold ${dm.heading}`}>Buyer Information</h2>

          {buyer ? (
            <div className={`mt-6 rounded-[24px] border p-6 ${dm.inner}`}>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Name", value: buyer.name },
                  { label: "Email", value: buyer.email },
                  { label: "Address", value: buyer.address },
                  { label: "Contact No", value: buyer.contactno },
                ].map(({ label, value }) => (
                  <div key={label} className={`rounded-2xl border p-4 ${dm.badge}`}>
                    <p className={`text-xs uppercase tracking-[0.2em] ${dm.sub}`}>{label}</p>
                    <p className={`mt-1 text-lg font-semibold ${dm.heading}`}>{value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className={`mt-4 ${dm.sub}`}>No buyer has ordered this item yet.</p>
          )}
        </section>

        <button
          onClick={() => navigate(-1)}
          className="rounded-2xl bg-[#1A2556] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f3a6b]"
        >
          ← Back
        </button>

      </main>
    </div>
  );
}