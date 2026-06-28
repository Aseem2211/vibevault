
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getItemDetail, addToCart, addReview, deleteReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

export default function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { darkMode, role, userId } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState("");
  const [cartErr, setCartErr] = useState("");
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSize,setSelectedSize]=useState("");
  const dm = {
    page: darkMode ? "bg-[#0f1220] text-[#e8ecff]" : "bg-[#E6E6FA] text-[#1A2556]",
    heading: darkMode ? "text-[#e8ecff]" : "text-[#1A2556]",
    sub: darkMode ? "text-[#8892be]" : "text-[#4F5B81]",
    card: darkMode ? "bg-[#161b35] border-[#2a3060]" : "bg-white border-[#E0E4FF]",
    sideCard: darkMode ? "bg-[#1a1f3a] border-[#2a3060]" : "bg-[#F8F6FF] border-[#E0E4FF]",
    badge: darkMode ? "bg-[#1e2444] text-[#8892be]" : "bg-[#F0EFFF] text-[#4F5B81]",
    divider: darkMode ? "border-[#2a3060]" : "border-[#E0E4FF]",
    infoRow: darkMode ? "border-[#232849]" : "border-[#F0EFFF]",
    input: darkMode ? "bg-[#1e2444] border-[#2a3060] text-[#e8ecff] placeholder-[#5a6490]" : "bg-[#F8F6FF] border-[#E0E4FF] text-[#1A2556]",
    btn: {
      cart: darkMode ? "bg-[#2a3060] text-[#e8ecff] hover:bg-[#353d75]" : "bg-[#F0EFFF] text-[#1A2556] hover:bg-[#e4e2ff]",
      buy: darkMode ? "bg-[#5b6af0] text-white hover:bg-[#6e7df5]" : "bg-[#1A2556] text-white hover:bg-[#2a3a7c]",
      del: darkMode ? "bg-[#3a1a1a] text-[#FF9999] hover:bg-[#4d2020]" : "bg-[#FFE5E5] text-[#FF6B6B] hover:bg-[#ffd0d0]",
    },
    priceTag: darkMode ? "text-[#f97316]" : "text-[#B12704]",
    stock: darkMode ? "text-[#4ade80]" : "text-[#007600]",
  };

  useEffect(() => {
    getItemDetail(itemId)
      .then((res) => {
        const found = res.data.founditem?.[0] ?? null;
        setItem(found);
        if (found) {
          setReviews(found.reviews ?? []);
          setAvgRating(found.averageRatings ?? 0);
        }
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleAddToCart = async () => {
    setCartErr("");
    try {
      await addToCart(itemId);
      setCartMsg("Added to cart!");
      setTimeout(() => setCartMsg(""), 2500);
    } catch {
      setCartErr("Failed to add to cart.");
      setTimeout(() => setCartErr(""), 2500);
    }
  };

  const handleBuyNow = () => navigate(`/buy/${itemId}`,{state:{size:selectedSize || null}});

  const handleReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return setReviewMsg({ err: true, text: "Comment is required." });
    setSubmitting(true);
    setReviewMsg(null);
    try {
      const res = await addReview(itemId, { rating, comment });
      const newReview = res.data.review ?? { rating, comment, _id: Date.now().toString() };
      setAvgRating(res.data.averageRating ?? avgRating);
      setReviews((prev) => [...prev, newReview]);
      setComment("");
      setRating(5);
      setReviewMsg({ err: false, text: "Review submitted!" });
    } catch (err) {
      setReviewMsg({ err: true, text: err.response?.data?.message ?? "Failed to submit review." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await deleteReview(itemId, reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setAvgRating(res.data.averageRating ?? 0);
    } catch {
      setReviewMsg({ err: true, text: "Failed to delete review." });
    }
  };

  const canDeleteReview = (review) =>
    role === "admin" || (userId && review.user === userId);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm.page}`}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className={`mb-6 flex items-center gap-2 text-sm font-medium ${dm.sub} hover:opacity-80 transition-opacity`}
        >
          <i className="ti ti-arrow-left" /> Back to results
        </button>

        {loading ? (
          <div className={`rounded-2xl border p-8 animate-pulse h-96 ${dm.card}`} />
        ) : !item ? (
          <div className={`text-center py-24 text-lg ${dm.sub}`}>
            <i className="ti ti-package-off text-5xl mb-4 block opacity-30" />
            Item not found or no longer available.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className={`lg:w-[38%] rounded-2xl border overflow-hidden ${dm.card}`}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[380px] lg:h-full object-cover"
                    style={{ minHeight: "320px", maxHeight: "520px" }}
                  />
                ) : (
                  <div className={`w-full h-80 flex items-center justify-center ${dm.sideCard}`}>
                    <i className={`ti ti-photo-off text-5xl opacity-20 ${dm.sub}`} />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col lg:flex-row gap-6">
                <div className={`flex-1 rounded-2xl border p-6 ${dm.card}`}>
                  <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${dm.badge}`}>
                    {item.section ?? "Item"}
                  </span>

                  <h1 className={`mt-4 text-2xl font-extrabold leading-snug ${dm.heading}`}>
                    {item.title}
                  </h1>

                  {item.seller && (
                    <p className={`mt-1 text-sm ${dm.sub}`}>
                      by <span className={`font-semibold ${dm.heading}`}>{item.seller}</span>
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={avgRating} readOnly={true} />
                    <span className={`text-xs ${dm.sub}`}>({reviews.length} reviews)</span>
                  </div>
                  {item.section === "clothes" && (
                    <div className="mt-4">
                      <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${dm.sub}`}>
                        Select Size
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize((prev) => (prev === s ? "" : s))}
                            className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200
                              ${selectedSize === s
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : darkMode
                                  ? "bg-[#1e2444] border-[#2a3060] text-[#c0caff] hover:bg-[#2a3060]"
                                  : "bg-[#F0EFFF] border-[#E0E4FF] text-[#4F5B81] hover:bg-[#e4e2ff]"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {selectedSize && (
                        <p className="mt-2 text-xs font-medium text-indigo-400">
                          Selected: {selectedSize}
                        </p>
                      )}
                    </div>
                  )}
                  <div className={`my-4 border-t ${dm.divider}`} />

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className={`text-4xl font-extrabold ${dm.priceTag}`}>
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <>
                        <span className={`text-base line-through ${dm.sub}`}>
                          ₹{item.originalPrice}
                        </span>
                        <span className="text-sm font-bold text-green-500">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>

                  <p className={`mt-1 text-sm font-semibold ${dm.stock}`}>
                    <i className="ti ti-circle-check mr-1" />
                    In Stock
                  </p>

                  <div className={`my-4 border-t ${dm.divider}`} />

                  <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dm.sub}`}>
                    About this item
                  </h2>
                  <p className={`text-sm leading-relaxed ${dm.sub}`}>
                    {item.description}
                  </p>

                  {(item.age || item.metadata?.size || item.section) && (
                    <>
                      <div className={`my-4 border-t ${dm.divider}`} />
                      <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dm.sub}`}>
                        Product details
                      </h2>
                      <div className="flex flex-col gap-0">
                        {[
                          { label: "Condition", value: item.condition },
                          { label: "Brand", value: item.brand },
                          { label: "Size", value: item.metadata?.size },
                          { label: "Stock", value: item.metadata?.stock != null ? `${item.metadata.stock} available` : null },
                          { label: "Category", value: item.section },
                        ]
                          .filter((r) => r.value)
                          .map((r) => (
                            <div
                              key={r.label}
                              className={`flex gap-4 py-2 border-b text-sm ${dm.infoRow}`}
                            >
                              <span className={`w-28 shrink-0 font-medium ${dm.sub}`}>{r.label}</span>
                              <span className={dm.heading}>{r.value}</span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>

                <div className={`lg:w-64 shrink-0 rounded-2xl border p-5 h-fit ${dm.sideCard}`}>
                  <div className={`text-3xl font-extrabold mb-1 ${dm.priceTag}`}>
                    ₹{item.price}
                  </div>
                  <p className={`text-xs mb-1 ${dm.sub}`}>Inclusive of all taxes</p>

                  <p className={`text-sm font-semibold mb-4 ${dm.stock}`}>
                    <i className="ti ti-circle-check mr-1" />
                    In Stock
                  </p>

                  {item.seller && (
                    <p className={`text-xs mb-4 ${dm.sub}`}>
                      Sold by <span className={`font-semibold ${dm.heading}`}>{item.seller}</span>
                    </p>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleBuyNow}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-colors duration-150 ${dm.btn.buy}`}
                    >
                      <i className="ti ti-bolt mr-2" />
                      Buy Now
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-colors duration-150 ${dm.btn.cart}`}
                    >
                      <i className="ti ti-shopping-cart mr-2" />
                      Add to Cart
                    </button>
                  </div>

                  {cartMsg && (
                    <p className="mt-3 text-xs font-semibold text-green-500 text-center">
                      <i className="ti ti-circle-check mr-1" />
                      {cartMsg}
                    </p>
                  )}
                  {cartErr && (
                    <p className="mt-3 text-xs font-semibold text-red-500 text-center">{cartErr}</p>
                  )}

                  <div className={`mt-5 pt-4 border-t flex flex-col gap-2 ${dm.divider}`}>
                    {[
                      { icon: "ti-shield-check", text: "Secure transaction" },
                      { icon: "ti-truck-delivery", text: "Free delivery available" },
                      { icon: "ti-refresh", text: "Easy returns" },
                    ].map((f) => (
                      <div key={f.text} className={`flex items-center gap-2 text-xs ${dm.sub}`}>
                        <i className={`ti ${f.icon} text-base`} />
                        {f.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-6 ${dm.card}`}>
              <h2 className={`text-base font-bold mb-4 ${dm.heading}`}>Customer Reviews</h2>

              {reviews.length > 0 ? (
                <div className="mb-6 flex flex-col gap-3">
                  {reviews.map((r) => (console.log("review.user:",r.user,"userId:",userId,"match:",r.user===userId,"canDelete:",canDeleteReview(r)),
                    <div key={r._id} className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${dm.sideCard}`}>
                      <div className="flex-1">
                        <StarRating value={r.rating} readOnly={true} />
                        <p className={`mt-2 text-sm ${dm.sub}`}>{r.comment}</p>
                      </div>
                      {canDeleteReview(r) && (
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className={`shrink-0 p-1.5 rounded-lg text-xs font-semibold transition ${dm.btn.del}`}
                          title="Delete review"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm mb-6 ${dm.sub}`}>No reviews yet. Be the first to leave one.</p>
              )}

              <div className={`border-t pt-5 ${dm.divider}`}>
                <h3 className={`text-sm font-bold mb-3 ${dm.heading}`}>Leave a Review</h3>

                <div className="mb-3">
                  <StarRating value={rating} onRate={setRating} readOnly={false} />
                </div>

                <textarea
                  rows={3}
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none transition-colors ${dm.input}`}
                />

                {reviewMsg && (
                  <p className={`mt-2 text-xs ${reviewMsg.err ? "text-red-400" : "text-green-400"}`}>
                    {reviewMsg.text}
                  </p>
                )}

                <button
                  onClick={handleReview}
                  disabled={submitting}
                  className={`mt-3 px-5 py-2 rounded-xl font-semibold text-sm text-white transition-colors disabled:opacity-50 ${dm.btn.buy}`}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}