import { Link, useNavigate } from "react-router-dom";
import { MapPin, Tag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { formatRupees } from "../utils/currency";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ListingCard({ listing, variants }) {
  const navigate = useNavigate();

  const imageUrl = listing.images?.[0]
    ? listing.images[0].startsWith("http")
      ? listing.images[0]
      : `${BACKEND_URL}/api/files/${listing.images[0]}`
    : "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=400&h=500&fit=crop";

  const conditionColor = {
    "Like New": "#2E7D32",
    "Excellent": "#388E3C",
    "Good": "#F57C00",
    "Fair": "#FF8F00",
    "Poor": "#D32F2F",
  };

  return (
    <motion.div
      variants={variants}
      data-testid={`listing-card-${listing.id}`}
      onClick={() => navigate(`/listings/${listing.id}`)}
      className="card-product cursor-pointer"
    >
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ display: "block" }}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=400&h=500&fit=crop";
          }}
        />
        <span className="badge-category absolute top-3 left-3" data-testid={`listing-category-${listing.id}`}>
          {listing.category}
        </span>
        {listing.status === "swapped" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold bg-black/70 px-4 py-1.5 rounded-full text-sm">Swapped</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-[#171A18] text-sm leading-tight mb-1 line-clamp-2" style={{ fontSize: "0.95rem" }}>
          {listing.title}
        </h3>
        <p className="text-xs text-[#58605A] mb-3">
          {listing.brand} · Size {listing.size}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag size={13} color="#24402E" />
            <span className="font-bold text-[#24402E]" style={{ fontFamily: "Space Grotesk" }}>
              {formatRupees(listing.estimated_value)}
            </span>
          </div>
          <span
            className="badge-condition"
            style={{ color: conditionColor[listing.condition] || "#58605A" }}
          >
            {listing.condition}
          </span>
        </div>
        {listing.location && (
          <div className="flex items-center gap-1 mt-2">
            <MapPin size={11} color="#A4ACA6" />
            <span className="text-[#A4ACA6] text-xs truncate">{listing.location}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
