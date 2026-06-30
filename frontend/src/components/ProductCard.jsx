import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addToCart, deleteItem, deleteReview } from "../services/api";
import StarRating from "../pages/StarRating";

export default function ProductCard({ item, categoryLabel, onDeleted }) {
  const { role, darkMode, userId} = useAuth();
  
  const navigate = useNavigate();

  const [avgRating, setAvgRating] = useState(item.averageRatings ?? 0);
  const [reviews, setReviews] = useState(item.reviews ?? []);
  const [stock] = useState(item.metadata?.stock ?? null);
  const [showReviews, setShowReviews] = useState(false);
  console.log("userId:",userId,"reviews:",reviews[0]?.user);
  const card    = darkMode ? "bg-[#161b35] border-[#2a3060]"    : "bg-white border-[#E0E4FF]";
  const heading = darkMode ? "text-[#e8ecff]"                   : "text-[#1A2556]";
  const sub     = darkMode ? "text-[#8892be]"                   : "text-[#4F5B81]";
  const badge   = darkMode ? "bg-[#3d1a1a] text-[#FF9999]"     : "bg-[#FFE5E5] text-[#FF6B6B]";
  const sizeBadge = darkMode ? "bg-[#1e2444] text-[#c0caff] border-[#2a3060]" : "bg-[#F0EFFF] text-[#4F5B81] border-[#E0E4FF]";
  const divider = darkMode ? "border-[#2a3060]"                 : "border-[#E0E4FF]";
  const editBtn = darkMode ? "bg-[#1e2444] text-[#c0caff] hover:bg-[#2a3060]" : "bg-[#E0E4FF] text-[#1A2556] hover:bg-[#c7cdf5]";
  const delBtn  = darkMode ? "bg-[#3a1a1a] text-[#FF9999] hover:bg-[#4d2020]" : "bg-[#FFE5E5] text-[#FF6B6B] hover:bg-[#ffd0d0]";
  const reviewCard = darkMode ? "bg-[#1a1f3a] border-[#2a3060]" : "bg-[#F8F6FF] border-[#E0E4FF]";
  const imgPanel = darkMode ? "bg-[#1e2444]" : "bg-[#F8F6FF]";

  const handleCart = async (e) => {
    e.stopPropagation();
    try { await addToCart(item._id); alert("Added to cart!"); }
    catch { alert("Could not add to cart. Please login."); }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this item permanently?")) return;
    try { await deleteItem(item._id); onDeleted(item._id); }
    catch { alert("Delete failed."); }
  };

  const handleDeleteReview = async (e, reviewId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await deleteReview(item._id, reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setAvgRating(res.data.averageRating ?? 0);
    } catch {
      alert("Failed to delete review.");
    }
  };

  const canDeleteReview = (review) =>
    role === "admin" || (userId && review.user === userId);

  return (
    <div onClick={() => navigate("/detailpage/" + item._id)} className="cursor-pointer block">
      <article className={"rounded-xl border overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] " + card}>
        <div className={"relative w-full h-56 md:h-auto flex-shrink-0 overflow-hidden rounded-3xl " + imgPanel}>
          <img
            src={item.image}
            alt={item.name || item.section}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={(e)=>{e.target.style.display='none';}}
          />
        </div>

        <div className="p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={"text-xl font-bold line-clamp-2 " + heading}>
                  {item.name || item.section}
                </h3>
                <p className={"text-sm mt-1 " + sub}>
                  Condition: <span className={"font-medium " + heading}>{item.age}</span>
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating value={avgRating} readOnly={true} />
                  <span className={"text-xs " + sub}>({reviews.length} reviews)</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap " + badge}>
                  {categoryLabel || item.section}
                </span>
                {item.metadata?.size && (
                  <span className={"inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold " + sizeBadge}>
                    Size: {item.metadata.size}
                  </span>
                )}
              </div>
            </div>

            <p className={"text-sm leading-6 " + sub}>
              <span className={"font-semibold " + heading}>About this item: </span>
              {item.description}
            </p>

            <div className={"text-2xl font-bold " + heading}>Rs {item.price}</div>

            {stock !== null && (
              <p className={"text-sm " + sub}>
                Stock:{" "}
                <span className={stock === 0 ? "font-semibold text-red-400" : "font-semibold text-green-400"}>
                  {stock === 0 ? "Out of stock" : stock + " available"}
                </span>
              </p>
            )}

            {reviews.length > 0 && (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowReviews((p) => !p)}
                  className={"text-xs font-semibold underline underline-offset-2 " + sub}
                >
                  {showReviews ? "Hide reviews" : `Show ${reviews.length} review${reviews.length > 1 ? "s" : ""}`}
                </button>

                {showReviews && (
                  <div className="mt-3 flex flex-col gap-2">
                    {reviews.map((r) => (
                      <div key={r._id} className={"rounded-xl border p-3 flex items-start justify-between gap-3 " + reviewCard}>
                        <div className="flex-1">
                          <StarRating value={r.rating} readOnly={true} />
                          <p className={"mt-1 text-sm " + sub}>{r.comment}</p>
                        </div>
                        {canDeleteReview(r) && (
                          <button
                            onClick={(e) => handleDeleteReview(e, r._id)}
                            className={"shrink-0 p-1.5 rounded-lg text-xs font-semibold transition " + delBtn}
                            title="Delete review"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={"flex flex-col md:flex-row gap-3 pt-4 border-t mt-4 " + divider}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCart}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B6B] px-4 py-2 text-white text-sm font-semibold transition hover:bg-[#e55a5a]"
            >
              <i className="fas fa-cart-plus" /> Add to cart
            </button>

            

            {role === "admin" && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate("/item/edit/" + item._id); }}
                  className={"flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition " + editBtn}
                >
                  <i className="fas fa-pen" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className={"flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition " + delBtn}
                >
                  <i className="fas fa-trash-alt" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
