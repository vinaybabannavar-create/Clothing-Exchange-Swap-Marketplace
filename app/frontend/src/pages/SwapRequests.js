import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Repeat2, CheckCircle, XCircle, Clock, MessageSquare, Package, ArrowRight, Sparkles, Leaf } from "lucide-react";
import Navbar from "../components/Navbar";
import { RequireAuth, useAuth } from "../contexts/AuthContext";
import api, { formatError } from "../utils/api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function getImageUrl(img) {
  if (!img) return "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=200&fit=crop";
  return img.startsWith("http") ? img : `${BACKEND_URL}/api/files/${img}`;
}

const statusConfig = {
  pending: { label: "Pending", color: "#F57C00", bg: "#FFF3E0", icon: <Clock size={13} /> },
  accepted: { label: "Accepted", color: "#2E7D32", bg: "#E8F5E9", icon: <CheckCircle size={13} /> },
  rejected: { label: "Rejected", color: "#D32F2F", bg: "#FFEBEE", icon: <XCircle size={13} /> },
  completed: { label: "Completed", color: "#1565C0", bg: "#E3F2FD", icon: <CheckCircle size={13} /> },
};

function SwapCard({ swap, currentUserId, onAccept, onReject, onComplete, onChat }) {
  const isIncoming = swap.target_user_id === currentUserId;
  const status = statusConfig[swap.status] || statusConfig.pending;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      data-testid={`swap-card-${swap.id}`}
      className="bg-white rounded-2xl p-5 border"
      style={{ borderColor: "#DCD9CE" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#58605A]">
            {isIncoming ? "Incoming Request" : "Outgoing Request"}
          </span>
          {isIncoming && swap.status === "pending" && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold animate-pulse" style={{ background: "#C2FF41", color: "#171A18" }}>New</span>
          )}
        </div>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: status.bg, color: status.color }}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Items exchange */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#A4ACA6] mb-1.5 font-medium">{isIncoming ? "They offer" : "You offer"}</div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F7F6F2" }}>
            <img src={getImageUrl(swap.offered_listing_image)} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=48&h=48&fit=crop"; }} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#171A18] truncate">{swap.offered_listing_title}</div>
              <div className="text-xs text-[#58605A]">{isIncoming ? swap.requester_name : "Your item"}</div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center">
          <Repeat2 size={20} color="#C2FF41" />
          <div className="w-px h-6 mt-1" style={{ background: "#DCD9CE" }}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#A4ACA6] mb-1.5 font-medium">{isIncoming ? "For your item" : "For their item"}</div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F7F6F2" }}>
            <img src={getImageUrl(swap.requested_listing_image)} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=48&h=48&fit=crop"; }} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#171A18] truncate">{swap.requested_listing_title}</div>
              <div className="text-xs text-[#58605A]">{isIncoming ? "Your item" : swap.target_user_name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {swap.message && (
        <div className="text-xs text-[#58605A] px-3 py-2.5 rounded-xl mb-4 italic" style={{ background: "#F7F6F2" }}>
          "{swap.message}"
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-3 rounded-xl p-3 mb-4"
        style={{ background: "rgba(194,255,65,0.14)", border: "1px solid rgba(36,64,46,0.12)" }}>
        <div className="flex sm:flex-col items-center sm:items-start gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#24402E", color: "#C2FF41" }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-xl font-heading font-bold text-[#24402E] leading-none">{swap.match_score || 82}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#58605A]">Match</div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#24402E] mb-1">
            <Leaf size={13} /> Smart Swap Insight
          </div>
          <p className="text-xs text-[#58605A] leading-relaxed mb-1">{swap.eco_impact || "This swap keeps clothing in circulation and reduces new purchases."}</p>
          <p className="text-xs font-semibold text-[#171A18]">{swap.suggested_action || "Message them to confirm size, condition, and exchange details."}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {isIncoming && swap.status === "pending" && (
          <>
            <button data-testid={`accept-swap-${swap.id}`} onClick={() => onAccept(swap.id)}
              className="btn-lime flex items-center gap-1.5 text-sm py-2 px-4">
              <CheckCircle size={14} /> Accept
            </button>
            <button data-testid={`reject-swap-${swap.id}`} onClick={() => onReject(swap.id)}
              className="flex items-center gap-1.5 text-sm py-2 px-4 rounded-full border font-semibold transition-colors"
              style={{ border: "1.5px solid #D32F2F", color: "#D32F2F" }}>
              <XCircle size={14} /> Reject
            </button>
          </>
        )}
        {swap.status === "accepted" && (
          <button data-testid={`complete-swap-${swap.id}`} onClick={() => onComplete(swap.id)}
            className="btn-dark flex items-center gap-1.5 text-sm py-2 px-4">
            <CheckCircle size={14} /> Mark Complete
          </button>
        )}
        {swap.status !== "rejected" && (
          <button data-testid={`chat-swap-${swap.id}`} onClick={() => onChat(swap.id)}
            className="flex items-center gap-1.5 text-sm py-2 px-4 rounded-full border font-medium transition-colors hover:bg-[#F7F6F2]"
            style={{ border: "1.5px solid #DCD9CE", color: "#58605A" }}>
            <MessageSquare size={14} /> Chat
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function SwapRequests() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("incoming");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/swaps");
      setSwaps(res.data);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSwaps(); }, []);

  const handleAccept = async (swapId) => {
    try {
      await api.put(`/api/swaps/${swapId}/accept`);
      fetchSwaps();
    } catch (e) { alert(formatError(e)); }
  };

  const handleReject = async (swapId) => {
    try {
      await api.put(`/api/swaps/${swapId}/reject`);
      fetchSwaps();
    } catch (e) { alert(formatError(e)); }
  };

  const handleComplete = async (swapId) => {
    if (!window.confirm("Mark this swap as completed?")) return;
    try {
      await api.put(`/api/swaps/${swapId}/complete`);
      fetchSwaps();
    } catch (e) { alert(formatError(e)); }
  };

  const handleChat = (swapId) => navigate(`/chat?room=${swapId}`);

  const incoming = swaps.filter((s) => s.target_user_id === user?.id);
  const outgoing = swaps.filter((s) => s.requester_id === user?.id);
  const displayed = tab === "incoming" ? incoming : outgoing;

  return (
    <RequireAuth>
      <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl text-[#171A18] mb-1">Swap Requests</h1>
            <p className="text-[#58605A]">Manage your incoming and outgoing swap requests</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl p-1 mb-8 gap-1" style={{ background: "#EBE8DF" }}>
            <button data-testid="tab-incoming" onClick={() => setTab("incoming")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ background: tab === "incoming" ? "#24402E" : "transparent", color: tab === "incoming" ? "#fff" : "#58605A" }}>
              Incoming
              {incoming.filter((s) => s.status === "pending").length > 0 && (
                <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: "#C2FF41", color: "#171A18" }}>
                  {incoming.filter((s) => s.status === "pending").length}
                </span>
              )}
            </button>
            <button data-testid="tab-outgoing" onClick={() => setTab("outgoing")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: tab === "outgoing" ? "#24402E" : "transparent", color: tab === "outgoing" ? "#fff" : "#58605A" }}>
              Outgoing
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="skeleton rounded-2xl h-36" />)}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EBE8DF" }}>
                <Package size={28} color="#A4ACA6" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#171A18] mb-2">No {tab} requests</h3>
              <p className="text-[#58605A] text-sm mb-5">
                {tab === "incoming" ? "When someone requests a swap with you, it'll appear here." : "Start browsing to find items you'd like to swap."}
              </p>
              {tab === "outgoing" && (
                <button onClick={() => navigate("/browse")} className="btn-dark flex items-center gap-2 mx-auto px-6 py-2.5 text-sm">
                  Browse Listings <ArrowRight size={15} />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayed.map((swap) => (
                <SwapCard key={swap.id} swap={swap} currentUserId={user?.id}
                  onAccept={handleAccept} onReject={handleReject} onComplete={handleComplete} onChat={handleChat} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
