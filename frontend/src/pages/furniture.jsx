
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getItemsBySection } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Furniture() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useAuth();

  const dm = {
    page: darkMode
      ? "bg-[#0f1220] text-[#e8ecff]"
      : "bg-[#E6E6FA] text-[#1A2556]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    card: darkMode
      ? "bg-[#161b35] border-[#2a3060]"
      : "bg-white border-[#E0E4FF]",
    input: darkMode
      ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490]"
      : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556]",
    empty: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
  };

  useEffect(() => {
    getItemsBySection("furniture")
      .then((res) => setItems(res.data.items??[]))
      .catch((err) => console.error("Failed to load furniture:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleted = (id) =>
    setItems((prev) => prev.filter((i) => i._id !== id));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar section="furniture" />

      <main className="max-w-7xl mx-auto px-4 py-10">

        <section className="text-center mb-10">
          <h1 className={`text-4xl md:text-5xl font-extrabold ${dm.heading}`}>
            VibeVault furniture
          </h1>
          <p className={`mt-3 max-w-2xl mx-auto ${dm.sub}`}>
            Browse curated secondhand and new furniture across every genre.
          </p>
        </section>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`rounded-2xl border p-6 animate-pulse h-32 ${dm.card}`}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={`text-center py-24 text-lg ${dm.empty}`}>
            <i className="ti ti-book text-4xl mb-3 block opacity-40" />
            No furniture listed yet.
          </div>
        ) : (
          <section className="flex flex-col gap-4">
            {items.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                categoryLabel="Furniture"
                onDeleted={handleDeleted}
                darkMode={darkMode}
                dm={dm}
              />
            ))}
          </section>
        )}

      </main>
    </div>
  );
}
