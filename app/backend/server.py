import json
import os
import urllib.error
import urllib.request
import hashlib
import hmac
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr


app = FastAPI(title="SwapWear API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_local_env() -> None:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ[key.strip()] = value.strip().strip('"').strip("'")


load_local_env()


demo_user = {
    "id": "user-demo",
    "name": "Aarav Sharma",
    "email": "demo@swapwear.local",
    "bio": "Building a smaller, better wardrobe through swaps.",
    "location": "Delhi, India",
    "is_admin": True,
    "role": "admin",
    "status": "active",
    "swap_count": 8,
    "password_hash": hashlib.sha256("demo123".encode("utf-8")).hexdigest(),
    "created_at": now(),
}

users: list[dict[str, Any]] = [demo_user]
listings: list[dict[str, Any]] = [
    {
        "id": "lst-1",
        "title": "Linen Summer Shirt",
        "description": "Breathable olive linen shirt, barely worn and perfect for warm days.",
        "category": "Tops",
        "brand": "Uniqlo",
        "size": "M",
        "condition": "Excellent",
        "estimated_value": 2300,
        "images": ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&h=1100&fit=crop"],
        "location": "Delhi, India",
        "owner_id": "user-demo",
        "owner_name": "Aarav Sharma",
        "created_at": now(),
    },
    {
        "id": "lst-2",
        "title": "Vintage Denim Jacket",
        "description": "Classic denim jacket with a relaxed fit and soft worn-in texture.",
        "category": "Outerwear",
        "brand": "Levi's",
        "size": "L",
        "condition": "Good",
        "estimated_value": 3700,
        "images": ["https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=900&h=1100&fit=crop"],
        "location": "Mumbai, India",
        "owner_id": "user-2",
        "owner_name": "Maya Kapoor",
        "created_at": now(),
    },
    {
        "id": "lst-3",
        "title": "White Court Sneakers",
        "description": "Clean white sneakers, easy to style with casual and smart looks.",
        "category": "Shoes",
        "brand": "Adidas",
        "size": "9",
        "condition": "Like New",
        "estimated_value": 4600,
        "images": ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&h=1100&fit=crop"],
        "location": "Bengaluru, India",
        "owner_id": "user-3",
        "owner_name": "Riya Menon",
        "created_at": now(),
    },
    {
        "id": "lst-4",
        "title": "Floral Midi Dress",
        "description": "Soft floral dress with a flattering waist and easy weekend feel.",
        "category": "Dresses",
        "brand": "H&M",
        "size": "S",
        "condition": "Excellent",
        "estimated_value": 2800,
        "images": ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1100&fit=crop"],
        "location": "Pune, India",
        "owner_id": "user-4",
        "owner_name": "Nisha Rao",
        "created_at": now(),
    },
    {
        "id": "lst-5",
        "title": "Black Tailored Trousers",
        "description": "High-waist trousers with a clean taper, great for office or dinner looks.",
        "category": "Bottoms",
        "brand": "Zara",
        "size": "M",
        "condition": "Like New",
        "estimated_value": 3500,
        "images": ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&h=1100&fit=crop"],
        "location": "Hyderabad, India",
        "owner_id": "user-5",
        "owner_name": "Kabir Sethi",
        "created_at": now(),
    },
    {
        "id": "lst-6",
        "title": "Canvas Tote Bag",
        "description": "Roomy everyday tote with sturdy handles and a minimal print.",
        "category": "Accessories",
        "brand": "Muji",
        "size": "M",
        "condition": "Good",
        "estimated_value": 1500,
        "images": ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&h=1100&fit=crop"],
        "location": "Chennai, India",
        "owner_id": "user-6",
        "owner_name": "Ira Thomas",
        "created_at": now(),
    },
    {
        "id": "lst-7",
        "title": "Cropped Workout Hoodie",
        "description": "Lightweight hoodie for gym days, walks, and relaxed travel outfits.",
        "category": "Activewear",
        "brand": "Nike",
        "size": "XS",
        "condition": "Excellent",
        "estimated_value": 3000,
        "images": ["https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=900&h=1100&fit=crop"],
        "location": "Ahmedabad, India",
        "owner_id": "user-7",
        "owner_name": "Meera Shah",
        "created_at": now(),
    },
    {
        "id": "lst-8",
        "title": "Navy Blazer",
        "description": "Structured single-breasted blazer that dresses up denim or formal pants.",
        "category": "Formal",
        "brand": "Mango",
        "size": "L",
        "condition": "Good",
        "estimated_value": 4800,
        "images": ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&h=1100&fit=crop"],
        "location": "Kolkata, India",
        "owner_id": "user-8",
        "owner_name": "Dev Banerjee",
        "created_at": now(),
    },
    {
        "id": "lst-9",
        "title": "Striped Cotton Kurta",
        "description": "Comfortable cotton kurta with a subtle stripe, perfect for daily wear.",
        "category": "Tops",
        "brand": "Fabindia",
        "size": "XL",
        "condition": "Excellent",
        "estimated_value": 2600,
        "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&h=1100&fit=crop"],
        "location": "Jaipur, India",
        "owner_id": "user-9",
        "owner_name": "Sana Ali",
        "created_at": now(),
    },
    {
        "id": "lst-10",
        "title": "Pleated Mini Skirt",
        "description": "Charcoal pleated skirt with a crisp shape and plenty of styling options.",
        "category": "Bottoms",
        "brand": "Forever 21",
        "size": "S",
        "condition": "Fair",
        "estimated_value": 1300,
        "images": ["https://images.unsplash.com/photo-1583496661160-fb5886a13d24?w=900&h=1100&fit=crop"],
        "location": "Gurugram, India",
        "owner_id": "user-10",
        "owner_name": "Tara Gill",
        "created_at": now(),
    },
]

