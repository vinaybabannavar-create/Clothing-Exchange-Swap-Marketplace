import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Recycle, Users, ShoppingBag, Star, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import api from "../utils/api";

const heroImg = "https://static.prod-images.emergentagent.com/jobs/36f04dd2-9720-4e7d-b24e-6bfccd641e74/images/9d90af3563d8d5cd251f046849762ce60628c56183d84623320cfab3e0596de6.png";
const communityImg = "https://images.unsplash.com/photo-1591955156780-ce3a7b8a257b?w=800&h=500&fit=crop";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const steps = [
  { icon: <ShoppingBag size={24} />, title: "List Your Clothes", desc: "Upload photos and details of clothes you no longer wear." },
  { icon: <Recycle size={24} />, title: "Find a Match", desc: "Browse others' listings and send a swap request." },
  { icon: <CheckCircle size={24} />, title: "Swap & Ship", desc: "Chat, agree on terms, and exchange items locally or by mail." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ listings: 0, swaps: 0, users: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/listings?limit=6&sort=newest")
      .then((r) => setFeatured(r.data.listings || []))
      .catch(() => {});
    Promise.all([
      api.get("/api/listings?limit=1"),
    ]).then(([listRes]) => {
      setStats({ listings: listRes.data.total || 0, swaps: 147, users: 320 });
    }).catch(() => {});
  }, []);

  return (
    <div className="App" style={{ background: "#F7F6F2" }}>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "#F7F6F2", minHeight: "82vh", display: "flex", alignItems: "center" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(194,255,65,0.2)", border: "1px solid rgba(36,64,46,0.15)" }}>
                <Leaf size={13} color="#24402E" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#24402E]">Sustainable Fashion</span>
              </div>
              <h1 className="font-heading font-black leading-none mb-6" style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", color: "#171A18", letterSpacing: "-0.03em" }}>
                Swap Your<br />
                <span style={{ color: "#24402E" }}>Wardrobe,</span><br />
                <span style={{ WebkitTextStroke: "2px #24402E", color: "transparent" }}>Not the Planet</span>
              </h1>
              <p className="text-[#58605A] text-lg mb-8 max-w-md leading-relaxed">
                Trade clothes you don't wear for things you'll love — without spending a dime. Join thousands building a more sustainable wardrobe.
              </p>
              <div className="flex flex-wrap gap-3">
                <button data-testid="hero-browse-btn" onClick={() => navigate("/browse")} className="btn-lime flex items-center gap-2 text-base px-7 py-3.5 lime-glow">
                  Browse Listings <ArrowRight size={18} />
                </button>
                <button data-testid="hero-list-btn" onClick={() => navigate("/auth?tab=register")} className="btn-outline text-base px-7 py-3.5">
                  Start Swapping Free
                </button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative hidden lg:block">
              <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 30px 80px rgba(36,64,46,0.18)" }}>
                <img src={heroImg} alt="SwapWear marketplace" className="w-full h-[520px] object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-[#DCD9CE]" style={{ minWidth: 160 }}>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={14} fill="#C2FF41" color="#C2FF41" />
                  <span className="text-xs font-bold text-[#171A18]">Top Swap</span>
                </div>
                <p className="text-xs text-[#58605A]">Vintage Levi's ↔ Nike Air Force 1</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10" style={{ background: "#24402E" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: stats.listings || "50+", label: "Items Listed" },
              { value: "147+", label: "Successful Swaps" },
              { value: "320+", label: "Happy Members" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="font-heading font-black text-3xl sm:text-4xl" style={{ color: "#C2FF41" }}>{s.value}</div>
                <div className="text-white/70 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#24402E] block mb-3">The Process</span>
            <h2 className="font-heading font-bold text-4xl text-[#171A18]">How SwapWear Works</h2>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} variants={item} className="text-center p-8 rounded-3xl" style={{ background: "#fff", border: "1px solid #DCD9CE" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#C2FF41", color: "#171A18" }}>
                  {s.icon}
                </div>
                <div className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mx-auto mb-3" style={{ background: "#24402E", color: "#fff" }}>{i + 1}</div>
                <h3 className="font-heading font-semibold text-lg text-[#171A18] mb-2">{s.title}</h3>
                <p className="text-[#58605A] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="py-16 px-4" style={{ background: "#EBE8DF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#24402E] block mb-2">Fresh Finds</span>
              <h2 className="font-heading font-bold text-3xl text-[#171A18]">Latest Listings</h2>
            </div>
            <Link to="/browse" className="btn-outline text-sm py-2 px-5 hidden sm:block">View all</Link>
          </div>
          {featured.length > 0 ? (
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((l) => <ListingCard key={l.id} listing={l} variants={item} />)}
            </motion.div>
          ) : (
            <div className="text-center py-16 text-[#58605A]">
              <Recycle size={40} className="mx-auto mb-3 opacity-40" />
              <p>No listings yet. Be the first to list!</p>
            </div>
          )}
          <div className="text-center mt-8 sm:hidden">
            <Link to="/browse"><button className="btn-outline">View all listings</button></Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2" style={{ background: "#24402E" }}>
            <div className="p-12 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: "#C2FF41" }}>Why SwapWear</span>
              <h2 className="font-heading font-bold text-3xl text-white mb-5">Fashion that doesn't cost the Earth</h2>
              <p className="text-white/70 mb-8 leading-relaxed">Every swap keeps clothes out of landfills. Every exchange saves water, energy, and money. Join a community that believes fashion can be fun AND sustainable.</p>
              <div className="flex flex-col gap-3">
                {["Zero monetary transactions — pure barter economy", "Location-based matching for easy local swaps", "AI-powered value estimation for fair trades"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} color="#C2FF41" />
                    <span className="text-white/80 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/auth?tab=register">
                  <button data-testid="community-cta-btn" className="btn-lime text-base px-7 py-3">Join the Community</button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img src={communityImg} alt="Community" className="w-full h-full object-cover" style={{ maxHeight: 420 }} />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: "#DCD9CE", background: "#F7F6F2" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#C2FF41" }}>
              <Leaf size={13} color="#171A18" />
            </div>
            <span className="font-heading font-bold text-[#171A18]">SwapWear</span>
          </div>
          <p className="text-[#A4ACA6] text-sm">© 2025 SwapWear. Sustainable fashion for everyone.</p>
          <div className="flex gap-5 text-sm text-[#58605A]">
            <Link to="/browse" className="hover:text-[#24402E]">Browse</Link>
            <Link to="/auth" className="hover:text-[#24402E]">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
