import { useState } from "react";

const StarRating = ({ value = 0, onRate, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            fontSize: "24px",
            cursor: readOnly ? "default" : "pointer",
            color: star <= (hovered || value) ? "#f5a623" : "#ccc",
            transition: "color 0.2s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
