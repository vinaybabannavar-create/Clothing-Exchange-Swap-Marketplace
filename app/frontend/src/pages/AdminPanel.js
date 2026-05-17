import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Package, Repeat2, BarChart2, ShieldCheck, Trash2, Ban, CheckCircle, RefreshCw } from "lucide-react";
import Navbar from "../components/Navbar";
import { RequireAdmin } from "../contexts/AuthContext";
import api, { formatError } from "../utils/api";
import { formatRupees } from "../utils/currency";

const tabs = ["overview", "users", "listings", "swaps"];

export default function AdminPanel() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/stats");
      setStats(res.data);
    } catch (_) {}
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (_) {} finally { setLoading(false); }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/listings");
      setListings(res.data.listings || []);
    } catch (_) {} finally { setLoading(false); }
  };

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/swaps");
      setSwaps(res.data.swaps || []);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchStats();
    if (tab === "users") fetchUsers();
    else if (tab === "listings") fetchListings();
    else if (tab === "swaps") fetchSwaps();
  }, [tab]);

  const handleBanUser = async (userId) => {
    try {
      const res = await api.put(`/api/admin/users/${userId}/ban`);
      alert(res.data.message);
      fetchUsers();
    } catch (e) { alert(formatError(e)); }
  };

  const handleRemoveListing = async (listingId) => {
    if (!window.confirm("Remove this listing?")) return;
    try {
      await api.delete(`/api/admin/listings/${listingId}`);
      fetchListings();
    } catch (e) { alert(formatError(e)); }
  };

  const statCards = stats ? [
    { icon: <Users size={20} />, label: "Total Users", value: stats.total_users, color: "#4527A0" },
    { icon: <Package size={20} />, label: "Total Listings", value: stats.total_listings, color: "#1565C0" },
    { icon: <Repeat2 size={20} />, label: "Total Swaps", value: stats.total_swaps, color: "#2E7D32" },
    { icon: <CheckCircle size={20} />, label: "Completed Swaps", value: stats.completed_swaps, color: "#24402E" },
    { icon: <RefreshCw size={20} />, label: "Pending Swaps", value: stats.pending_swaps, color: "#E65100" },
    { icon: <BarChart2 size={20} />, label: "Success Rate", value: `${stats.swap_success_rate}%`, color: "#C2FF41" },
  ] : [];

  return (
    <RequireAdmin>
      <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#24402E" }}>
              <ShieldCheck size={20} color="#C2FF41" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-[#171A18]">Admin Panel</h1>
              <p className="text-[#58605A] text-sm">Platform management and analytics</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-2xl p-1 mb-8 overflow-x-auto" style={{ background: "#EBE8DF" }}>
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} data-testid={`admin-tab-${t}`}
                className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                style={{ background: tab === t ? "#24402E" : "transparent", color: tab === t ? "#fff" : "#58605A" }}>
                {t}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {statCards.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    data-testid={`stat-${s.label.toLowerCase().replace(/ /g, "-")}`}
                    className="bg-white rounded-2xl p-4 border text-center" style={{ borderColor: "#DCD9CE" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
                    <div className="font-heading font-black text-2xl" style={{ color: "#171A18" }}>{s.value}</div>
                    <div className="text-xs text-[#58605A] mt-0.5 leading-tight">{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: "#DCD9CE" }}>
                <h3 className="font-heading font-semibold text-[#171A18] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Manage Users", tab: "users", icon: <Users size={16} /> },
                    { label: "Review Listings", tab: "listings", icon: <Package size={16} /> },
                    { label: "Monitor Swaps", tab: "swaps", icon: <Repeat2 size={16} /> },
                  ].map((a) => (
                    <button key={a.tab} onClick={() => setTab(a.tab)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl font-medium text-sm transition-colors"
                      style={{ background: "#F7F6F2", color: "#171A18", border: "1px solid #DCD9CE" }}>
                      <span style={{ color: "#24402E" }}>{a.icon}</span> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <h3 className="font-heading font-semibold text-lg text-[#171A18] mb-5">User Management ({users.length})</h3>
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#DCD9CE" }}>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="users-table">
                    <thead>
                      <tr style={{ background: "#F7F6F2", borderBottom: "1px solid #DCD9CE" }}>
                        {["Name", "Email", "Role", "Location", "Swaps", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#58605A]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="text-center py-8 text-[#A4ACA6]">Loading...</td></tr>
                      ) : users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-[#F7F6F2] transition-colors" style={{ borderColor: "#DCD9CE" }}>
                          <td className="px-4 py-3 text-sm font-medium text-[#171A18]">{u.name}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: u.role === "admin" ? "#EDE7F6" : "#E8F5E9", color: u.role === "admin" ? "#4527A0" : "#2E7D32" }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{u.location || "—"}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{u.swap_count || 0}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: u.status === "banned" ? "#FFEBEE" : "#E8F5E9", color: u.status === "banned" ? "#C62828" : "#2E7D32" }}>
                              {u.status || "active"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.role !== "admin" && (
                              <button onClick={() => handleBanUser(u.id)} data-testid={`ban-user-${u.id}`}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                                style={{ border: "1px solid #FFCDD2", color: u.status === "banned" ? "#2E7D32" : "#D32F2F",
                                         background: u.status === "banned" ? "#E8F5E9" : "#FFF5F5" }}>
                                {u.status === "banned" ? <CheckCircle size={12} /> : <Ban size={12} />}
                                {u.status === "banned" ? "Unban" : "Ban"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "listings" && (
            <div>
              <h3 className="font-heading font-semibold text-lg text-[#171A18] mb-5">Listing Management ({listings.length})</h3>
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#DCD9CE" }}>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="listings-table">
                    <thead>
                      <tr style={{ background: "#F7F6F2", borderBottom: "1px solid #DCD9CE" }}>
                        {["Title", "Category", "Brand", "Value", "User", "Status", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#58605A]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="text-center py-8 text-[#A4ACA6]">Loading...</td></tr>
                      ) : listings.map((l) => (
                        <tr key={l.id} className="border-b hover:bg-[#F7F6F2] transition-colors" style={{ borderColor: "#DCD9CE" }}>
                          <td className="px-4 py-3 text-sm font-medium text-[#171A18] max-w-[180px] truncate">{l.title}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{l.category}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{l.brand}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#24402E]">{formatRupees(l.estimated_value)}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{l.user_name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: l.status === "available" ? "#E8F5E9" : l.status === "removed" ? "#FFEBEE" : "#FFF3E0",
                                       color: l.status === "available" ? "#2E7D32" : l.status === "removed" ? "#C62828" : "#E65100" }}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {l.status !== "removed" && (
                              <button onClick={() => handleRemoveListing(l.id)} data-testid={`remove-listing-${l.id}`}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                                style={{ border: "1px solid #FFCDD2", color: "#D32F2F", background: "#FFF5F5" }}>
                                <Trash2 size={12} /> Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "swaps" && (
            <div>
              <h3 className="font-heading font-semibold text-lg text-[#171A18] mb-5">Swap Activity ({swaps.length})</h3>
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#DCD9CE" }}>
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="swaps-table">
                    <thead>
                      <tr style={{ background: "#F7F6F2", borderBottom: "1px solid #DCD9CE" }}>
                        {["Offered Item", "Requested Item", "Requester", "Target User", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#58605A]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} className="text-center py-8 text-[#A4ACA6]">Loading...</td></tr>
                      ) : swaps.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-[#F7F6F2] transition-colors" style={{ borderColor: "#DCD9CE" }}>
                          <td className="px-4 py-3 text-sm text-[#171A18] max-w-[140px] truncate">{s.offered_listing_title}</td>
                          <td className="px-4 py-3 text-sm text-[#171A18] max-w-[140px] truncate">{s.requested_listing_title}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{s.requester_name}</td>
                          <td className="px-4 py-3 text-sm text-[#58605A]">{s.target_user_name}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                background: s.status === "completed" ? "#E8F5E9" : s.status === "accepted" ? "#EDE7F6" : s.status === "rejected" ? "#FFEBEE" : "#FFF3E0",
                                color: s.status === "completed" ? "#2E7D32" : s.status === "accepted" ? "#4527A0" : s.status === "rejected" ? "#C62828" : "#E65100"
                              }}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#A4ACA6]">
                            {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireAdmin>
  );
}