swaps: list[dict[str, Any]] = [
    {
        "id": "swap-1",
        "requester_id": "user-4",
        "requester_name": "Nisha Rao",
        "target_user_id": "user-demo",
        "target_user_name": "Aarav Sharma",
        "offered_listing_id": "lst-4",
        "offered_listing_title": "Floral Midi Dress",
        "offered_listing_image": listings[3]["images"][0],
        "requested_listing_id": "lst-1",
        "requested_listing_title": "Linen Summer Shirt",
        "requested_listing_image": listings[0]["images"][0],
        "message": "I love the linen shirt. My dress is in excellent condition and ready to ship.",
        "status": "pending",
        "match_score": 94,
        "eco_impact": "Saves around 2.8 kg CO2 compared with buying new.",
        "suggested_action": "High-value match: accept if the dress fits your style.",
        "created_at": now(),
    },
    {
        "id": "swap-2",
        "requester_id": "user-7",
        "requester_name": "Meera Shah",
        "target_user_id": "user-demo",
        "target_user_name": "Aarav Sharma",
        "offered_listing_id": "lst-7",
        "offered_listing_title": "Cropped Workout Hoodie",
        "offered_listing_image": listings[6]["images"][0],
        "requested_listing_id": "lst-1",
        "requested_listing_title": "Linen Summer Shirt",
        "requested_listing_image": listings[0]["images"][0],
        "message": "Would you swap for this Nike hoodie? Happy to add more photos.",
        "status": "pending",
        "match_score": 88,
        "eco_impact": "Keeps one activewear item in circulation.",
        "suggested_action": "Ask for one fit photo before accepting.",
        "created_at": now(),
    },
    {
        "id": "swap-3",
        "requester_id": "user-demo",
        "requester_name": "Aarav Sharma",
        "target_user_id": "user-3",
        "target_user_name": "Riya Menon",
        "offered_listing_id": "lst-1",
        "offered_listing_title": "Linen Summer Shirt",
        "offered_listing_image": listings[0]["images"][0],
        "requested_listing_id": "lst-3",
        "requested_listing_title": "White Court Sneakers",
        "requested_listing_image": listings[2]["images"][0],
        "message": "The sneakers would be perfect for daily wear. Open to this trade?",
        "status": "accepted",
        "match_score": 91,
        "eco_impact": "Estimated reuse value: INR 4,500 of wardrobe life.",
        "suggested_action": "Chat to confirm pickup or shipping details.",
        "created_at": now(),
    },
    {
        "id": "swap-4",
        "requester_id": "user-demo",
        "requester_name": "Aarav Sharma",
        "target_user_id": "user-8",
        "target_user_name": "Dev Banerjee",
        "offered_listing_id": "lst-1",
        "offered_listing_title": "Linen Summer Shirt",
        "offered_listing_image": listings[0]["images"][0],
        "requested_listing_id": "lst-8",
        "requested_listing_title": "Navy Blazer",
        "requested_listing_image": listings[7]["images"][0],
        "message": "I can swap the linen shirt and include the tote if you want.",
        "status": "pending",
        "match_score": 79,
        "eco_impact": "Extends the life of a formalwear piece.",
        "suggested_action": "Wait for response, or offer another item to balance value.",
        "created_at": now(),
    },
]
chat_rooms: list[dict[str, Any]] = [
    {
        "room_id": "swap-1",
        "swap_id": "swap-1",
        "swap_status": "pending",
        "other_user_name": "Nisha Rao",
        "offered_listing_title": "Floral Midi Dress",
        "requested_listing_title": "Linen Summer Shirt",
        "last_message": "I love the linen shirt. My dress is in excellent condition and ready to ship.",
        "updated_at": now(),
    },
    {
        "room_id": "swap-2",
        "swap_id": "swap-2",
        "swap_status": "pending",
        "other_user_name": "Meera Shah",
        "offered_listing_title": "Cropped Workout Hoodie",
        "requested_listing_title": "Linen Summer Shirt",
        "last_message": "Would you swap for this Nike hoodie? Happy to add more photos.",
        "updated_at": now(),
    },
    {
        "room_id": "swap-3",
        "swap_id": "swap-3",
        "swap_status": "accepted",
        "other_user_name": "Riya Menon",
        "offered_listing_title": "Linen Summer Shirt",
        "requested_listing_title": "White Court Sneakers",
        "last_message": "The sneakers would be perfect for daily wear. Open to this trade?",
        "updated_at": now(),
    },
    {
        "room_id": "room-1",
        "swap_id": "demo-swap",
        "swap_status": "accepted",
        "other_user_name": "Maya Kapoor",
        "offered_listing_title": "Linen Summer Shirt",
        "requested_listing_title": "Vintage Denim Jacket",
        "last_message": "Would a local pickup work this week?",
        "updated_at": now(),
    }
]
messages: dict[str, list[dict[str, Any]]] = {
    "swap-1": [
        {"id": "msg-1", "sender_id": "user-4", "sender_name": "Nisha Rao", "text": "I love the linen shirt. My dress is in excellent condition and ready to ship.", "created_at": now()}
    ],
    "swap-2": [
        {"id": "msg-2", "sender_id": "user-7", "sender_name": "Meera Shah", "text": "Would you swap for this Nike hoodie? Happy to add more photos.", "created_at": now()}
    ],
    "swap-3": [
        {"id": "msg-3", "sender_id": "user-demo", "sender_name": "Aarav Sharma", "text": "The sneakers would be perfect for daily wear. Open to this trade?", "created_at": now()},
        {"id": "msg-4", "sender_id": "user-3", "sender_name": "Riya Menon", "text": "Yes, that works for me. Can you share one close-up of the shirt fabric?", "created_at": now()},
    ],
    "room-1": [
        {"id": "msg-5", "sender_id": "user-2", "sender_name": "Maya Kapoor", "text": "Would a local pickup work this week?", "created_at": now()}
    ]
}


