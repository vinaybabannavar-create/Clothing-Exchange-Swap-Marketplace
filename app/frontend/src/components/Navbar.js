import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Leaf, Menu, X, Repeat2, MessageSquare, LayoutDashboard, ShieldCheck, Plus, ChevronDown, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      data-testid="navbar"
      className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(247,246,242,0.92)", backdropFilter: "blur(16px)", borderColor: "#DCD9CE" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#C2FF41" }}>
              <Leaf size={16} color="#171A18" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-lg" style={{ color: "#171A18" }}>SwapWear</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/browse" data-testid="nav-browse"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/browse") ? "bg-[#EBE8DF] text-[#24402E]" : "text-[#58605A] hover:text-[#171A18] hover:bg-[#EBE8DF]"}`}>
              Browse
            </Link>
            {user && (
              <>
                <Link to="/swaps" data-testid="nav-swaps"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/swaps") ? "bg-[#EBE8DF] text-[#24402E]" : "text-[#58605A] hover:text-[#171A18] hover:bg-[#EBE8DF]"}`}>
                  <Repeat2 size={15} /> Swaps
                </Link>
                <Link to="/chat" data-testid="nav-chat"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/chat") ? "bg-[#EBE8DF] text-[#24402E]" : "text-[#58605A] hover:text-[#171A18] hover:bg-[#EBE8DF]"}`}>
                  <MessageSquare size={15} /> Chat
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" data-testid="nav-add-listing">
                  <button className="btn-lime flex items-center gap-1.5 text-sm py-2 px-4">
                    <Plus size={14} /> List Item
                  </button>
                </Link>
                <div className="relative">
                  <button
                    data-testid="nav-user-menu"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-[#EBE8DF]"
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "#24402E" }}>
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-[#171A18]">{user.name?.split(" ")[0]}</span>
                    <ChevronDown size={14} color="#58605A" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[#DCD9CE] shadow-lg py-1 z-50">
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#171A18] hover:bg-[#F7F6F2]">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      {user.role === "admin" && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#171A18] hover:bg-[#F7F6F2]">
                          <ShieldCheck size={15} /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-[#DCD9CE]" />
                      <button onClick={handleLogout} data-testid="nav-logout"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth" data-testid="nav-login">
                  <button className="btn-outline text-sm py-2 px-4">Log in</button>
                </Link>
                <Link to="/auth?tab=register" data-testid="nav-register">
                  <button className="btn-dark text-sm py-2 px-4">Sign up free</button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} data-testid="nav-mobile-toggle">
            {mobileOpen ? <X size={22} color="#171A18" /> : <Menu size={22} color="#171A18" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1" style={{ borderColor: "#DCD9CE" }}>
          <Link to="/browse" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#171A18] hover:bg-[#F7F6F2]">Browse</Link>
          {user ? (
            <>
              <Link to="/swaps" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#171A18] hover:bg-[#F7F6F2]">Swaps</Link>
              <Link to="/chat" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#171A18] hover:bg-[#F7F6F2]">Chat</Link>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#171A18] hover:bg-[#F7F6F2]">Dashboard</Link>
              {user.role === "admin" && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#24402E] hover:bg-[#F7F6F2]">Admin Panel</Link>}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#171A18] hover:bg-[#F7F6F2]">Log in</Link>
              <Link to="/auth?tab=register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#24402E] font-semibold hover:bg-[#F7F6F2]">Sign up free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
