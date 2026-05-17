import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, MessageSquare, ArrowLeft, Repeat2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { RequireAuth, useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function formatTime(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(searchParams.get("room") || null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get("/api/chat/rooms");
      setRooms(res.data);
    } catch (_) {} finally {
      setRoomsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (roomId) => {
    if (!roomId) return;
    setMsgLoading(true);
    try {
      const res = await api.get(`/api/chat/rooms/${roomId}/messages`);
      setMessages(res.data);
    } catch (_) {} finally {
      setMsgLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // WebSocket connection
  useEffect(() => {
    if (!selectedRoom || !user) return;

    fetchMessages(selectedRoom);

    // Close previous WS
    if (wsRef.current) wsRef.current.close();

    const wsBase = BACKEND_URL.replace("https://", "wss://").replace("http://", "ws://");
    const ws = new WebSocket(`${wsBase}/api/ws/${selectedRoom}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.created_at === data.created_at && m.sender_id === data.sender_id && m.text === data.text)) return prev;
            return [...prev, data];
          });
        }
      } catch (_) {}
    };

    ws.onerror = () => {
      // Fallback: poll every 3s
      pollRef.current = setInterval(() => fetchMessages(selectedRoom), 3000);
    };

    return () => {
      ws.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedRoom, user, BACKEND_URL, fetchMessages]);

  // Stop polling on WS open
  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onopen = () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  });

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedRoom) return;

    // Optimistic update
    const text = newMsg.trim();
    const optimistic = {
      type: "message",
      room_id: selectedRoom,
      sender_id: user.id,
      sender_name: user.name,
      text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMsg("");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(optimistic));
    } else {
      api.post(`/api/chat/rooms/${selectedRoom}/messages`, { text })
        .then((res) => {
          const aiReply = res.data?.ai_reply;
          if (aiReply) setMessages((prev) => [...prev, aiReply]);
          fetchRooms();
        })
        .catch(() => {
          fetchMessages(selectedRoom);
        });
    }
  };

  const selectedRoomData = rooms.find((r) => r.room_id === selectedRoom);

  return (
    <RequireAuth>
      <div style={{ background: "#F7F6F2", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div className="flex-1 flex max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-5">
          {/* Rooms sidebar */}
          <div className={`${selectedRoom ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 flex-shrink-0`}>
            <h2 className="font-heading font-bold text-xl text-[#171A18] mb-4">Messages</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {roomsLoading ? (
                [...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)
              ) : rooms.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={32} className="mx-auto mb-3 text-[#A4ACA6]" />
                  <p className="text-[#58605A] text-sm">No chats yet</p>
                  <p className="text-xs text-[#A4ACA6] mt-1">Accept a swap request to start chatting</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <button key={room.room_id} data-testid={`room-${room.room_id}`}
                    onClick={() => setSelectedRoom(room.room_id)}
                    className="w-full text-left p-3.5 rounded-xl transition-all"
                    style={{
                      background: selectedRoom === room.room_id ? "#24402E" : "#fff",
                      border: `1px solid ${selectedRoom === room.room_id ? "#24402E" : "#DCD9CE"}`
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: selectedRoom === room.room_id ? "#C2FF41" : "#EBE8DF", color: "#171A18" }}>
                        {room.other_user_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate"
                          style={{ color: selectedRoom === room.room_id ? "#fff" : "#171A18" }}>
                          {room.other_user_name}
                        </div>
                        <div className="text-xs truncate mt-0.5"
                          style={{ color: selectedRoom === room.room_id ? "rgba(255,255,255,0.65)" : "#A4ACA6" }}>
                          {room.last_message || room.offered_listing_title}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
                          style={{
                            background: room.swap_status === "accepted" ? "#E8F5E9" : "#FFF3E0",
                            color: room.swap_status === "accepted" ? "#2E7D32" : "#F57C00"
                          }}>
                          {room.swap_status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "#DCD9CE" }}>
              <button onClick={() => navigate("/swaps")} className="btn-dark w-full py-2.5 text-sm flex items-center justify-center gap-2">
                <Repeat2 size={14} /> View All Swaps
              </button>
            </div>
          </div>

          {/* Chat window */}
          <div className={`${selectedRoom ? "flex" : "hidden md:flex"} flex-col flex-1 bg-white rounded-2xl overflow-hidden`}
            style={{ border: "1px solid #DCD9CE", minHeight: 480 }}>
            {!selectedRoom ? (
              <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EBE8DF" }}>
                  <MessageSquare size={28} color="#A4ACA6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-[#171A18] mb-2">Select a conversation</h3>
                <p className="text-[#58605A] text-sm">Choose a chat from the sidebar to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "#DCD9CE" }}>
                  <button className="md:hidden p-1.5 rounded-lg hover:bg-[#F7F6F2]" onClick={() => setSelectedRoom(null)}>
                    <ArrowLeft size={18} color="#171A18" />
                  </button>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                    style={{ background: "#24402E", color: "#C2FF41" }}>
                    {selectedRoomData?.other_user_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-[#171A18] text-sm">{selectedRoomData?.other_user_name || "Chat"}</div>
                    <div className="text-xs text-[#58605A]">
                      {selectedRoomData?.offered_listing_title} ↔ {selectedRoomData?.requested_listing_title}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: "calc(100vh - 340px)" }}>
                  {msgLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[#24402E] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-[#A4ACA6] text-sm">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          data-testid={`message-${i}`}
                          className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}>
                          {!isMine && (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1"
                              style={{ background: "#24402E" }}>
                              {msg.sender_name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className={isMine ? "chat-bubble-sent" : "chat-bubble-received"}>
                            {!isMine && <div className="text-xs font-semibold text-[#58605A] mb-1">{msg.sender_name}</div>}
                            <p className="text-sm">{msg.text}</p>
                            <div className={`text-xs mt-1 ${isMine ? "text-white/60" : "text-[#A4ACA6]"}`}>
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2.5" style={{ borderColor: "#DCD9CE" }}>
                  <input
                    data-testid="chat-input"
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-1 py-3"
                  />
                  <button data-testid="chat-send-btn" type="submit" disabled={!newMsg.trim()}
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
                    style={{ background: "#24402E" }}>
                    <Send size={16} color="#C2FF41" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
