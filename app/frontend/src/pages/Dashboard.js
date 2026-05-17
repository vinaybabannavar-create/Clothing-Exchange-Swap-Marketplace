import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Package, User, MapPin, BarChart2, Repeat2, X, Upload, Loader2, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import { RequireAuth, useAuth } from "../contexts/AuthContext";
import api, { formatError } from "../utils/api";
import { formatRupees } from "../utils/currency";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Shoes", "Outerwear", "Accessories", "Activewear", "Formal"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "6", "7", "8", "9", "9.5", "10", "10.5", "11"];
const CONDITIONS = ["Like New", "Excellent", "Good", "Fair", "Poor"];

function getImageUrl(img) {
  if (!img) return null;
  return img.startsWith("http") ? img : `${BACKEND_URL}/api/files/${img}`;
}

const emptyForm = { title: "", description: "", category: "Tops", brand: "", size: "M", condition: "Good", estimated_value: "", images: [], location: "" };

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [tab, setTab] = useState("listings");
  const [showModal, setShowModal] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", bio: "", location: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", bio: user.bio || "", location: user.location || "" });
      fetchListings();
      fetchSwaps();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      const res = await api.get("/api/listings/user/me");
      setListings(res.data);
    } catch (_) {}
  };

  const fetchSwaps = async () => {
    try {
      const res = await api.get("/api/swaps");
      setSwaps(res.data);
    } catch (_) {}
  };

  const openAddModal = () => {
    setEditListing(null);
    setForm({ ...emptyForm, location: user?.location || "" });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (listing) => {
    setEditListing(listing);
    setForm({
      title: listing.title, description: listing.description, category: listing.category,
      brand: listing.brand, size: listing.size, condition: listing.condition,
      estimated_value: String(listing.estimated_value), images: listing.images || [], location: listing.location || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm((f) => ({ ...f, images: [...f.images, res.data.storage_path] }));
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const getAiEstimate = async () => {
    if (!form.brand || !form.category || !form.condition) return;
    setAiLoading(true);
    try {
      const res = await api.post("/api/calculator/estimate", {
        brand: form.brand, category: form.category, size: form.size,
        condition: form.condition, title: form.title,
      });
      setForm((f) => ({ ...f, estimated_value: String(res.data.estimated_value) }));
    } catch (_) {} finally {
      setAiLoading(false);
    }
  };

  const handleSaveListing = async (e) => {
    e.preventDefault();
    if (!form.title || !form.brand) { setFormError("Title and brand are required"); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, estimated_value: parseFloat(form.estimated_value) || 0 };
      if (editListing) {
        await api.put(`/api/listings/${editListing.id}`, payload);
      } else {
        await api.post("/api/listings", payload);
      }
      await fetchListings();
      setShowModal(false);
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/api/listings/${listingId}`);
      fetchListings();
    } catch (e) { alert(formatError(e)); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/api/users/me", profileForm);
      await refreshUser();
      setProfileEdit(false);
    } catch (_) {} finally {
      setSavingProfile(false);
    }
  };

  const completedSwaps = swaps.filter((s) => s.status === "completed").length;
  const pendingSwaps = swaps.filter((s) => s.status === "pending").length;

  return (
    <RequireAuth>
      <div style={{ background: "#F7F6F2", minHeight: "100vh" }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Profile section */}
          <div className="bg-white rounded-3xl p-6 mb-6 border" style={{ borderColor: "#DCD9CE" }}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "#24402E" }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#171A18]">{user?.name}</h2>
                  <p className="text-[#58605A] text-sm">{user?.email}</p>
                  {user?.location && <div className="flex items-center gap-1 mt-1"><MapPin size={12} color="#A4ACA6" /><span className="text-xs text-[#A4ACA6]">{user.location}</span></div>}
                </div>
              </div>
              <button onClick={() => setProfileEdit(!profileEdit)} className="btn-outline text-sm py-2 px-4 flex items-center gap-1.5">
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>
            {user?.bio && <p className="text-[#58605A] text-sm mt-3 ml-20">{user.bio}</p>}

            {/* Profile edit form */}
            {profileEdit && (
              <form onSubmit={handleSaveProfile} className="mt-5 pt-5 border-t" style={{ borderColor: "#DCD9CE" }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Name</label>
                    <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input-field" placeholder="Your name" data-testid="profile-name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Location</label>
                    <input value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="input-field" placeholder="City, State" data-testid="profile-location" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Bio</label>
                    <input value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="input-field" placeholder="Short bio" data-testid="profile-bio" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={savingProfile} data-testid="save-profile-btn" className="btn-dark text-sm py-2 px-5">
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setProfileEdit(false)} className="btn-outline text-sm py-2 px-5">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: <Package size={18} />, value: listings.length, label: "Listings" },
              { icon: <Repeat2 size={18} />, value: completedSwaps, label: "Completed Swaps" },
              { icon: <BarChart2 size={18} />, value: pendingSwaps, label: "Pending" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border text-center" style={{ borderColor: "#DCD9CE" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: "#EBE8DF", color: "#24402E" }}>{s.icon}</div>
                <div className="font-heading font-black text-2xl text-[#24402E]">{s.value}</div>
                <div className="text-xs text-[#58605A] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs + content */}
          <div className="flex gap-1 rounded-2xl p-1 mb-6" style={{ background: "#EBE8DF" }}>
            {["listings", "swaps"].map((t) => (
              <button key={t} onClick={() => setTab(t)} data-testid={`dashboard-tab-${t}`}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                style={{ background: tab === t ? "#24402E" : "transparent", color: tab === t ? "#fff" : "#58605A" }}>
                {t === "listings" ? "My Listings" : "Swap History"}
              </button>
            ))}
          </div>

          {tab === "listings" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-lg text-[#171A18]">My Listings</h3>
                <button onClick={openAddModal} data-testid="add-listing-btn"
                  className="btn-lime flex items-center gap-1.5 text-sm py-2 px-4">
                  <Plus size={14} /> Add Listing
                </button>
              </div>
              {listings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: "#DCD9CE" }}>
                  <Package size={32} className="mx-auto mb-3 text-[#A4ACA6]" />
                  <p className="text-[#58605A] mb-4">No listings yet. Start by adding clothes you want to swap!</p>
                  <button onClick={openAddModal} className="btn-dark text-sm py-2.5 px-6 flex items-center gap-2 mx-auto">
                    <Plus size={14} /> Add Your First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <motion.div key={listing.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl overflow-hidden border" style={{ borderColor: "#DCD9CE" }}>
                      <div className="relative" style={{ height: 160 }}>
                        <img src={getImageUrl(listing.images?.[0]) || "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=400&fit=crop"}
                          alt={listing.title} className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=400&fit=crop"; }} />
                        <span className="absolute top-2 left-2 badge-category">{listing.category}</span>
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${listing.status === "available" ? "" : ""}`}
                          style={{ background: listing.status === "available" ? "#E8F5E9" : "#FFF3E0", color: listing.status === "available" ? "#2E7D32" : "#F57C00" }}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="p-3.5">
                        <h4 className="font-semibold text-sm text-[#171A18] truncate mb-0.5">{listing.title}</h4>
                        <p className="text-xs text-[#58605A] mb-3">{listing.brand} · {formatRupees(listing.estimated_value)}</p>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(listing)} data-testid={`edit-listing-${listing.id}`}
                            className="flex-1 text-xs py-2 rounded-lg border font-medium transition-colors hover:bg-[#F7F6F2]"
                            style={{ border: "1px solid #DCD9CE", color: "#58605A" }}>
                            <Edit2 size={12} className="inline mr-1" /> Edit
                          </button>
                          <button onClick={() => handleDelete(listing.id)} data-testid={`delete-listing-${listing.id}`}
                            className="flex-1 text-xs py-2 rounded-lg border font-medium transition-colors"
                            style={{ border: "1px solid #FFCDD2", color: "#D32F2F", background: "#FFF5F5" }}>
                            <Trash2 size={12} className="inline mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "swaps" && (
            <div>
              <h3 className="font-heading font-semibold text-lg text-[#171A18] mb-4">Swap History</h3>
              {swaps.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: "#DCD9CE" }}>
                  <Repeat2 size={32} className="mx-auto mb-3 text-[#A4ACA6]" />
                  <p className="text-[#58605A]">No swap activity yet</p>
                  <button onClick={() => navigate("/browse")} className="btn-dark text-sm py-2.5 px-6 mt-4 mx-auto block">Browse Items</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {swaps.map((s) => (
                    <div key={s.id} className="bg-white rounded-2xl p-4 border flex items-center gap-4" style={{ borderColor: "#DCD9CE" }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#171A18] truncate">{s.offered_listing_title} ↔ {s.requested_listing_title}</div>
                        <div className="text-xs text-[#58605A] mt-0.5">with {s.requester_id === user?.id ? s.target_user_name : s.requester_name}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
                        style={{
                          background: s.status === "completed" ? "#E8F5E9" : s.status === "accepted" ? "#EDE7F6" : s.status === "rejected" ? "#FFEBEE" : "#FFF3E0",
                          color: s.status === "completed" ? "#2E7D32" : s.status === "accepted" ? "#4527A0" : s.status === "rejected" ? "#C62828" : "#E65100"
                        }}>
                        {s.status}
                      </span>
                      {s.status !== "rejected" && (
                        <button onClick={() => navigate(`/chat?room=${s.id}`)} className="btn-outline text-xs py-1.5 px-3">Chat</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Listing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-lg my-4"
            data-testid="listing-modal">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-xl text-[#171A18]">{editListing ? "Edit Listing" : "Add New Listing"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[#F7F6F2]"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Title *</label>
                <input data-testid="listing-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Vintage Levi's 501 Jeans" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Description</label>
                <textarea data-testid="listing-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe condition, fit, details..." className="input-field resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Category</label>
                  <select data-testid="listing-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field text-sm">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Brand *</label>
                  <input data-testid="listing-brand" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Nike" className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Size</label>
                  <select data-testid="listing-size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="input-field text-sm">
                    {SIZES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Condition</label>
                  <select data-testid="listing-condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input-field text-sm">
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Est. Value (INR)</label>
                  <input data-testid="listing-value" type="number" min="0" step="0.01" value={form.estimated_value}
                    onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
                    placeholder="0" className="input-field text-sm" />
                </div>
                <button type="button" onClick={getAiEstimate} disabled={aiLoading || !form.brand}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  style={{ background: "#C2FF41", color: "#171A18" }} data-testid="ai-estimate-listing-btn">
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City, State" className="input-field text-sm" />
              </div>
              {/* Images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-2">Photos</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: "#DCD9CE" }}>
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=64&h=64&fit=crop"; }} />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.6)" }}>
                        <X size={8} color="#fff" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-[#24402E]"
                    style={{ borderColor: "#DCD9CE" }}>
                    {uploading ? <Loader2 size={16} className="animate-spin text-[#24402E]" /> : <><Upload size={14} color="#A4ACA6" /><span className="text-xs text-[#A4ACA6] mt-0.5">Add</span></>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" data-testid="image-upload" />
                  </label>
                </div>
              </div>
              {formError && <div className="text-sm text-red-600 p-3 rounded-xl bg-red-50">{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} data-testid="save-listing-btn" className="btn-lime flex-1 py-3 text-sm flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : (editListing ? "Update Listing" : "Publish Listing")}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 py-3 text-sm">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </RequireAuth>
  );
}