def gemini_reply(room_id: str, user_text: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return (
            "AI swap assistant is ready, but GEMINI_API_KEY is not set. "
            "Add it to app/backend/.env and restart the backend for live Gemini replies."
        )

    room = next((item for item in chat_rooms if item["room_id"] == room_id), {})
    history = messages.get(room_id, [])[-8:]
    transcript = "\n".join(f"{m.get('sender_name', 'User')}: {m.get('text', '')}" for m in history)
    prompt = (
        "You are SwapWear's friendly AI chat assistant for a clothing exchange marketplace. "
        "Help users negotiate swaps, ask about size/condition/pickup, and keep replies short. "
        "Do not pretend to be the other swap user. Signpost that you are the AI assistant.\n\n"
        f"Swap: {room.get('offered_listing_title', 'an item')} for {room.get('requested_listing_title', 'another item')}.\n"
        f"Recent chat:\n{transcript}\n\n"
        f"Latest user message: {user_text}\n"
        "Reply in 1-2 helpful sentences."
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 120},
    }
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
        return f"AI assistant could not reach Gemini right now. You can still chat normally. ({exc})"


class AuthPayload(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    location: str | None = None


class ListingPayload(BaseModel):
    title: str
    description: str = ""
    category: str = "Tops"
    brand: str = ""
    size: str = "M"
    condition: str = "Good"
    estimated_value: float = 0
    images: list[str] = []
    location: str = ""


class SwapPayload(BaseModel):
    offered_listing_id: str
    requested_listing_id: str
    message: str = ""
    delivery_method: str = "local_pickup"


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in user.items() if k != "password_hash"}


