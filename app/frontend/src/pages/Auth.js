import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api, { formatError } from "../utils/api";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "register" ? "register" : "login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  // Register form
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", location: "" });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    setError("");
  }, [tab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", loginForm);
      login(res.data);
      navigate("/browse");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (regForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", regForm);
      login(res.data);
      navigate("/browse");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F6F2" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: "#24402E" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#C2FF41" }}>
            <Leaf size={18} color="#171A18" />
          </div>
          <span className="font-heading font-bold text-xl text-white">SwapWear</span>
        </Link>
        <div>
          <h2 className="font-heading font-black text-5xl text-white mb-6 leading-tight">
            Fashion<br />without<br /><span style={{ color: "#C2FF41" }}>waste.</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Join thousands of fashion lovers who swap instead of buy. Better for your wallet. Better for the planet.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "50+", label: "Active listings" },
              { stat: "147", label: "Successful swaps" },
              { stat: "0%", label: "Plastic packaging" },
              { stat: "320+", label: "Happy members" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="font-heading font-black text-2xl" style={{ color: "#C2FF41" }}>{s.stat}</div>
                <div className="text-white/60 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© 2025 SwapWear</p>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          {/* Logo mobile */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#C2FF41" }}>
              <Leaf size={15} color="#171A18" />
            </div>
            <span className="font-heading font-bold text-lg text-[#171A18]">SwapWear</span>
          </Link>

          {/* Tab toggle */}
          <div className="flex rounded-full p-1 mb-8 gap-1" style={{ background: "#EBE8DF" }}>
            <button data-testid="tab-login" onClick={() => setTab("login")}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: tab === "login" ? "#24402E" : "transparent", color: tab === "login" ? "#fff" : "#58605A" }}>
              Log in
            </button>
            <button data-testid="tab-register" onClick={() => setTab("register")}
              className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: tab === "register" ? "#24402E" : "transparent", color: tab === "register" ? "#fff" : "#58605A" }}>
              Sign up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div data-testid="auth-error" className="rounded-xl p-3.5 mb-5 text-sm" style={{ background: "#FEE2E2", color: "#DC2626" }}>
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} data-testid="login-form">
              <h2 className="font-heading font-bold text-2xl text-[#171A18] mb-1">Welcome back</h2>
              <p className="text-[#58605A] text-sm mb-7">Log in to your SwapWear account. Demo: demo@swapwear.local / demo123</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Email</label>
                  <input data-testid="login-email" type="email" required placeholder="you@example.com"
                    className="input-field" value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Password</label>
                  <div className="relative">
                    <input data-testid="login-password" type={showPw ? "text" : "password"} required placeholder="Your password"
                      className="input-field pr-11" value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4ACA6] hover:text-[#58605A]">
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </div>
              <button data-testid="login-submit" type="submit" disabled={loading}
                className="btn-lime w-full mt-7 py-3.5 text-base flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-[#171A18]/30 border-t-[#171A18] rounded-full animate-spin" /> : <><span>Log in</span><ArrowRight size={18} /></>}
              </button>
              <p className="text-center text-sm text-[#58605A] mt-5">
                No account? <button type="button" onClick={() => setTab("register")} className="text-[#24402E] font-semibold hover:underline">Sign up free</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} data-testid="register-form">
              <h2 className="font-heading font-bold text-2xl text-[#171A18] mb-1">Create account</h2>
              <p className="text-[#58605A] text-sm mb-7">Start swapping sustainable fashion today</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Full Name</label>
                  <input data-testid="register-name" type="text" required placeholder="Your name"
                    className="input-field" value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Email</label>
                  <input data-testid="register-email" type="email" required placeholder="you@example.com"
                    className="input-field" value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Password</label>
                  <div className="relative">
                    <input data-testid="register-password" type={showPw ? "text" : "password"} required placeholder="Min. 6 characters"
                      className="input-field pr-11" value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4ACA6] hover:text-[#58605A]">
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#58605A] mb-1.5">Location (Optional)</label>
                  <input data-testid="register-location" type="text" placeholder="City, State"
                    className="input-field" value={regForm.location}
                    onChange={(e) => setRegForm({ ...regForm, location: e.target.value })} />
                </div>
              </div>
              <button data-testid="register-submit" type="submit" disabled={loading}
                className="btn-lime w-full mt-7 py-3.5 text-base flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-[#171A18]/30 border-t-[#171A18] rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={18} /></>}
              </button>
              <p className="text-center text-sm text-[#58605A] mt-5">
                Already have an account? <button type="button" onClick={() => setTab("login")} className="text-[#24402E] font-semibold hover:underline">Log in</button>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
