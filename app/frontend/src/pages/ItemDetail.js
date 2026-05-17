import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Tag, Star, User, Calendar, Repeat2, Sparkles, X, ChevronLeft, Loader2, Package, Truck, Scale } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import api, { formatError } from "../utils/api";
import { formatRupees } from "../utils/currency";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function getImageUrl(img) {
  if (!img) return "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=600&h=700&fit=crop";
  return img.startsWith("http") ? img : `${BACKEND_URL}/api/files/${img}`;
}

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedOfferedId, setSelectedOfferedId] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("local_pickup");
  const [swapMessage, setSwapMessage] = useState("");
  const [swapping, setSwapping] = useState(false);
  const [swapError, setSwapError] = useState("");
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);
  const [aiValue, setAiValue] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [matches, setMatches] = useState({ nearby: [], fair_value: [] });

  useEffect(() => {
    api.get(`/api/listings/${id}`).then((r) => {
      setListing(r.data);
      setLoading(false);
    }).catch(() => navigate("/browse"));
    api.get(`/api/listings/${id}/matches`).then((r) => setMatches(r.data)).catch(() => {});
  }, [id, navigate]);

  const loadMyListings = async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/listings/user/me");
      setMyListings(res.data.filter((l) => l.status === "available"));
    } catch (_) {}
  };

  const openSwapModal = () => {
    if (!user) { navigate("/auth"); return; }
    loadMyListings();
    setShowSwapModal(true);
    setSwapError("");
    setSwapSuccess(false);
  };

  const handleSwapRequest = async (e) => {
    e.preventDefault();
    if (!selectedOfferedId) { setSwapError("Please select an item to offer"); return; }
    setSwapping(true);
    setSwapError("");
    try {
      await api.post("/api/swaps", {
        offered_listing_id: selectedOfferedId,
        requested_listing_id: id,
        message: swapMessage,
        delivery_method: deliveryMethod,
      });
      setSwapSuccess(true);
    } catch (err) {
      setSwapError(formatError(err));
    } finally {
      setSwapping(false);
    }
  };

  const getAiEstimate = async () => {
    if (!listing) return;
    setAiLoading(true);
    try {
      const res = await api.post("/api/calculator/estimate", {
        brand: listing.brand,
        category: listing.category,
        size: listing.size,
        condition: listing.condition,
        title: listing.title,
      });
      setAiValue(res.data);
    } catch (_) {} finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton rounded-2xl" style={{ height: 480 }} />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className={`skeleton h-${i === 0 ? 8 : 5} w-${i % 2 === 0 ? 'full' : '3/4'}`} />)}
        </div>
      </div>
    </div>
  );

  if (!listing) return null;
  const images = listing.images?.length ? listing.images : [""];
  const isOwner = user?.id === listing.owner_id;
  const selectedOffer = myListings.find((ml) => ml.id === selectedOfferedId);
  const valueDifference = selectedOffer ? Math.abs((selectedOffer.estimated_value || 0) - (listing.estimated_value || 0)) : 0;

  return (
    <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#58605A] hover:text-[#171A18] mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Browse
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="rounded-2xl overflow-hidden mb-3" style={{ border: "1px solid #DCD9CE", height: 440 }}>
              <img src={getImageUrl(images[selectedImg])} alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=600&h=700&fit=crop"; }} />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className="rounded-lg overflow-hidden flex-shrink-0 transition-all"
                    style={{ width: 64, height: 64, border: `2px solid ${selectedImg === i ? "#24402E" : "#DCD9CE"}` }}>
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=64&h=64&fit=crop"; }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge-category">{listing.category}</span>
              <span className="badge-condition">{listing.condition}</span>
              {listing.status !== "available" && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                  {listing.status === "swapped" ? "Swapped" : "Unavailable"}
                </span>
              )}
            </div>

            <h1 className="font-heading font-black text-3xl text-[#171A18] mb-2" style={{ letterSpacing: "-0.02em" }}>{listing.title}</h1>
            <p className="text-[#58605A] mb-5 leading-relaxed">{listing.description}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Brand", value: listing.brand },
                { label: "Size", value: listing.size },
                { label: "Category", value: listing.category },
                { label: "Condition", value: listing.condition },
              ].map((spec) => (
                <div key={spec.label} className="p-3 rounded-xl" style={{ background: "#EBE8DF" }}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#A4ACA6] mb-0.5">{spec.label}</div>
                  <div className="font-semibold text-[#171A18] text-sm">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Value */}
            <div className="flex items-center justify-between p-4 rounded-2xl mb-5" style={{ background: "#24402E" }}>
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-0.5">Estimated Value</div>
                <div className="font-heading font-black text-3xl" style={{ color: "#C2FF41" }}>{formatRupees(listing.estimated_value)}</div>
              </div>
              <button data-testid="ai-estimate-btn" onClick={getAiEstimate} disabled={aiLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{ background: aiLoading ? "#EBE8DF" : "#C2FF41", color: "#171A18" }}>
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                AI Estimate
              </button>
            </div>

            {/* AI Result */}
            {aiValue && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                data-testid="ai-value-result"
                className="p-4 rounded-2xl mb-5" style={{ background: "#F0FFF0", border: "1px solid #A8D5A2" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} color="#24402E" />
                  <span className="font-semibold text-sm text-[#24402E]">AI Valuation</span>
                  <span className="text-xs text-[#58605A]">({aiValue.confidence} confidence)</span>
                </div>
                <div className="font-heading font-black text-2xl text-[#24402E] mb-2">{formatRupees(aiValue.estimated_value)}</div>
                <p className="text-xs text-[#58605A] mb-3">{aiValue.reasoning}</p>
                {aiValue.swap_suggestions?.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Fair swap for:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {aiValue.swap_suggestions.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#C2FF41", color: "#171A18" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Location */}
            {listing.location && (
              <div className="flex items-center gap-1.5 text-[#58605A] text-sm mb-5">
                <MapPin size={14} /> {listing.location}
              </div>
            )}

            {(matches.nearby?.length > 0 || matches.fair_value?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-2xl" style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1">
                    <MapPin size={13} /> Nearby Matches
                  </div>
                  <div className="font-heading font-bold text-lg text-[#24402E]">{matches.nearby?.length || 0}</div>
                  <p className="text-xs text-[#58605A]">same-city swap opportunities</p>
                </div>
                <div className="p-3 rounded-2xl" style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1">
                    <Scale size={13} /> Fair Value
                  </div>
                  <div className="font-heading font-bold text-lg text-[#24402E]">{matches.fair_value?.length || 0}</div>
                  <p className="text-xs text-[#58605A]">items within {formatRupees(1200)}</p>
                </div>
              </div>
            )}

            {/* Owner */}
            {listing.owner && (
              <div className="flex items-center gap-3 p-4 rounded-2xl mb-5" style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: "#24402E" }}>{listing.owner.name?.charAt(0)?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#171A18] text-sm">{listing.owner.name}</div>
                  <div className="text-xs text-[#58605A]">{listing.owner.swap_count} swaps · {listing.owner.location}</div>
                </div>
              </div>
            )}

            {/* CTA */}
            {!isOwner && listing.status === "available" && (
              <button data-testid="request-swap-btn" onClick={openSwapModal}
                className="btn-lime w-full py-4 text-base flex items-center justify-center gap-2">
                <Repeat2 size={18} /> Request Swap
              </button>
            )}
            {isOwner && (
              <Link to="/dashboard">
                <button className="btn-outline w-full py-3.5 text-sm">Manage this listing</button>
              </Link>
            )}
            {listing.status !== "available" && !isOwner && (
              <div className="text-center py-3 rounded-xl text-sm text-[#58605A]" style={{ background: "#EBE8DF" }}>This item is no longer available</div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Swap request modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
            data-testid="swap-modal">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-xl text-[#171A18]">Request Swap</h3>
              <button onClick={() => setShowSwapModal(false)} className="p-1.5 rounded-lg hover:bg-[#F7F6F2]"><X size={18} /></button>
            </div>

            {swapSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#C2FF41" }}>
                  <Repeat2 size={28} color="#171A18" />
                </div>
                <h4 className="font-heading font-bold text-xl text-[#171A18] mb-2">Swap Request Sent!</h4>
                <p className="text-[#58605A] text-sm mb-6">The owner will review your request. You can chat to negotiate.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowSwapModal(false); navigate("/swaps"); }} className="btn-dark flex-1 py-3 text-sm">View My Swaps</button>
                  <button onClick={() => setShowSwapModal(false)} className="btn-outline flex-1 py-3 text-sm">Close</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSwapRequest}>
                <p className="text-sm text-[#58605A] mb-5">
                  You're requesting: <strong className="text-[#171A18]">{listing.title}</strong>
                </p>
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Offer one of your items</label>
                  {myListings.length === 0 ? (
                    <div className="p-4 rounded-xl text-center text-sm text-[#58605A]" style={{ background: "#F7F6F2" }}>
                      <Package size={20} className="mx-auto mb-2 opacity-50" />
                      You don't have any available listings.
                      <Link to="/dashboard" className="block text-[#24402E] font-semibold mt-1.5">Add a listing first</Link>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {myListings.map((ml) => (
                        <label key={ml.id} data-testid={`offer-item-${ml.id}`}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                          style={{ border: `1.5px solid ${selectedOfferedId === ml.id ? "#24402E" : "#DCD9CE"}`, background: selectedOfferedId === ml.id ? "#F0F7F3" : "#fff" }}>
                          <input type="radio" name="offered" value={ml.id} checked={selectedOfferedId === ml.id}
                            onChange={() => setSelectedOfferedId(ml.id)} className="accent-[#24402E]" />
                          <img src={getImageUrl(ml.images?.[0])} alt={ml.title}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=48&h=48&fit=crop"; }} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#171A18] truncate">{ml.title}</div>
                            <div className="text-xs text-[#58605A]">{formatRupees(ml.estimated_value)} · {ml.condition}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedOffer && (
                  <div className="mb-4 p-3 rounded-xl" style={{ background: "#F0F7F3", border: "1px solid rgba(36,64,46,0.16)" }}>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#24402E] mb-1">
                      <Scale size={13} /> Value Comparison
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-[#58605A]">Your Offer</div>
                        <div className="font-bold text-[#171A18]">{formatRupees(selectedOffer.estimated_value)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#58605A]">Requested</div>
                        <div className="font-bold text-[#171A18]">{formatRupees(listing.estimated_value)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#58605A]">Difference</div>
                        <div className="font-bold text-[#24402E]">{formatRupees(valueDifference)}</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Exchange Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "local_pickup", label: "Local Meetup", icon: <MapPin size={14} />, note: "Best nearby" },
                      { id: "courier", label: "Courier", icon: <Truck size={14} />, note: `Est. ${formatRupees(90)}` },
                    ].map((method) => (
                      <button type="button" key={method.id} onClick={() => setDeliveryMethod(method.id)}
                        className="p-3 rounded-xl text-left transition-colors"
                        style={{ border: `1.5px solid ${deliveryMethod === method.id ? "#24402E" : "#DCD9CE"}`, background: deliveryMethod === method.id ? "#F0F7F3" : "#fff" }}>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#171A18]">{method.icon} {method.label}</div>
                        <div className="text-xs text-[#58605A] mt-1">{method.note}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Message (Optional)</label>
                  <textarea data-testid="swap-message" value={swapMessage} onChange={(e) => setSwapMessage(e.target.value)}
                    placeholder="Tell them why you'd like this swap..."
                    className="input-field resize-none" rows={3} />
                </div>
                {swapError && <div className="text-sm text-red-600 mb-3 p-3 rounded-xl bg-red-50">{swapError}</div>}
                <div className="flex gap-3">
                  <button type="submit" disabled={swapping || myListings.length === 0} data-testid="confirm-swap-btn"
                    className="btn-lime flex-1 py-3 text-sm flex items-center justify-center gap-2">
                    {swapping ? <Loader2 size={16} className="animate-spin" /> : <><Repeat2 size={15} /> Send Request</>}
                  </button>
                  <button type="button" onClick={() => setShowSwapModal(false)} className="btn-outline flex-1 py-3 text-sm">Cancel</button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