def get_user_by_token(authorization: str | None) -> dict[str, Any]:
    token = (authorization or "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = next((item for item in users if item["id"] == token), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    return user


def listing_with_meta(item: dict[str, Any]) -> dict[str, Any]:
    owner = next((u for u in users if u["id"] == item.get("owner_id")), None)
    return {
        **item,
        "status": item.get("status", "available"),
        "user_id": item.get("owner_id"),
        "user_name": item.get("owner_name"),
        "owner": public_user(owner) if owner else {
            "id": item.get("owner_id"),
            "name": item.get("owner_name"),
            "location": item.get("location"),
            "swap_count": 0,
        },
    }


@app.get("/api/")
def root():
    return {"message": "SwapWear API running"}


@app.post("/api/auth/register")
def register(payload: AuthPayload):
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if any(u["email"].lower() == payload.email.lower() for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": f"user-{uuid4().hex[:8]}",
        "name": payload.name or payload.email.split("@")[0],
        "email": payload.email,
        "bio": "",
        "location": payload.location or "",
        "is_admin": False,
        "role": "user",
        "status": "active",
        "swap_count": 0,
        "password_hash": hashlib.sha256(payload.password.encode("utf-8")).hexdigest(),
        "created_at": now(),
    }
    users.append(user)
    return {"token": user["id"], "user": public_user(user)}


@app.post("/api/auth/login")
def login(payload: AuthPayload):
    user = next((u for u in users if u["email"].lower() == payload.email.lower()), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    expected = user.get("password_hash", "")
    actual = hashlib.sha256(payload.password.encode("utf-8")).hexdigest()
    if not hmac.compare_digest(expected, actual):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("status") == "banned":
        raise HTTPException(status_code=403, detail="Account is banned")
    return {"token": user["id"], "user": public_user(user)}


@app.get("/api/auth/me")
def me(authorization: str | None = Header(default=None)):
    return public_user(get_user_by_token(authorization))


@app.put("/api/users/me")
def update_me(payload: dict[str, Any], authorization: str | None = Header(default=None)):
    user = get_user_by_token(authorization)
    user.update({k: v for k, v in payload.items() if k in {"name", "bio", "location"}})
    return public_user(user)


@app.get("/api/listings")
def get_listings(
    page: int = 1,
    limit: int = 20,
    category: str | None = None,
    search: str | None = None,
    q: str | None = None,
    size: str | None = None,
    condition: str | None = None,
    location: str | None = None,
    sort: str | None = None,
):
    data = [item for item in listings if item.get("status", "available") != "removed"]
    if category:
        data = [item for item in data if item["category"].lower() == category.lower()]
    if size:
        data = [item for item in data if item["size"].lower() == size.lower()]
    if condition:
        data = [item for item in data if item["condition"].lower() == condition.lower()]
    if location:
        data = [item for item in data if location.lower() in item.get("location", "").lower()]
    needle = (search or q or "").lower()
    if needle:
        data = [item for item in data if needle in item["title"].lower() or needle in item["brand"].lower() or needle in item["category"].lower()]
    if sort == "newest":
        data = list(reversed(data))
    elif sort == "value_asc":
        data = sorted(data, key=lambda item: item["estimated_value"])
    elif sort == "value_desc":
        data = sorted(data, key=lambda item: item["estimated_value"], reverse=True)
    total = len(data)
    start = max(page - 1, 0) * limit
    paged = data[start:start + limit]
    pages = max(1, (total + limit - 1) // limit)
    return {"listings": [listing_with_meta(item) for item in paged], "total": total, "page": page, "pages": pages}


@app.get("/api/listings/user/me")
def my_listings():
    return [listing_with_meta(item) for item in listings if item["owner_id"] == demo_user["id"] and item.get("status", "available") == "available"]


@app.get("/api/listings/{listing_id}")
def get_listing(listing_id: str):
    listing = next((item for item in listings if item["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing_with_meta(listing)


@app.get("/api/listings/{listing_id}/matches")
def listing_matches(listing_id: str):
    listing = next((item for item in listings if item["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    value = listing["estimated_value"]
    nearby = [
        item for item in listings
        if item["id"] != listing_id
        and item.get("status", "available") == "available"
        and item.get("location") == listing.get("location")
    ]
    fair = [
        item for item in listings
        if item["id"] != listing_id
        and item.get("status", "available") == "available"
        and abs(item["estimated_value"] - value) <= 1200
    ]
    return {
        "nearby": [listing_with_meta(item) for item in nearby[:4]],
        "fair_value": [listing_with_meta(item) for item in fair[:4]],
    }


@app.post("/api/listings")
def create_listing(payload: ListingPayload):
    item = payload.model_dump()
    item.update(
        id=f"lst-{uuid4().hex[:8]}",
        owner_id=demo_user["id"],
        owner_name=demo_user["name"],
        created_at=now(),
    )
    listings.insert(0, item)
    return item


@app.put("/api/listings/{listing_id}")
def update_listing(listing_id: str, payload: ListingPayload):
    listing = next((item for item in listings if item["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.update(payload.model_dump())
    return listing


@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id: str):
    listings[:] = [item for item in listings if item["id"] != listing_id]
    return {"ok": True}


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    return {"storage_path": f"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1100&fit=crop&sig={uuid4().hex[:6]}"}


@app.post("/api/calculator/estimate")
def estimate(payload: dict[str, Any]):
    condition_bonus = {"Like New": 1.3, "Excellent": 1.15, "Good": 1.0, "Fair": 0.7, "Poor": 0.45}
    base = 1800 + len(str(payload.get("brand", ""))) * 125 + len(str(payload.get("title", ""))) * 65
    return {"estimated_value": round(base * condition_bonus.get(payload.get("condition"), 1))}


@app.post("/api/swaps")
def create_swap(payload: SwapPayload):
    offered = next((item for item in listings if item["id"] == payload.offered_listing_id), listings[0])
    requested = next((item for item in listings if item["id"] == payload.requested_listing_id), listings[-1])
    swap = {
        "id": f"swap-{uuid4().hex[:8]}",
        "requester_id": demo_user["id"],
        "requester_name": demo_user["name"],
        "target_user_id": requested["owner_id"],
        "target_user_name": requested["owner_name"],
        "offered_listing_id": offered["id"],
        "offered_listing_title": offered["title"],
        "offered_listing_image": offered["images"][0] if offered["images"] else "",
        "requested_listing_id": requested["id"],
        "requested_listing_title": requested["title"],
        "requested_listing_image": requested["images"][0] if requested["images"] else "",
        "message": payload.message,
        "status": "pending",
        "delivery_method": payload.delivery_method,
        "value_difference": abs(offered["estimated_value"] - requested["estimated_value"]),
        "courier_estimate": 90 if payload.delivery_method == "courier" else 0,
        "created_at": now(),
    }
    swaps.insert(0, swap)
    chat_rooms.insert(
        0,
        {
            "room_id": swap["id"],
            "swap_id": swap["id"],
            "swap_status": swap["status"],
            "other_user_name": swap["target_user_name"],
            "offered_listing_title": swap["offered_listing_title"],
            "requested_listing_title": swap["requested_listing_title"],
            "last_message": payload.message,
            "updated_at": now(),
        },
    )
    if payload.message:
        messages[swap["id"]] = [
            {
                "id": f"msg-{uuid4().hex[:8]}",
                "sender_id": demo_user["id"],
                "sender_name": demo_user["name"],
                "text": payload.message,
                "created_at": now(),
            }
        ]
    return swap


@app.get("/api/swaps")
def get_swaps():
    return swaps


@app.put("/api/swaps/{swap_id}/{action}")
def update_swap_status(swap_id: str, action: str):
    swap = next((item for item in swaps if item["id"] == swap_id), None)
    if not swap:
        raise HTTPException(status_code=404, detail="Swap not found")
    if action not in {"accept", "reject", "complete"}:
        raise HTTPException(status_code=400, detail="Invalid swap action")
    swap["status"] = {"accept": "accepted", "reject": "rejected", "complete": "completed"}[action]
    room = next((item for item in chat_rooms if item["room_id"] == swap_id), None)
    if room:
        room["swap_status"] = swap["status"]
    return swap


@app.get("/api/chat/rooms")
def get_chat_rooms():
    return chat_rooms


@app.get("/api/chat/rooms/{room_id}/messages")
def get_messages(room_id: str):
    return messages.get(room_id, [])


@app.post("/api/chat/rooms/{room_id}/messages")
def send_message(room_id: str, payload: dict[str, str]):
    text = payload.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    msg = {
        "id": f"msg-{uuid4().hex[:8]}",
        "sender_id": demo_user["id"],
        "sender_name": demo_user["name"],
        "text": text,
        "created_at": now(),
    }
    room_messages = messages.setdefault(room_id, [])
    room_messages.append(msg)

    room = next((item for item in chat_rooms if item["room_id"] == room_id), None)
    if room:
        room["last_message"] = text
        room["updated_at"] = now()

    ai_text = gemini_reply(room_id, text)
    ai_msg = {
        "id": f"msg-{uuid4().hex[:8]}",
        "sender_id": "gemini-assistant",
        "sender_name": "Gemini AI",
        "text": ai_text,
        "created_at": now(),
    }
    room_messages.append(ai_msg)
    if room:
        room["last_message"] = ai_text
        room["updated_at"] = ai_msg["created_at"]

    return {"message": msg, "ai_reply": ai_msg}


@app.get("/api/admin/stats")
def admin_stats():
    completed = len([s for s in swaps if s["status"] == "completed"])
    pending = len([s for s in swaps if s["status"] == "pending"])
    success_rate = round((completed / len(swaps)) * 100) if swaps else 0
    return {
        "total_users": len(users),
        "total_listings": len([item for item in listings if item.get("status", "available") != "removed"]),
        "total_swaps": len(swaps),
        "completed_swaps": completed,
        "pending_swaps": pending,
        "swap_success_rate": success_rate,
        "reports": 0,
    }


@app.get("/api/admin/users")
def admin_users():
    return {"users": [public_user(user) for user in users]}


@app.get("/api/admin/listings")
def admin_listings():
    return {"listings": [listing_with_meta(item) for item in listings]}


@app.get("/api/admin/swaps")
def admin_swaps():
    return {"swaps": swaps}


@app.put("/api/admin/users/{user_id}/ban")
def ban_user(user_id: str):
    user = next((item for item in users if item["id"] == user_id), None)
    if user:
        user["status"] = "active" if user.get("status") == "banned" else "banned"
        return {"message": f"{user['name']} is now {user['status']}", "user": public_user(user)}
    raise HTTPException(status_code=404, detail="User not found")


@app.delete("/api/admin/listings/{listing_id}")
def admin_delete_listing(listing_id: str):
    listing = next((item for item in listings if item["id"] == listing_id), None)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing["status"] = "removed"
    return {"ok": True}
