import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CITY_COORDS = {
  "Delhi, India": [28.6139, 77.209],
  "Mumbai, India": [19.076, 72.8777],
  "Bengaluru, India": [12.9716, 77.5946],
  "Chennai, India": [13.0827, 80.2707],
  "Pune, India": [18.5204, 73.8567],
  "Hyderabad, India": [17.385, 78.4867],
  "Jaipur, India": [26.9124, 75.7873],
  "Kolkata, India": [22.5726, 88.3639],
  "Ahmedabad, India": [23.0225, 72.5714],
  "Gurugram, India": [28.4595, 77.0266],
  "Noida, India": [28.5355, 77.391],
  "Chandigarh, India": [30.7333, 76.7794],
  "Lucknow, India": [26.8467, 80.9462],
  "Surat, India": [21.1702, 72.8311],
  "Kochi, India": [9.9312, 76.2673],
  "Bhopal, India": [23.2599, 77.4126],
  "Indore, India": [22.7196, 75.8577],
  "Nagpur, India": [21.1458, 79.0882],
};

const CATEGORY_COLORS = {
  Tops: "#4CAF50",
  Bottoms: "#2196F3",
  Dresses: "#E91E63",
  Outerwear: "#FF9800",
  Shoes: "#9C27B0",
  Accessories: "#00BCD4",
  Activewear: "#F44336",
  Formal: "#3F51B5",
};

function formatINR(val) {
  return "₹" + Number(val).toLocaleString("en-IN");
}

export default function MapView({ listings }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) return resolve(window.L);
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Init map centered on India
      const map = L.map(mapRef.current, {
        center: [22.5, 80.0],
        zoom: 5,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // OpenStreetMap tiles (free, no API key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Group listings by city
      const byCity = {};
      listings.forEach((listing) => {
        const loc = listing.location;
        if (!CITY_COORDS[loc]) return;
        if (!byCity[loc]) byCity[loc] = [];
        byCity[loc].push(listing);
      });

      // Add markers
      Object.entries(byCity).forEach(([city, items]) => {
        const [lat, lng] = CITY_COORDS[city];
        const firstItem = items[0];
        const color = CATEGORY_COLORS[firstItem.category] || "#24402E";
        const count = items.length;

        // Custom colored marker
        const icon = L.divIcon({
          html: `
            <div style="
              position:relative;
              width:40px;
              height:40px;
            ">
              <div style="
                background:${color};
                width:38px;
                height:38px;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                border:3px solid white;
                box-shadow:0 3px 12px rgba(0,0,0,0.3);
                display:flex;
                align-items:center;
                justify-content:center;
              ">
                <span style="
                  transform:rotate(45deg);
                  color:white;
                  font-size:12px;
                  font-weight:900;
                  font-family:sans-serif;
                ">${count}</span>
              </div>
            </div>`,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [19, 40],
          popupAnchor: [0, -42],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        // Build popup HTML for up to 3 items
        const itemsHtml = items.slice(0, 3).map((item) => `
          <div style="
            display:flex;
            align-items:center;
            gap:10px;
            padding:8px;
            border-radius:10px;
            background:#F7F6F2;
            margin-bottom:6px;
            cursor:pointer;
          " onclick="window.__swapNavigate('${item.id}')">
            <img src="${item.images?.[0] || ''}"
              style="width:44px;height:44px;border-radius:8px;object-fit:cover;flex-shrink:0;"
              onerror="this.src='https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=44&h=44&fit=crop'"
            />
            <div style="min-width:0;flex:1;">
              <div style="font-weight:700;font-size:12px;color:#171A18;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</div>
              <div style="font-size:11px;color:#58605A;">${item.brand} · ${item.size} · ${item.condition}</div>
              <div style="font-size:12px;font-weight:700;color:#24402E;">${formatINR(item.estimated_value)}</div>
            </div>
          </div>
        `).join("");

        const moreText = items.length > 3 ? `<div style="text-align:center;font-size:11px;color:#58605A;margin-top:4px;">+${items.length - 3} more in ${city.split(",")[0]}</div>` : "";

        const popup = L.popup({ maxWidth: 260, minWidth: 240 }).setContent(`
          <div style="font-family:sans-serif;">
            <div style="
              display:flex;
              align-items:center;
              gap:6px;
              margin-bottom:10px;
              padding-bottom:8px;
              border-bottom:1px solid #DCD9CE;
            ">
              <div style="
                width:10px;height:10px;border-radius:50%;
                background:${color};flex-shrink:0;
              "></div>
              <span style="font-weight:800;font-size:13px;color:#171A18;">${city.split(",")[0]}</span>
              <span style="
                background:#EBE8DF;
                color:#58605A;
                font-size:11px;
                font-weight:700;
                padding:2px 8px;
                border-radius:20px;
                margin-left:auto;
              ">${count} item${count !== 1 ? "s" : ""}</span>
            </div>
            ${itemsHtml}
            ${moreText}
          </div>
        `);

        marker.bindPopup(popup);
      });
    });

    // Expose navigation to popup onclick
    window.__swapNavigate = (id) => navigate(`/listings/${id}`);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings, navigate]);

  return (
    <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid #DCD9CE" }}>
      <div ref={mapRef} style={{ height: "520px", width: "100%", background: "#EBE8DF" }} />

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        background: "white",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 1000,
        maxWidth: 180,
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#58605A", marginBottom: 8 }}>Categories</div>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#171A18", fontWeight: 600 }}>{cat}</span>
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
        background: "#24402E",
        color: "#C2FF41",
        borderRadius: 10,
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 800,
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}>
        📍 {listings.length} items across India
      </div>
    </div>
  );
}
